import prisma from '../../lib/prisma';
import type { HotelDetail, Prisma } from '.prisma/client';

/**
 * 酒店详情数据访问层
 * 负责第二层（详情表）的数据库操作
 */
class HotelDetailRepository {
  /**
   * 根据 hotelId 和版本查找详情
   * @param version 版本类型：draft / published
   */
  async findByHotelId(hotelId: string, version: string = 'draft'): Promise<HotelDetail | null> {
    return prisma.hotelDetail.findUnique({
      where: { hotelId_version: { hotelId, version } }
    });
  }

  /**
   * 查找详情（含设施和图片）
   * @param version 版本类型：draft / published
   */
  async findByHotelIdWithRelations(hotelId: string, version: string = 'draft') {
    return prisma.hotelDetail.findUnique({
      where: { hotelId_version: { hotelId, version } },
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
   * @param version 版本类型：draft / published
   */
  async update(
    hotelId: string,
    data: Prisma.HotelDetailUpdateInput,
    version: string = 'draft'
  ): Promise<HotelDetail | null> {
    try {
      return await prisma.hotelDetail.update({
        where: { hotelId_version: { hotelId, version } },
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
   * @param version 版本类型：draft / published
   */
  async upsert(
    hotelId: string,
    data: Record<string, unknown>,
    version: string = 'draft'
  ): Promise<HotelDetail> {
    return prisma.hotelDetail.upsert({
      where: { hotelId_version: { hotelId, version } },
      create: {
        version,
        ...data,
        project: {
          connect: { hotelId }
        }
      },
      update: data
    });
  }
}

// 导出单例
export const hotelDetailRepository = new HotelDetailRepository();
