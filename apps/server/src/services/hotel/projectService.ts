import { hotelProjectRepository, hotelDetailRepository } from '../../repositories/hotel';
import { generateHotelId } from '../../utils/idGenerator';
import type { Prisma } from '.prisma/client';
import type {
  CreateHotelProjectParams,
  UpdateHotelProjectParams,
  HotelProjectListParams,
  HotelStatus,
  PaginatedResponse
} from '../../types/hotel';

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
 * 酒店项目业务逻辑层
 * 负责第一层（项目）的业务处理
 */
class HotelProjectService {
  /**
   * 获取酒店项目列表（分页）
   */
  async getList(params: HotelProjectListParams): Promise<PaginatedResponse<unknown>> {
    const { page = 1, pageSize = 10, status, keyword, creatorId } = params;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where = this.buildWhere({ status, keyword, creatorId });

    // 并行查询列表和总数
    const [list, total] = await Promise.all([
      hotelProjectRepository.findMany({
        skip,
        take: pageSize,
        where,
        orderBy: { createdAt: 'desc' }
      }),
      hotelProjectRepository.count(where)
    ]);

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
   * 获取单个项目基础信息
   */
  async getByHotelId(hotelId: string) {
    const project = await hotelProjectRepository.findByHotelId(hotelId);
    if (!project) {
      throw new ServiceError('酒店项目不存在', 404);
    }
    return project;
  }

  /**
   * 获取项目（含详情）
   * @param version 版本类型：draft / published
   */
  async getWithDetail(hotelId: string, version: string = 'draft') {
    const project = await hotelProjectRepository.findByHotelIdWithDetail(hotelId, version);
    if (!project) {
      throw new ServiceError('酒店项目不存在', 404);
    }
    return project;
  }

  /**
   * 获取完整酒店信息（三层聚合）
   * @param version 版本类型：draft / published
   */
  async getFullInfo(hotelId: string, version: string = 'draft') {
    const project = await hotelProjectRepository.findByHotelIdWithAll(hotelId, version);
    if (!project) {
      throw new ServiceError('酒店项目不存在', 404);
    }
    return project;
  }

  /**
   * 创建酒店项目
   */
  async create(params: CreateHotelProjectParams) {
    const hotelId = generateHotelId();

    // 创建项目并初始化空详情
    const project = await hotelProjectRepository.createWithDetail({
      hotelId,
      name: params.name,
      hotelType: params.hotelType,
      remark: params.remark,
      creatorId: params.creatorId,
      creator: params.creator
    });

    return project;
  }

  /**
   * 更新项目基础信息
   */
  async update(hotelId: string, params: UpdateHotelProjectParams) {
    // 检查项目是否存在
    const existing = await hotelProjectRepository.findByHotelId(hotelId);
    if (!existing) {
      throw new ServiceError('酒店项目不存在', 404);
    }

    const project = await hotelProjectRepository.update(hotelId, {
      name: params.name,
      hotelType: params.hotelType,
      remark: params.remark
    });

    return project;
  }

  /**
   * 更新项目状态
   */
  async updateStatus(hotelId: string, status: HotelStatus) {
    // 检查项目是否存在
    const existing = await hotelProjectRepository.findByHotelId(hotelId);
    if (!existing) {
      throw new ServiceError('酒店项目不存在', 404);
    }

    // 状态流转校验
    this.validateStatusTransition(existing.status as HotelStatus, status);

    const updateData: Prisma.HotelProjectUpdateInput = { status };

    // 如果是提交审核，记录提审时间
    if (status === 'pending') {
      updateData.submitTime = new Date();
    }

    const project = await hotelProjectRepository.update(hotelId, updateData);
    return project;
  }

  /**
   * 撤回审核
   * - pending 状态撤回后变为 draft
   * - pending_update 状态撤回后变为 approved
   */
  async withdrawReview(hotelId: string) {
    const existing = await hotelProjectRepository.findByHotelId(hotelId);
    if (!existing) {
      throw new ServiceError('酒店项目不存在', 404);
    }

    const currentStatus = existing.status as HotelStatus;

    // 只有 pending 和 pending_update 状态才能撤回
    if (currentStatus !== 'pending' && currentStatus !== 'pending_update') {
      throw new ServiceError('当前状态不可撤回审核', 400);
    }

    // 根据当前状态决定撤回后的目标状态
    const newStatus: HotelStatus = currentStatus === 'pending_update' ? 'approved' : 'draft';

    const updateData: Prisma.HotelProjectUpdateInput = {
      status: newStatus,
      submitTime: null // 清除提审时间
    };

    const project = await hotelProjectRepository.update(hotelId, updateData);
    return project;
  }

  /**
   * 删除项目（软删除）
   */
  async delete(hotelId: string) {
    // 检查项目是否存在
    const existing = await hotelProjectRepository.findByHotelId(hotelId);
    if (!existing) {
      throw new ServiceError('酒店项目不存在', 404);
    }

    // 已上线的酒店不能直接删除
    if (existing.status === 'approved') {
      throw new ServiceError('已审核通过的酒店不能删除，请先下线', 400);
    }

    const result = await hotelProjectRepository.softDelete(hotelId);
    return result;
  }

  /**
   * 构建查询条件
   */
  private buildWhere(filters: {
    status?: string;
    keyword?: string;
    creatorId?: number;
  }): Prisma.HotelProjectWhereInput {
    const where: Prisma.HotelProjectWhereInput = {};

    if (filters.status) {
      if (filters.status === 'all') {
        // 全部项目：包含待审核、二次审核、已通过、已驳回、已下线（不含草稿）
        where.status = { in: ['pending', 'pending_update', 'approved', 'rejected', 'offline'] };
      } else {
        where.status = filters.status;
      }
    }

    if (filters.keyword) {
      where.name = { contains: filters.keyword };
    }

    if (filters.creatorId) {
      where.creatorId = filters.creatorId;
    }

    return where;
  }

  /**
   * 校验状态流转
   */
  private validateStatusTransition(currentStatus: HotelStatus, newStatus: HotelStatus): void {
    const allowedTransitions: Record<HotelStatus, HotelStatus[]> = {
      draft: ['pending'], // 草稿 -> 提审
      pending: ['approved', 'rejected', 'draft'], // 待审核 -> 通过/拒绝/撤回
      approved: ['offline', 'pending_update'], // 已通过 -> 下线/二次提审
      rejected: ['pending', 'draft'], // 已拒绝 -> 重新提审/回到草稿
      offline: ['approved', 'pending'], // 已下线 -> 恢复上线/重新提审
      pending_update: ['approved', 'rejected'] // 二次提审中 -> 通过/拒绝（撤回由专门方法处理）
    };

    const allowed = allowedTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new ServiceError(
        `不能从「${this.getStatusLabel(currentStatus)}」变更为「${this.getStatusLabel(newStatus)}」`,
        400
      );
    }
  }

  /**
   * 获取状态标签
   */
  private getStatusLabel(status: HotelStatus): string {
    const labels: Record<HotelStatus, string> = {
      draft: '草稿',
      pending: '待审核',
      approved: '已通过',
      rejected: '已拒绝',
      offline: '已下线',
      pending_update: '二次提审中'
    };
    return labels[status] || status;
  }
}

// 导出单例
export const hotelProjectService = new HotelProjectService();
