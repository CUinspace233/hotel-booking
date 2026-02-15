import bcrypt from 'bcryptjs';
import type { User } from '.prisma/client';
import { userRepository, CreateUserParams, UserRole } from '../repositories/userRepository';
import { generateTokenPair, JwtPayload, TokenPair } from '../utils/jwt';

// 登录参数
export interface LoginParams {
  username: string;
  password: string;
  role: UserRole;
}

// 注册参数
export interface RegisterParams {
  username: string;
  password: string;
  email?: string; // 邮箱可选
  phone: string;
  role?: UserRole;
}

// 登录返回结果（双 Token）
export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}

// 服务层错误类
export class ServiceError extends Error {
  code: number;

  constructor(message: string, code = 400) {
    super(message);
    this.code = code;
    this.name = 'ServiceError';
  }
}

/**
 * 用户业务逻辑层（Service）
 * 负责处理业务逻辑
 */
class UserService {
  /**
   * 用户登录
   * 返回双 Token（Access Token + Refresh Token）
   */
  async login(params: LoginParams): Promise<LoginResult> {
    const { username, password, role } = params;

    // 查找用户
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new ServiceError('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ServiceError('用户名或密码错误');
    }

    // 验证角色
    if (user.role !== role) {
      throw new ServiceError(`该账号不是${role === 'admin' ? '管理员' : '商户'}角色`);
    }

    // 验证状态
    if (user.status !== 1) {
      throw new ServiceError('该账号已被禁用');
    }

    // 生成双 Token
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      role: user.role
    };
    const tokenPair: TokenPair = generateTokenPair(payload);

    // 返回结果（排除密码）
    const { password: _, ...userWithoutPassword } = user;
    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      user: userWithoutPassword
    };
  }

  /**
   * 用户注册
   */
  async register(params: RegisterParams): Promise<Omit<User, 'password'>> {
    const { username, password, email, phone, role } = params;

    // 检查用户名是否已存在
    const existingUser = await userRepository.findByUsername(username);
    if (existingUser) {
      throw new ServiceError('用户名已存在');
    }

    // 检查邮箱是否已存在（仅当邮箱有值时检查）
    if (email) {
      const existingEmail = await userRepository.findByEmail(email);
      if (existingEmail) {
        throw new ServiceError('邮箱已被注册');
      }
    }

    // 检查手机号是否已存在
    const existingPhone = await userRepository.findByPhone(phone);
    if (existingPhone) {
      throw new ServiceError('手机号已被注册');
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    const createParams: CreateUserParams = {
      username,
      password: hashedPassword,
      email: email || undefined, // 邮箱可选
      phone,
      role: role || 'merchant'
    };
    const user = await userRepository.create(createParams);

    // 返回结果（排除密码）
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * 根据ID获取用户信息
   */
  async getUserById(id: number): Promise<Omit<User, 'password'> | null> {
    const user = await userRepository.findById(id);
    if (!user) {
      return null;
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * 修改密码
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ServiceError('用户不存在', 404);
    }

    // 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new ServiceError('原密码错误');
    }

    // 加密新密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 更新密码
    await userRepository.update(userId, { password: hashedPassword });
    return true;
  }
}

// 导出单例
export const userService = new UserService();
