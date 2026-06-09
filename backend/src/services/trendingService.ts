import pino from 'pino';
import { ArticleModel } from '../models/Article';
import { TrendingModel } from '../models/Trending';
import { AnalyticsModel } from '../models/Analytics';
import { redisGet, redisSet } from '../config/redis';

const logger = pino({ name: 'trendingService' });

const TRENDING_CACHE_TTL = 15 * 60; // 15 minutes in seconds
const TRENDING_PERIODS = ['1h', '24h', '7d', '30d'] as const;

type TrendingPeriod = (typeof TRENDING_PERIODS)[number];

function getPeriodStartDate(period: TrendingPeriod): Date {
  const now = new Date();
  switch (period) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

function getPeriodExpiresAt(period: TrendingPeriod): Date {
  const now = new Date();
  switch (period) {
    case '1h':
      return new Date(now.getTime() + 2 * 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() + 25 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() + 7.5 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000);
  }
}

/**
 * Calculate trending score from analytics data
 * Weights: views=1, uniqueViews=2, shares=5, comments=3, bookmarks=4, likes=2
 */
function calculateScore(metrics: {
  views: number;
  shares: number;
  comments: number;
  bookmarks: number;
  likes: number;
}): number {
  return (
    metrics.views * 1 +
    metrics.shares * 5 +
    metrics.comments * 3 +
    metrics.bookmarks * 4 +
    metrics.likes * 2
  );
}

/**
 * Update trending scores for a given period by aggregating analytics events
 */
export async function updateTrendingForPeriod(period: TrendingPeriod): Promise<void> {
  const since = getPeriodStartDate(period);

  try {
    // Aggregate analytics events in the period
    const aggregated = await AnalyticsModel.aggregate([
      {
        $match: {
          timestamp: { $gte: since },
          eventType: { $in: ['view', 'unique_view', 'share', 'comment', 'bookmark', 'like'] },
        },
      },
      {
        $group: {
          _id: '$articleId',
          categoryId: { $first: '$categoryId' },
          views: {
            $sum: { $cond: [{ $in: ['$eventType', ['view', 'unique_view']] }, 1, 0] },
          },
          shares: { $sum: { $cond: [{ $eq: ['$eventType', 'share'] }, 1, 0] } },
          comments: { $sum: { $cond: [{ $eq: ['$eventType', 'comment'] }, 1, 0] } },
          bookmarks: { $sum: { $cond: [{ $eq: ['$eventType', 'bookmark'] }, 1, 0] } },
          likes: { $sum: { $cond: [{ $eq: ['$eventType', 'like'] }, 1, 0] } },
        },
      },
    ]);

    if (!aggregated.length) {
      // Fall back to article engagement counts if no analytics data
      const articles = await ArticleModel.find({ status: 'published' })
        .select('viewCount shareCount commentCount bookmarkCount likeCount categoryId')
        .lean()
        .limit(50);

      const fallback = articles.map((a) => ({
        _id: a._id,
        categoryId: a.categoryId,
        views: a.viewCount,
        shares: a.shareCount,
        comments: a.commentCount,
        bookmarks: a.bookmarkCount,
        likes: a.likeCount,
      }));

      await saveTrendingResults(fallback, period);
      return;
    }

    await saveTrendingResults(aggregated, period);
  } catch (err) {
    logger.error({ err, period }, 'Failed to update trending scores');
  }
}

async function saveTrendingResults(
  data: Array<{
    _id: unknown;
    categoryId?: unknown;
    views: number;
    shares: number;
    comments: number;
    bookmarks: number;
    likes: number;
  }>,
  period: TrendingPeriod
): Promise<void> {
  // Calculate scores and rank
  const scored = data
    .map((item) => ({
      articleId: item._id,
      categoryId: item.categoryId || null,
      metrics: {
        views: item.views,
        shares: item.shares,
        comments: item.comments,
        bookmarks: item.bookmarks,
        likes: item.likes,
      },
      score: calculateScore({
        views: item.views,
        shares: item.shares,
        comments: item.comments,
        bookmarks: item.bookmarks,
        likes: item.likes,
      }),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20); // Keep top 20

  const expiresAt = getPeriodExpiresAt(period);
  const now = new Date();

  // Upsert trending documents
  const bulkOps = scored.map((item, index) => ({
    updateOne: {
      filter: { articleId: item.articleId, period },
      update: {
        $set: {
          articleId: item.articleId,
          categoryId: item.categoryId,
          period,
          score: item.score,
          rankPosition: index + 1,
          metrics: item.metrics,
          lastUpdated: now,
          expiresAt,
        },
      },
      upsert: true,
    },
  }));

  if (bulkOps.length > 0) {
    await TrendingModel.bulkWrite(bulkOps);
  }

  // Invalidate Redis cache for this period
  await redisSet(`trending:${period}`, '', 0);

  logger.info({ period, count: scored.length }, 'Trending updated');
}

/**
 * Get trending articles for a period (with Redis cache)
 */
export async function getTrending(period: TrendingPeriod = '24h', limit = 10) {
  const cacheKey = `trending:${period}:${limit}`;

  // Check cache first
  const cached = await redisGet(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // Cache corrupted — fall through to DB
    }
  }

  // Query DB
  const trending = await TrendingModel.find({ period })
    .sort({ rankPosition: 1 })
    .limit(limit)
    .populate({
      path: 'articleId',
      select: 'title slug excerpt featuredImage authorId categoryId viewCount publishedAt estimatedReadingTime',
      populate: [
        { path: 'authorId', select: 'name slug avatar' },
        { path: 'categoryId', select: 'name slug color' },
      ],
    })
    .lean();

  // Cache result
  await redisSet(cacheKey, JSON.stringify(trending), TRENDING_CACHE_TTL);

  return trending;
}

/**
 * Update all trending periods
 */
export async function updateAllTrending(): Promise<void> {
  logger.info('Starting trending update for all periods...');

  for (const period of TRENDING_PERIODS) {
    await updateTrendingForPeriod(period);
  }

  logger.info('Trending update complete for all periods');
}
