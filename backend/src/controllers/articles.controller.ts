import { Request, Response } from 'express';
import { Article } from '../models/Article';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { generateUniqueSlug } from '../utils/slugify';
import { Analytics } from '../models/Analytics';

export const listArticles = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter: any = { status: 'published' };

  if (req.query.categoryId) filter.categoryId = req.query.categoryId;
  if (req.query.authorId) filter.authorId = req.query.authorId;
  if (req.query.isBreaking === 'true') filter.isBreaking = true;
  if (req.query.isFeatured === 'true') filter.isFeatured = true;

  const [articles, total] = await Promise.all([
    Article.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug color')
      .populate('author', 'name slug avatar')
      .lean(),
    Article.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: articles,
    pagination: buildPaginationMeta(total, page, limit),
  });
});

export const getArticleBySlug = asyncHandler(async (req: Request, res: Response) => {
  const article = await Article.findOne({ slug: req.params.slug, status: 'published' })
    .populate('category')
    .populate('author')
    .populate('tags')
    .lean();

  if (!article) throw ApiError.notFound('Article not found');

  const relatedArticles = await Article.find({
    categoryId: article.categoryId,
    _id: { $ne: article._id },
    status: 'published'
  }).limit(4).lean();

  res.status(200).json({ success: true, data: { ...article, relatedArticles } });
});

export const createArticle = asyncHandler(async (req: Request, res: Response) => {
  req.body.authorId = req.user?.id;
  if (!req.body.slug) {
    req.body.slug = await generateUniqueSlug(req.body.title, Article);
  }

  const article = await Article.create(req.body);
  res.status(201).json({ success: true, data: article });
});

export const trackView = asyncHandler(async (req: Request, res: Response) => {
  const articleId = req.params.id;
  await Article.findByIdAndUpdate(articleId, { $inc: { viewCount: 1 } });
  
  await Analytics.create({
    eventType: 'view',
    articleId,
    timestamp: new Date(),
    userAgent: req.headers['user-agent']
  });

  res.status(200).json({ success: true });
});
