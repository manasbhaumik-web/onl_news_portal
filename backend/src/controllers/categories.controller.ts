import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { Article } from '../models/Article';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { generateUniqueSlug } from '../utils/slugify';

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await Category.find({ status: 'active' }).sort({ sortOrder: 1 }).lean();
  res.status(200).json({ success: true, data: categories });
});

export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findOne({ slug: req.params.slug }).lean();
  if (!category) throw ApiError.notFound('Category not found');
  res.status(200).json({ success: true, data: category });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body.slug) {
    req.body.slug = await generateUniqueSlug(req.body.name, Category);
  }
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) throw ApiError.notFound('Category not found');
  res.status(200).json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const articlesCount = await Article.countDocuments({ categoryId: req.params.id });
  if (articlesCount > 0) {
    throw ApiError.badRequest('Cannot delete category with associated articles');
  }
  
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  
  res.status(200).json({ success: true, message: 'Category deleted' });
});
