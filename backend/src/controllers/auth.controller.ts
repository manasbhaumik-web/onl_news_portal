import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import crypto from 'crypto';
import { env } from '../config/env';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw ApiError.conflict('Username or email already exists');
  }

  const user = await User.create({
    username,
    email,
    password,
    role: 'user',
    emailVerified: false,
    subscriptionTier: 'free',
  });

  const verifyToken = crypto.randomBytes(20).toString('hex');
  user.emailVerifyToken = verifyToken;
  await user.save({ validateBeforeSave: false });

  // Stub email sending here
  console.log(`Verify email link: ${env.CLIENT_URL}/verify-email?token=${verifyToken}`);

  const userJson = user.toJSON();
  delete userJson.password;

  res.status(201).json({
    success: true,
    data: userJson,
    message: 'User registered successfully. Please verify your email.',
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.status !== 'active') {
    throw ApiError.forbidden('Account is not active');
  }

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  res.cookie('jwt', accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const userJson = user.toJSON();
  delete userJson.password;

  res.status(200).json({
    success: true,
    data: { user: userJson, accessToken },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.cookie('jwt', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) throw ApiError.unauthorized('No refresh token provided');

  try {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);
    if (!user || user.status !== 'active') throw ApiError.unauthorized('Invalid token or user inactive');

    const accessToken = signAccessToken(user.id, user.role);
    res.cookie('jwt', accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ success: true, data: { accessToken } });
  } catch (error) {
    throw ApiError.unauthorized('Invalid refresh token');
  }
});
