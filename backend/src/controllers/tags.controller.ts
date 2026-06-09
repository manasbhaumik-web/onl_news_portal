import { Request, Response } from 'express';
import { Tag } from '../models/Tag';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { generateUniqueSlug } from '../utils/slugify';

export const listTags = asyncHandler(async (req: Request, res: Response) => {
  const tags = await Tag.find().sort({ articleCount: -1 }).lean();
  res.status(200).json({ success: true, data: tags });
});

export const getTagBySlug = asyncHandler(async (req: Request, res: Response) => {
  const tag = await Tag.findOne({ slug: req.params.slug }).lean();
  if (!tag) throw ApiError.notFound('Tag not found');
  res.status(200).json({ success: true, data: tag });
});

export const createTag = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body.slug) req.body.slug = await generateUniqueSlug(req.body.name, Tag);
  const tag = await Tag.create(req.body);
  res.status(201).json({ success: true, data: tag });
});
