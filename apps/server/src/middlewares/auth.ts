import { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../repositories/userRepository';
import { extractToken, verifyToken } from '../utils/jwt';
import { ResponseUtil } from '../utils/response';

// 扩展 Request 类型，添加用户信息
export interface AuthenticatedRequest extends Request {
  userId: number;
  username: string;
  userRole: UserRole;
}

/**
 * 身份验证中间件
 * 验证 JWT Token，并将用户信息注入到 Request 对象
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const authHeader = req.headers.authorization;
  const token = extractToken(authHeader);

  if (!token) {
    return ResponseUtil.unauthorized(res, '请先登录');
  }

  const payload = verifyToken(token);
  if (!payload) {
    return ResponseUtil.unauthorized(res, 'Token 无效或已过期，请重新登录');
  }

  // 将用户信息注入到 Request 对象
  (req as AuthenticatedRequest).userId = payload.userId;
  (req as AuthenticatedRequest).username = payload.username;
  (req as AuthenticatedRequest).userRole = payload.role;

  next();
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
