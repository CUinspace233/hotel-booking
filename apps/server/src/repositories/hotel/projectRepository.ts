import prisma from '../../lib/prisma';
import type { HotelProject, Prisma } from '.prisma/client';

/**
 * 酒店项目数据访问层
 * 负责第一层（项目表）的数据库操作
 */
class HotelProjectRepository {
  /**
   * 根据 hotelId 查找项目
   */
  async findByHotelId(hotelId: string): Promise<HotelProject | null> {
    return prisma.hotelProject.findUnique({
      where: { hotelId, isDeleted: false }
    });
  }

  /**
   * 根据 ID 查找项目
   */
  async findById(id: number): Promise<HotelProject | null> {
    return prisma.hotelProject.findFirst({
      where: { id, isDeleted: false }
    });
  }

  /**
   * 查找项目（含详情）
   */
  async findByHotelIdWithDetail(hotelId: string) {
    return prisma.hotelProject.findUnique({
      where: { hotelId, isDeleted: false },
      include: {
        detail: true
      }
    });
  }

  /**
   * 查找项目（含详情和房型）
   */
  async findByHotelIdWithAll(hotelId: string) {
    return prisma.hotelProject.findUnique({
      where: { hotelId, isDeleted: false },
      include: {
        detail: {
          include: {
            facilities: true,
            images: true
          }
        },
        rooms: {
          where: { isDeleted: false },
          include: {
            facilities: true,
            images: true
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
  }

  /**
   * 创建项目
   */
  async create(data: Prisma.HotelProjectCreateInput): Promise<HotelProject> {
    return prisma.hotelProject.create({
      data
    });
  }

  /**
   * 创建项目并初始化空详情
   */
  async createWithDetail(data: {
    hotelId: string;
    name?: string;
    hotelType?: string;
    remark?: string;
    creatorId: number;
    creator: string;
  }) {
    return prisma.hotelProject.create({
      data: {
        hotelId: data.hotelId,
        name: data.name,
        hotelType: data.hotelType,
        remark: data.remark,
        creatorId: data.creatorId,
        creator: data.creator,
        detail: {
          create: {}
        }
      },
      include: {
        detail: true
      }
    });
  }

  /**
   * 更新项目
   */
  async update(
    hotelId: string,
    data: Prisma.HotelProjectUpdateInput
  ): Promise<HotelProject | null> {
    try {
      return await prisma.hotelProject.update({
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
   * 软删除项目
   */
  async softDelete(hotelId: string): Promise<boolean> {
    try {
      await prisma.hotelProject.update({
        where: { hotelId },
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
   * 分页查询项目列表
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.HotelProjectWhereInput;
    orderBy?: Prisma.HotelProjectOrderByWithRelationInput;
  }): Promise<HotelProject[]> {
    const { skip, take, where, orderBy } = params;
    return prisma.hotelProject.findMany({
      skip,
      take,
      where: { ...where, isDeleted: false },
      orderBy: orderBy || { createdAt: 'desc' }
    });
  }

  /**
   * 统计数量
   */
  async count(where?: Prisma.HotelProjectWhereInput): Promise<number> {
    return prisma.hotelProject.count({
      where: { ...where, isDeleted: false }
    });
  }
}

// 导出单例
export const hotelProjectRepository = new HotelProjectRepository();
