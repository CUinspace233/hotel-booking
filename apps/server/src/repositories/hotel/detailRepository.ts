import prisma from '../../lib/prisma';
import type { HotelDetail, Prisma } from '.prisma/client';

/**
 * 酒店详情数据访问层
 * 负责第二层（详情表）的数据库操作
 */
class HotelDetailRepository {
  /**
   * 根据 hotelId 查找详情
   */
  async findByHotelId(hotelId: string): Promise<HotelDetail | null> {
    return prisma.hotelDetail.findUnique({
      where: { hotelId }
    });
  }

  /**
   * 查找详情（含设施和图片）
   */
  async findByHotelIdWithRelations(hotelId: string) {
    return prisma.hotelDetail.findUnique({
      where: { hotelId },
      include: {
        facilities: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
  }

  /**
   * 创建详情
   */
  async create(data: Prisma.HotelDetailCreateInput): Promise<HotelDetail> {
    return prisma.hotelDetail.create({
      data
    });
  }

  /**
   * 更新详情
   */
  async update(hotelId: string, data: Prisma.HotelDetailUpdateInput): Promise<HotelDetail | null> {
    try {
      return await prisma.hotelDetail.update({
        where: { hotelId },
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
   * 更新或创建详情（upsert）
   */
  async upsert(hotelId: string, data: Record<string, unknown>): Promise<HotelDetail> {
    return prisma.hotelDetail.upsert({
      where: { hotelId },
      create: {
        hotelId,
        ...data
      },
      update: data
    });
  }
}

// 导出单例
export const hotelDetailRepository = new HotelDetailRepository();
