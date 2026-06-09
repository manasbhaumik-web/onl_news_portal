import { Request, Response } from 'express';
import { Newsletter } from '../models/Newsletter';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user.id, { 'preferences.newsletterSubscribed': true });
  }
  res.status(200).json({ success: true, message: 'Subscribed to newsletter' });
});

export const getCampaigns = asyncHandler(async (req: Request, res: Response) => {
  const campaigns = await Newsletter.find().sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, data: campaigns });
});
