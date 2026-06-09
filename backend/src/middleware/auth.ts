import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { UserModel } from '../models/User';

export interface AuthUser {
  _id: string;
  role: string;
  email: string;
  username: string;
  status: string;
  subscriptionTier: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function extractToken(req: Request): string | null {
  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Fall back to httpOnly cookie
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken as string;
  }

  return null;
}

export const requireAuth: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractToken(req);

  if (!token) {
    next(ApiError.unauthorized('Authentication required'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    const user = await UserModel.findById(payload.userId)
      .select('-passwordHash -emailVerifyToken -passwordResetToken -passwordResetExpires -twoFactorSecret')
      .lean();

    if (!user) {
      next(ApiError.unauthorized('User not found'));
      return;
    }

    if (user.status === 'suspended' || user.status === 'deleted') {
      next(ApiError.forbidden('Account is suspended or deleted'));
      return;
    }

    req.user = {
      _id: (user._id as { toString(): string }).toString(),
      role: user.role,
      email: user.email,
      username: user.username,
      status: user.status,
      subscriptionTier: user.subscriptionTier,
    };

    next();
  } catch (err) {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
};

export const optionalAuth: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractToken(req);

  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    const user = await UserModel.findById(payload.userId)
      .select('-passwordHash -emailVerifyToken -passwordResetToken -passwordResetExpires -twoFactorSecret')
      .lean();

    if (user && user.status === 'active') {
      req.user = {
        _id: (user._id as { toString(): string }).toString(),
        role: user.role,
        email: user.email,
        username: user.username,
        status: user.status,
        subscriptionTier: user.subscriptionTier,
      };
    }
  } catch {
    // Token invalid — continue without user attached
  }

  next();
};

const ROLE_HIERARCHY: Record<string, number> = {
  user: 1,
  author: 2,
  editor: 3,
  admin: 4,
  super_admin: 5,
};

export function requireRole(...roles: string[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'));
      return;
    }

    const userRoleLevel = ROLE_HIERARCHY[req.user.role] ?? 0;
    const hasPermission = roles.some((role) => {
      const requiredLevel = ROLE_HIERARCHY[role] ?? 0;
      return userRoleLevel >= requiredLevel;
    });

    if (!hasPermission) {
      next(ApiError.forbidden(`Access denied. Required role: ${roles.join(' or ')}`));
      return;
    }

    next();
  };
}
