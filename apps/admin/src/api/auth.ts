import { rpc } from '@/utils/rpc';
import { encryptPassword } from '@/utils/crypto';
import type {
  LoginParams,
  LoginResult,
  RegisterParams,
  RegisterResult,
  UserProfile,
  ChangePasswordParams
} from '@/types';

/** 公钥缓存（进程内，页面刷新后重新获取） */
let cachedPublicKey: string | null = null;

async function getPublicKey(): Promise<string> {
  if (cachedPublicKey) return cachedPublicKey;
  const data = await rpc.get<{ publicKey: string }>('/auth/public-key', undefined, {
    skipAuth: true
  });
  cachedPublicKey = data.publicKey;
  return cachedPublicKey;
}

/**
 * 认证相关 API
 */
export const authApi = {
  /**
   * 用户登录（密码在前端 RSA 加密后传输）
   * @param params 登录参数
   */
  async login(params: LoginParams): Promise<LoginResult> {
    const publicKey = await getPublicKey();
    const encryptedParams = {
      ...params,
      password: await encryptPassword(params.password, publicKey)
    };
    return rpc.post<LoginResult>('/auth/login', encryptedParams, { skipAuth: true });
  },

  /**
   * 用户注册（密码在前端 RSA 加密后传输）
   * @param params 注册参数
   */
  async register(params: RegisterParams): Promise<RegisterResult> {
    const publicKey = await getPublicKey();
    const encryptedParams = {
      ...params,
      password: await encryptPassword(params.password, publicKey)
    };
    return rpc.post<RegisterResult>('/auth/register', encryptedParams, {
      skipAuth: true
    });
  },

  /**
   * 获取当前用户信息
   */
  getProfile(): Promise<UserProfile> {
    return rpc.get<UserProfile>('/auth/profile');
  },

  /**
   * 修改密码（密码在前端 RSA 加密后传输）
   * @param params 修改密码参数
   */
  async changePassword(params: ChangePasswordParams): Promise<null> {
    const publicKey = await getPublicKey();
    const encryptedParams = {
      oldPassword: await encryptPassword(params.oldPassword, publicKey),
      newPassword: await encryptPassword(params.newPassword, publicKey)
    };
    return rpc.put<null>('/auth/password', encryptedParams);
  }
};

export default authApi;
