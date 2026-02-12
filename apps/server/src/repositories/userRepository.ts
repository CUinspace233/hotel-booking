import prisma from '../lib/prisma';
import type { User, UserRole } from '.prisma/client';

// Prisma 错误类型
interface PrismaError {
  code?: string;
  meta?: Record<string, unknown>;
}

// 创建用户参数
export interface CreateUserParams {
  username: string;
  password: string;
  email?: string; // 邮箱可选
  phone: string;
  role?: UserRole;
}

// 更新用户参数
export interface UpdateUserParams {
  username?: string;
  password?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: number;
}

// 辅助函数：检查是否为 Prisma 错误
function isPrismaError(error: unknown): error is PrismaError {
  return typeof error === 'object' && error !== null && 'code' in error;
}

/**
 * 用户数据访问层（Repository）
 * 负责与数据库的直接交互
 */
class UserRepository {
  /**
   * 根据ID查找用户
   */
  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username }
    });
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { email }
    });
  }

  /**
   * 根据手机号查找用户
   */
  async findByPhone(phone: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { phone }
    });
  }

  /**
   * 创建新用户
   */
  async create(data: CreateUserParams): Promise<User> {
    return prisma.user.create({
      data: {
        username: data.username,
        password: data.password,
        email: data.email,
        phone: data.phone,
        role: data.role || 'merchant'
      }
    });
  }

  /**
   * 更新用户信息
   */
  async update(id: number, data: UpdateUserParams): Promise<User | null> {
    try {
      return await prisma.user.update({
        where: { id },
        data
      });
    } catch (err) {
      // 记录不存在时返回 null
      if (isPrismaError(err) && err.code === 'P2025') {
        return null;
      }
      throw err;
    }
  }

  /**
   * 删除用户
   */
  async delete(id: number): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id }
      });
      return true;
    } catch (err) {
      // 记录不存在时返回 false
      if (isPrismaError(err) && err.code === 'P2025') {
        return false;
      }
      throw err;
    }
  }

  /**
   * 获取所有用户（分页）
   */
  async findAll(page = 1, pageSize = 10): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * pageSize;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
    ]);

    return { users, total };
  }
}

// 导出单例
export const userRepository = new UserRepository();

// 导出类型
export type { User, UserRole };
