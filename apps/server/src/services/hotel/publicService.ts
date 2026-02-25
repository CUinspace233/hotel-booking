import prisma from '../../lib/prisma';
import { ServiceError } from './projectService';
import type { PaginatedResponse } from '../../types/hotel';

/**
 * C 端公开查询参数
 */
export interface PublicHotelListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  city?: string;
  starRating?: number;
  hotelType?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'default';
}

/**
 * C 端酒店列表项（精简给移动端）
 */
export interface PublicHotelListItem {
  hotelId: string;
  name: string | null;
  hotelType: string | null;
  coverImage: string | null;
  starRating: number | null;
  score: number | null;
  reviewCount: number | null;
  city: string | null;
  district: string | null;
  address: string | null;
  description: string | null;
  minPrice: number | null;
  facilityCodes: string[];
}

/**
 * C 端酒店公开查询服务
 * 只查 status = 'approved' 且 isDeleted = false 的酒店
 * 关联 published 版本的 detail
 */
class PublicHotelService {
  /**
   * C 端酒店列表（分页 + 筛选）
   */
  async getList(params: PublicHotelListParams): Promise<PaginatedResponse<PublicHotelListItem>> {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      city,
      starRating,
      hotelType,
      minPrice,
      maxPrice,
      sortBy = 'default'
    } = params;

    const skip = (page - 1) * pageSize;

    // 基础条件：已审核通过 + 未删除
    const baseWhere: Record<string, unknown> = {
      status: 'approved',
      isDeleted: false
    };

    // 关键词搜索（名称模糊匹配）
    if (keyword) {
      baseWhere.OR = [
        { name: { contains: keyword } },
        {
          details: {
            some: {
              version: 'published',
              address: { contains: keyword }
            }
          }
        }
      ];
    }

    // 酒店类型筛选
    if (hotelType) {
      baseWhere.hotelType = hotelType;
    }

    // 详情层面的筛选条件
    const detailWhere: Record<string, unknown> = { version: 'published' };
    if (city) {
      detailWhere.city = city;
    }
    if (starRating) {
      detailWhere.starRating = starRating;
    }

    // 如果有详情层筛选条件（城市/星级），需要在 project 层加关联过滤
    if (city || starRating) {
      baseWhere.details = { some: detailWhere };
    }

    // 查询总数
    const total = await prisma.hotelProject.count({ where: baseWhere });

    // 查询列表（含 published detail + rooms + facilities + stats）
    const projects = await prisma.hotelProject.findMany({
      where: baseWhere,
      skip,
      take: pageSize,
      include: {
        details: {
          where: { version: 'published' },
          include: {
            facilities: true
          }
        },
        rooms: {
          where: { version: 'published', isDeleted: false },
          select: { basePrice: true }
        },
        stats: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 转换为 C 端列表项格式
    let list: PublicHotelListItem[] = projects.map((project) => {
      const detail = project.details[0] || null;
      const prices = project.rooms
        .map((r) => r.basePrice)
        .filter((p): p is number => p !== null && p > 0);
      const minRoomPrice = prices.length > 0 ? Math.min(...prices) : null;

      return {
        hotelId: project.hotelId,
        name: project.name,
        hotelType: project.hotelType,
        coverImage: detail?.coverImage || null,
        starRating: detail?.starRating || null,
        score: project.stats?.score ?? null,
        reviewCount: project.stats?.reviewCount ?? null,
        city: detail?.city || null,
        district: detail?.district || null,
        address: detail?.address || null,
        description: detail?.description || null,
        minPrice: minRoomPrice,
        facilityCodes: detail ? detail.facilities.map((f) => f.facilityCode) : []
      };
    });

    // 价格区间过滤（需要在应用层做，因为 minPrice 是聚合值）
    if (minPrice !== undefined || maxPrice !== undefined) {
      list = list.filter((item) => {
        if (item.minPrice === null) return false;
        if (minPrice !== undefined && item.minPrice < minPrice) return false;
        if (maxPrice !== undefined && item.minPrice > maxPrice) return false;
        return true;
      });
    }

    // 排序
    if (sortBy === 'price_asc') {
      list.sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => (b.minPrice ?? 0) - (a.minPrice ?? 0));
    } else if (sortBy === 'rating_desc') {
      list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }

    return {
      list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  /**
   * C 端酒店详情
   */
  async getDetail(hotelId: string) {
    const project = await prisma.hotelProject.findUnique({
      where: { hotelId, isDeleted: false, status: 'approved' },
      include: {
        details: {
          where: { version: 'published' },
          include: {
            facilities: true,
            images: { orderBy: { sortOrder: 'asc' } },
            policies: {
              where: { isDeleted: false },
              orderBy: { sortOrder: 'asc' }
            }
          }
        },
        rooms: {
          where: { version: 'published', isDeleted: false, status: 'active' },
          include: {
            facilities: true,
            images: { orderBy: { sortOrder: 'asc' } }
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!project) {
      throw new ServiceError('酒店不存在或未上架', 404);
    }

    return project;
  }
}

export const publicHotelService = new PublicHotelService();
