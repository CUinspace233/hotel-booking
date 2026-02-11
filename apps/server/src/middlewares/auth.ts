import { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../repositories/userRepository';
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  extractToken,
  JwtPayload
} from '../utils/jwt';
import { encrypt, decrypt } from '../utils/crypto';
import { ResponseUtil } from '../utils/response';

// Cookie 配置
const COOKIE_OPTIONS = {
  httpOnly: true, // 防止 XSS 攻击
  secure: process.env.NODE_ENV === 'production', // 生产环境使用 HTTPS
  sameSite: 'strict' as const, // 防止 CSRF 攻击
  path: '/'
};

// Access Token Cookie 有效期（15 分钟）
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
// Refresh Token Cookie 有效期（7 天）
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// Cookie 名称
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token'
};

// 扩展 Request 类型，添加用户信息
export interface AuthenticatedRequest extends Request {
  userId: number;
  username: string;
  userRole: UserRole;
}

/**
 * 设置加密后的 Token 到 Cookie
 */
export const setTokenCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  // 加密 Token
  const encryptedAccessToken = encrypt(accessToken);
  const encryptedRefreshToken = encrypt(refreshToken);

  // 设置 Access Token Cookie
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, encryptedAccessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MAX_AGE
  });

  // 设置 Refresh Token Cookie
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, encryptedRefreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE
  });
};

/**
 * 清除 Token Cookie（用于登出）
 */
export const clearTokenCookies = (res: Response): void => {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, { ...COOKIE_OPTIONS });
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, { ...COOKIE_OPTIONS });
};

/**
 * 身份验证中间件
 * 支持从 Cookie 和 Authorization Header 两种方式获取 Token
 * 支持 Access Token 过期时自动使用 Refresh Token 刷新（无感刷新）
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  // 优先从 Cookie 获取 Token
  const encryptedAccessToken = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
  const encryptedRefreshToken = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];

  // 备用：从 Authorization Header 获取（兼容旧方式）
  const authHeader = req.headers.authorization;
  const headerToken = extractToken(authHeader);

  // 1. 尝试从 Cookie 中获取并验证 Access Token
  if (encryptedAccessToken) {
    const accessToken = decrypt(encryptedAccessToken);
    if (accessToken) {
      const payload = verifyAccessToken(accessToken);
      if (payload) {
        // Access Token 有效，设置用户信息
        (req as AuthenticatedRequest).userId = payload.userId;
        (req as AuthenticatedRequest).username = payload.username;
        (req as AuthenticatedRequest).userRole = payload.role;
        return next();
      }
    }
  }

  // 2. Access Token 无效或过期，尝试使用 Refresh Token 刷新
  if (encryptedRefreshToken) {
    const refreshToken = decrypt(encryptedRefreshToken);
    if (refreshToken) {
      const payload = verifyRefreshToken(refreshToken);
      if (payload) {
        // Refresh Token 有效，生成新的双 Token
        const newPayload: JwtPayload = {
          userId: payload.userId,
          username: payload.username,
          role: payload.role
        };
        const tokenPair = generateTokenPair(newPayload);

        // 设置新的 Cookie（无感刷新）
        setTokenCookies(res, tokenPair.accessToken, tokenPair.refreshToken);

        // 设置用户信息
        (req as AuthenticatedRequest).userId = payload.userId;
        (req as AuthenticatedRequest).username = payload.username;
        (req as AuthenticatedRequest).userRole = payload.role;

        console.log(`[Auth] Token 已自动刷新，用户: ${payload.username}`);
        return next();
      }
    }
  }

  // 3. 兼容旧方式：从 Authorization Header 获取 Token
  if (headerToken) {
    const payload = verifyAccessToken(headerToken);
    if (payload) {
      (req as AuthenticatedRequest).userId = payload.userId;
      (req as AuthenticatedRequest).username = payload.username;
      (req as AuthenticatedRequest).userRole = payload.role;
      return next();
    }
  }

  // 所有认证方式都失败
  return ResponseUtil.unauthorized(res, '请先登录');
};

/**
 * 角色验证中间件工厂
 * 验证用户是否具有指定角色
 */
export const roleMiddleware = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const userRole = (req as AuthenticatedRequest).userRole;

    if (!allowedRoles.includes(userRole)) {
      return ResponseUtil.forbidden(res, '您没有权限访问此资源');
    }

    next();
  };
};

/**
 * 仅管理员可访问的中间件
 */
export const adminOnly = roleMiddleware('admin');

/**
 * 仅商户可访问的中间件
 */
export const merchantOnly = roleMiddleware('merchant');
