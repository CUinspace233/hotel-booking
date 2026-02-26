import { hotelProjectRepository } from '../hotel';
import type { Prisma } from '.prisma/client';

/**
 * 审核模块 - 酒店项目数据访问层
 * 负责审核列表的数据库查询（不按 creatorId 过滤）
 */
class AuditProjectRepository {
  /**
   * 审核项目允许的状态（不含草稿）
   */
  private readonly AUDIT_STATUSES = [
    'pending',
    'pending_update',
    'approved',
    'rejected',
    'offline'
  ] as const;

  /**
   * 构建审核列表的 where 条件
   */
  private buildAuditWhere(params: {
    status?: string;
    keyword?: string;
  }): Prisma.HotelProjectWhereInput {
    const where: Prisma.HotelProjectWhereInput = {};

    if (params.status) {
      if (params.status === 'all') {
        where.status = { in: [...this.AUDIT_STATUSES] };
      } else if (params.status === 'pending') {
        // 待审核：合并首次审核和二次审核
        where.status = { in: ['pending', 'pending_update'] };
      } else {
        where.status = params.status;
      }
    } else {
      // 默认仅查审核相关状态
      where.status = { in: [...this.AUDIT_STATUSES] };
    }

    if (params.keyword) {
      where.name = { contains: params.keyword };
    }

    return where;
  }

  /**
   * 分页查询审核项目列表
   * 按 submitTime 降序，无则按 createdAt
   */
  async findManyForAudit(params: {
    skip: number;
    take: number;
    status?: string;
    keyword?: string;
  }) {
    const where = this.buildAuditWhere({
      status: params.status,
      keyword: params.keyword
    });

    return hotelProjectRepository.findMany({
      skip: params.skip,
      take: params.take,
      where,
      orderBy: { submitTime: 'desc' }
    });
  }

  /**
   * 统计审核项目数量
   */
  async countForAudit(params: { status?: string; keyword?: string }): Promise<number> {
    const where = this.buildAuditWhere(params);
    return hotelProjectRepository.count(where);
  }
}

export const auditProjectRepository = new AuditProjectRepository();
