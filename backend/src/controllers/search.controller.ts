import { Request, Response } from 'express';
import { Article } from '../models/Article';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';

export const searchArticles = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { q } = req.query;

  const filter: any = { status: 'published' };
  if (q && typeof q === 'string') {
    filter.$text = { $search: q };
  }

  const [articles, total] = await Promise.all([
    Article.find(filter)
      .sort(q ? { score: { $meta: 'textScore' } } : { publishedAt: -1 })
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

export const getSuggestions = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(200).json({ success: true, data: [] });
  }

  const articles = await Article.find({ 
    status: 'published',
    title: { $regex: q, $options: 'i' }
  }).select('title slug').limit(5).lean();

  res.status(200).json({ success: true, data: articles });
});
