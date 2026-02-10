import jwt from 'jsonwebtoken';
import type { UserRole } from '../repositories/userRepository';

// JWT 载荷类型
export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
}

// 获取JWT配置
const getJwtConfig = () => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  const expiresIn = parseInt(process.env.JWT_EXPIRES_IN || '604800', 10); // 默认7天
  return { secret, expiresIn };
};

/**
 * 生成 JWT Token
 */
export const generateToken = (payload: JwtPayload): string => {
  const { secret, expiresIn } = getJwtConfig();
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * 验证 JWT Token
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const { secret } = getJwtConfig();
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
};

/**
 * 从请求头中提取 Token
 */
export const extractToken = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7); // 移除 'Bearer ' 前缀
};
