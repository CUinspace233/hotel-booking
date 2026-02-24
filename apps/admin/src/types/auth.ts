/**
 * 认证相关类型定义
 */

import type { UserRole } from '@/store';

/** 登录请求参数 */
export interface LoginParams {
  username: string;
  password: string;
  role: UserRole;
}

/** 登录响应数据 */
export interface LoginResult {
  user: {
    id: number;
    username: string;
    email: string;
    phone: string;
    role: UserRole;
  };
  token: string;
}

/** 注册请求参数 */
export interface RegisterParams {
  username: string;
  password: string;
  email?: string;
  phone: string;
  role?: UserRole;
}

/** 注册响应数据 */
export interface RegisterResult {
  id: number;
  username: string;
  email?: string;
  phone: string;
  role: UserRole;
}

/** 用户信息 */
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/** 修改密码请求参数 */
export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}
