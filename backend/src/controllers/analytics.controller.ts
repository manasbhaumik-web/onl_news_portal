import { Request, Response } from 'express';
import { Analytics } from '../models/Analytics';
import { Article } from '../models/Article';
import { asyncHandler } from '../utils/asyncHandler';

export const trackEvent = asyncHandler(async (req: Request, res: Response) => {
  const { eventType, articleId } = req.body;
  
  await Analytics.create({
    eventType,
    articleId,
    userId: req.user?.id || null,
    timestamp: new Date(),
    userAgent: req.headers['user-agent'],
    ip: req.ip
  });

  res.status(200).json({ success: true });
});

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const totalArticles = await Article.countDocuments();
  const totalViews = await Article.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]);
  
  res.status(200).json({ 
    success: true, 
    data: { 
      totalArticles, 
      totalViews: totalViews[0]?.total || 0 
    } 
  });
});
