import { Request, Response } from 'express';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id).lean();
  if (!user) throw ApiError.notFound('User not found');
  res.status(200).json({ success: true, data: user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.user?.id, 
    { $set: { profile: req.body } },
    { new: true, runValidators: true }
  ).lean();
  
  if (!user) throw ApiError.notFound('User not found');
  res.status(200).json({ success: true, data: user });
});

export const getPublicProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({ username: req.params.username })
    .select('username profile role registeredAt')
    .lean();
    
  if (!user) throw ApiError.notFound('User not found');
  res.status(200).json({ success: true, data: user });
});
