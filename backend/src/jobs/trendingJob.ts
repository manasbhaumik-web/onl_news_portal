import cron from 'node-cron';
import { Trending } from '../models/Trending';
import { ArticleModel as Article } from '../models/Article';

// Calculate trending score based on formula:
// views * 1.0 + shares * 5.0 + comments * 3.0 + bookmarks * 2.0
// Decayed by time since published
async function calculateTrending() {
  console.log('Running trending calculation job...');
  try {
    const articles = await Article.find({ status: 'published' }).lean();

    const scoredArticles = articles.map((article: any) => {
      const views = article.viewCount || 0;
      const shares = article.shareCount || 0;
      const comments = article.commentCount || 0;
      const bookmarks = article.bookmarkCount || 0;

      let score = (views * 1.0) + (shares * 5.0) + (comments * 3.0) + (bookmarks * 2.0);

      // Decay penalty: (hours + 2) ^ 1.5
      const hoursSincePublish = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
      const decay = Math.pow(Math.max(hoursSincePublish, 0) + 2, 1.5);

      const finalScore = score / decay;

      return {
        articleId: article._id,
        categoryId: article.categoryId,
        score: finalScore,
        metrics: { views, shares, comments, bookmarks },
      };
    });

    // Sort descending by score
    scoredArticles.sort((a, b) => b.score - a.score);

    // Save top 50 to Trending collection (24h period)
    const topArticles = scoredArticles.slice(0, 50).map((a, index) => ({
      ...a,
      period: '24h',
      rankPosition: index + 1,
      lastUpdated: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h TTL
    }));

    // In a real app, we'd do a bulk upsert to avoid dropping the collection completely
    await Trending.deleteMany({ period: '24h' });
    if (topArticles.length > 0) {
      await Trending.insertMany(topArticles);
    }
    
    console.log('Trending job complete.');
  } catch (error) {
    console.error('Error calculating trending articles:', error);
  }
}

export function startCronJobs() {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', calculateTrending);
  
  // Calculate immediately on start for testing
  calculateTrending();
}
