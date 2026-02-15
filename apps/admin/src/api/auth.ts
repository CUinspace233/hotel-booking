import { rpc } from '@/utils/rpc';
import type { UserRole } from '@/store';

/**
 * 登录请求参数
 */
export interface LoginParams {
  username: string;
  password: string;
  role: UserRole;
}

/**
 * 登录响应数据
 */
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

/**
 * 注册请求参数
 */
export interface RegisterParams {
  username: string;
  password: string;
  email?: string; // 邮箱可选
  phone: string;
  role?: UserRole;
}

/**
 * 注册响应数据
 */
export interface RegisterResult {
  id: number;
  username: string;
  email?: string; // 邮箱可选
  phone: string;
  role: UserRole;
}

/**
 * 用户信息
 */
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/**
 * 修改密码请求参数
 */
export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

/**
 * 认证相关 API
 */
export const authApi = {
  /**
   * 用户登录
   * @param params 登录参数
   */
  login(params: LoginParams): Promise<LoginResult> {
    return rpc.post<LoginResult>('/auth/login', params, { skipAuth: true });
  },

  /**
   * 用户注册
   * @param params 注册参数
   */
  register(params: RegisterParams): Promise<RegisterResult> {
    return rpc.post<RegisterResult>('/auth/register', params, { skipAuth: true });
  },

  /**
   * 获取当前用户信息
   */
  getProfile(): Promise<UserProfile> {
    return rpc.get<UserProfile>('/auth/profile');
  },

  /**
   * 修改密码
   * @param params 修改密码参数
   */
  changePassword(params: ChangePasswordParams): Promise<null> {
    return rpc.put<null>('/auth/password', params);
  }
};

export default authApi;
