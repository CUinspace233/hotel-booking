import { auditProjectRepository } from '../../repositories/audit';
import { hotelProjectService } from '../hotel/projectService';
import { hotelVersionService } from '../hotel/versionService';
import { ServiceError } from '../hotel/projectService';
import type { AuditProjectListParams } from '../../types/audit';
import type { PaginatedResponse } from '../../types/hotel';

/**
 * 审核模块 - 酒店项目业务逻辑层
 * 负责审核列表、通过、驳回、上下线等操作
 */
class AuditProjectService {
  /**
   * 获取审核项目列表（管理员视角，不按 creatorId 过滤）
   */
  async getList(params: AuditProjectListParams): Promise<PaginatedResponse<unknown>> {
    const { page = 1, pageSize = 10, status, keyword } = params;
    const skip = (page - 1) * pageSize;

    const [list, total] = await Promise.all([
      auditProjectRepository.findManyForAudit({
        skip,
        take: pageSize,
        status,
        keyword
      }),
      auditProjectRepository.countForAudit({ status, keyword })
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
   * 获取审核用详情（完整表单数据）
   */
  async getDetail(hotelId: string) {
    return hotelProjectService.getFullInfo(hotelId, 'draft');
  }

  /**
   * 审核通过（发布草稿）
   */
  async approve(hotelId: string) {
    return hotelVersionService.publishDraft(hotelId);
  }

  /**
   * 审核驳回
   */
  async reject(hotelId: string, remark?: string) {
    const project = await hotelProjectService.updateStatus(hotelId, 'rejected');
    if (remark) {
      await hotelProjectService.update(hotelId, { remark });
    }
    return project;
  }

  /**
   * 下线酒店
   */
  async setOffline(hotelId: string, reason?: string) {
    const project = await hotelProjectService.updateStatus(hotelId, 'offline');
    if (reason) {
      await hotelProjectService.update(hotelId, { remark: `下线原因: ${reason}` });
    }
    return project;
  }

  /**
   * 恢复上线
   */
  async setOnline(hotelId: string) {
    return hotelProjectService.updateStatus(hotelId, 'approved');
  }
}

export const auditProjectService = new AuditProjectService();
