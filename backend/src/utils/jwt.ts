import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface AccessTokenPayload {
  userId: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

export function signAccessToken(userId: string, role: string): string {
  return jwt.sign(
    { userId, role } as AccessTokenPayload,
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRE } as jwt.SignOptions
  );
}

export function signRefreshToken(userId: string): string {
  return jwt.sign(
    { userId } as RefreshTokenPayload,
    config.REFRESH_TOKEN_SECRET,
    { expiresIn: config.REFRESH_TOKEN_EXPIRE } as jwt.SignOptions
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.JWT_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, config.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
}
