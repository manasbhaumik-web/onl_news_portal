import { Request, Response } from 'express';
import { Comment } from '../models/Comment';
import { Article } from '../models/Article';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';

export const listComments = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { articleId } = req.params;

  const query = { articleId, status: 'approved', parentCommentId: null };

  const [comments, total] = await Promise.all([
    Comment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username profile.avatar profile.name')
      .lean(),
    Comment.countDocuments(query),
  ]);

  // Optionally fetch replies here if needed or lazily load them
  res.status(200).json({
    success: true,
    data: comments,
    pagination: buildPaginationMeta(total, page, limit),
  });
});

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const { articleId } = req.params;
  const { content, parentCommentId } = req.body;
  const userId = req.user?.id;

  let depth = 0;
  if (parentCommentId) {
    const parent = await Comment.findById(parentCommentId);
    if (!parent) throw ApiError.notFound('Parent comment not found');
    depth = parent.depth + 1;
    if (depth > 5) throw ApiError.badRequest('Maximum reply depth exceeded');
  }

  const comment = await Comment.create({
    articleId,
    userId,
    content,
    parentCommentId,
    depth,
    status: 'approved' // Set pending if moderation needed
  });

  await Article.findByIdAndUpdate(articleId, { $inc: { commentCount: 1 } });
  
  res.status(201).json({ success: true, data: comment });
});

export const voteComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type } = req.body; // 'up' or 'down'

  const update = type === 'up' ? { $inc: { votesUp: 1 } } : { $inc: { votesDown: 1 } };
  const comment = await Comment.findByIdAndUpdate(id, update, { new: true });
  
  if (!comment) throw ApiError.notFound('Comment not found');
  res.status(200).json({ success: true, data: comment });
});
