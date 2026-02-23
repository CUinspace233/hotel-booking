import prisma from '../../lib/prisma';
import type { HotelPolicy, Prisma } from '.prisma/client';

// 创建政策的参数类型
interface CreatePolicyData {
  policyId: string;
  hotelId: string;
  version: string;
  policyType: string;
  policyName: string;
  policyContent?: string | null;
  sortOrder?: number;
}

/**
 * 酒店政策数据访问层
 * 负责政策表的数据库操作
 */
class HotelPolicyRepository {
  /**
   * 根据 policyId 查找政策
   */
  async findByPolicyId(policyId: string): Promise<HotelPolicy | null> {
    return prisma.hotelPolicy.findUnique({
      where: { policyId, isDeleted: false }
    });
  }

  /**
   * 根据酒店ID查找所有政策
   * @param version 版本类型：draft / published
   */
  async findByHotelId(hotelId: string, version: string = 'draft'): Promise<HotelPolicy[]> {
    return prisma.hotelPolicy.findMany({
      where: { hotelId, version, isDeleted: false },
      orderBy: { sortOrder: 'asc' }
    });
  }

  /**
   * 创建政策（使用直接数据）
   */
  async create(data: CreatePolicyData): Promise<HotelPolicy> {
    return prisma.hotelPolicy.create({
      data: {
        policyId: data.policyId,
        policyType: data.policyType,
        policyName: data.policyName,
        policyContent: data.policyContent,
        sortOrder: data.sortOrder || 0,
        detail: {
          connect: { hotelId_version: { hotelId: data.hotelId, version: data.version } }
        }
      }
    });
  }

  /**
   * 更新政策
   */
  async update(policyId: string, data: Prisma.HotelPolicyUpdateInput): Promise<HotelPolicy | null> {
    try {
      return await prisma.hotelPolicy.update({
        where: { policyId },
        data
      });
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: string }).code === 'P2025'
      ) {
        return null;
      }
      throw err;
    }
  }

  /**
   * 软删除政策
   */
  async softDelete(policyId: string): Promise<boolean> {
    try {
      await prisma.hotelPolicy.update({
        where: { policyId },
        data: { isDeleted: true }
      });
      return true;
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: string }).code === 'P2025'
      ) {
        return false;
      }
      throw err;
    }
  }

  /**
   * 批量软删除酒店下所有政策
   */
  async softDeleteByHotelId(hotelId: string): Promise<number> {
    const result = await prisma.hotelPolicy.updateMany({
      where: { hotelId, isDeleted: false },
      data: { isDeleted: true }
    });
    return result.count;
  }

  /**
   * 批量软删除酒店下指定版本的所有政策
   */
  async softDeleteByHotelIdAndVersion(hotelId: string, version: string): Promise<number> {
    const result = await prisma.hotelPolicy.updateMany({
      where: { hotelId, version, isDeleted: false },
      data: { isDeleted: true }
    });
    return result.count;
  }

  /**
   * 统计酒店政策数量
   */
  async countByHotelId(hotelId: string, version: string = 'draft'): Promise<number> {
    return prisma.hotelPolicy.count({
      where: { hotelId, version, isDeleted: false }
    });
  }
}

// 导出单例
export const hotelPolicyRepository = new HotelPolicyRepository();
