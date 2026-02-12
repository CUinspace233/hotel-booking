import prisma from '../../lib/prisma';
import type { HotelRoom, Prisma } from '.prisma/client';

/**
 * 酒店房型数据访问层
 * 负责第三层（房型表）的数据库操作
 */
class HotelRoomRepository {
  /**
   * 根据 roomId 查找房型
   */
  async findByRoomId(roomId: string): Promise<HotelRoom | null> {
    return prisma.hotelRoom.findUnique({
      where: { roomId, isDeleted: false }
    });
  }

  /**
   * 根据 ID 查找房型
   */
  async findById(id: number): Promise<HotelRoom | null> {
    return prisma.hotelRoom.findFirst({
      where: { id, isDeleted: false }
    });
  }

  /**
   * 查找房型（含设施和图片）
   */
  async findByRoomIdWithRelations(roomId: string) {
    return prisma.hotelRoom.findUnique({
      where: { roomId, isDeleted: false },
      include: {
        facilities: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
  }

  /**
   * 根据酒店ID查找所有房型
   */
  async findByHotelId(hotelId: string, status?: string): Promise<HotelRoom[]> {
    const where: Prisma.HotelRoomWhereInput = {
      hotelId,
      isDeleted: false
    };

    if (status) {
      where.status = status;
    }

    return prisma.hotelRoom.findMany({
      where,
      include: {
        facilities: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  /**
   * 创建房型
   */
  async create(data: Prisma.HotelRoomCreateInput): Promise<HotelRoom> {
    return prisma.hotelRoom.create({
      data,
      include: {
        facilities: true,
        images: true
      }
    });
  }

  /**
   * 更新房型
   */
  async update(roomId: string, data: Prisma.HotelRoomUpdateInput): Promise<HotelRoom | null> {
    try {
      return await prisma.hotelRoom.update({
        where: { roomId },
        data,
        include: {
          facilities: true,
          images: true
        }
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
   * 软删除房型
   */
  async softDelete(roomId: string): Promise<boolean> {
    try {
      await prisma.hotelRoom.update({
        where: { roomId },
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
   * 批量创建房型
   */
  async createMany(data: Prisma.HotelRoomCreateManyInput[]): Promise<number> {
    const result = await prisma.hotelRoom.createMany({
      data
    });
    return result.count;
  }

  /**
   * 统计酒店房型数量
   */
  async countByHotelId(hotelId: string): Promise<number> {
    return prisma.hotelRoom.count({
      where: { hotelId, isDeleted: false }
    });
  }
}

// 导出单例
export const hotelRoomRepository = new HotelRoomRepository();
