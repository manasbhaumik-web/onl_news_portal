import { Request, Response } from 'express';
import { Bookmark } from '../models/Bookmark';
import { Article } from '../models/Article';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

export const listBookmarks = asyncHandler(async (req: Request, res: Response) => {
  const bookmarks = await Bookmark.find({ userId: req.user?.id })
    .populate({
      path: 'article',
      select: 'title slug excerpt featuredImage publishedAt',
      populate: { path: 'category', select: 'name color slug' }
    })
    .sort({ createdAt: -1 })
    .lean();
    
  res.status(200).json({ success: true, data: bookmarks });
});

export const addBookmark = asyncHandler(async (req: Request, res: Response) => {
  const { articleId } = req.body;
  
  const existing = await Bookmark.findOne({ userId: req.user?.id, articleId });
  if (existing) throw ApiError.conflict('Article already bookmarked');

  const bookmark = await Bookmark.create({
    userId: req.user?.id,
    articleId,
    collection: req.body.collection
  });

  await Article.findByIdAndUpdate(articleId, { $inc: { bookmarkCount: 1 } });

  res.status(201).json({ success: true, data: bookmark });
});

export const removeBookmark = asyncHandler(async (req: Request, res: Response) => {
  const bookmark = await Bookmark.findOneAndDelete({ 
    userId: req.user?.id, 
    articleId: req.params.articleId 
  });
  
  if (!bookmark) throw ApiError.notFound('Bookmark not found');
  
  await Article.findByIdAndUpdate(req.params.articleId, { $inc: { bookmarkCount: -1 } });

  res.status(200).json({ success: true, message: 'Bookmark removed' });
});
