import jwt from 'jsonwebtoken';
import type { UserRole } from '../repositories/userRepository';

// JWT 载荷类型
export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
}

// Token 类型
export type TokenType = 'access' | 'refresh';

// 双 Token 结果
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// 获取JWT配置
const getJwtConfig = () => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key';
  // Access Token 有效期：15 分钟
  const accessExpiresIn = parseInt(process.env.JWT_ACCESS_EXPIRES_IN || '900', 10);
  // Refresh Token 有效期：7 天
  const refreshExpiresIn = parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800', 10);
  return { secret, refreshSecret, accessExpiresIn, refreshExpiresIn };
};

/**
 * 生成 Access Token
 * 有效期较短（15分钟），用于业务请求认证
 */
export const generateAccessToken = (payload: JwtPayload): string => {
  const { secret, accessExpiresIn } = getJwtConfig();
  return jwt.sign({ ...payload, type: 'access' }, secret, { expiresIn: accessExpiresIn });
};

/**
 * 生成 Refresh Token
 * 有效期较长（7天），用于刷新 Access Token
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
  const { refreshSecret, refreshExpiresIn } = getJwtConfig();
  return jwt.sign({ ...payload, type: 'refresh' }, refreshSecret, { expiresIn: refreshExpiresIn });
};

/**
 * 生成双 Token
 */
export const generateTokenPair = (payload: JwtPayload): TokenPair => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

/**
 * 验证 Access Token
 */
export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    const { secret } = getJwtConfig();
    const decoded = jwt.verify(token, secret) as JwtPayload & { type: string };
    if (decoded.type !== 'access') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
};

/**
 * 验证 Refresh Token
 */
export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    const { refreshSecret } = getJwtConfig();
    const decoded = jwt.verify(token, refreshSecret) as JwtPayload & { type: string };
    if (decoded.type !== 'refresh') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
};

/**
 * 生成 JWT Token（兼容旧接口）
 * @deprecated 使用 generateTokenPair 替代
 */
export const generateToken = (payload: JwtPayload): string => {
  return generateAccessToken(payload);
};

/**
 * 验证 JWT Token（兼容旧接口）
 * @deprecated 使用 verifyAccessToken 替代
 */
export const verifyToken = (token: string): JwtPayload | null => {
  return verifyAccessToken(token);
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
