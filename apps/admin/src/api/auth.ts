import { rpc } from '@/utils/rpc';
import type {
  LoginParams,
  LoginResult,
  RegisterParams,
  RegisterResult,
  UserProfile,
  ChangePasswordParams
} from '@/types';

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
