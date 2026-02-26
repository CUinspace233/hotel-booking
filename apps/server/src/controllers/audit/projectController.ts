import { Request, Response } from 'express';
import { auditProjectService } from '../../services/audit';
import { ServiceError } from '../../services/hotel/projectService';
import { ResponseUtil } from '../../utils/response';

/**
 * 审核模块 - 酒店项目控制器
 * 处理审核相关的 HTTP 请求（仅管理员）
 */
export class AuditProjectController {
  /**
   * 获取审核项目列表
   * GET /api/audit/projects
   */
  static async list(req: Request, res: Response) {
    try {
      const { page = '1', pageSize = '10', status, keyword } = req.query;

      const result = await auditProjectService.getList({
        page: parseInt(page as string, 10),
        pageSize: parseInt(pageSize as string, 10),
        status: (status as import('../../types/audit').AuditProjectStatus) || undefined,
        keyword: keyword as string | undefined
      });

      return ResponseUtil.success(res, result, '获取成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[AuditProjectController.list] Error:', err);
      return ResponseUtil.serverError(res, '获取审核列表失败');
    }
  }

  /**
   * 获取审核用详情
   * GET /api/audit/projects/:hotelId/detail
   */
  static async getDetail(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;

      const detail = await auditProjectService.getDetail(hotelId);
      return ResponseUtil.success(res, detail, '获取成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[AuditProjectController.getDetail] Error:', err);
      return ResponseUtil.serverError(res, '获取详情失败');
    }
  }

  /**
   * 审核通过
   * POST /api/audit/projects/:hotelId/approve
   */
  static async approve(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;

      const result = await auditProjectService.approve(hotelId);
      return ResponseUtil.success(res, result, '审核通过');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[AuditProjectController.approve] Error:', err);
      return ResponseUtil.serverError(res, '审核通过失败');
    }
  }

  /**
   * 审核驳回
   * PUT /api/audit/projects/:hotelId/reject
   */
  static async reject(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;
      const { remark } = req.body;

      const project = await auditProjectService.reject(hotelId, remark);
      return ResponseUtil.success(res, project, '已驳回');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[AuditProjectController.reject] Error:', err);
      return ResponseUtil.serverError(res, '驳回失败');
    }
  }

  /**
   * 下线酒店
   * PUT /api/audit/projects/:hotelId/offline
   */
  static async setOffline(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;
      const { reason } = req.body;

      const project = await auditProjectService.setOffline(hotelId, reason);
      return ResponseUtil.success(res, project, '下线成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[AuditProjectController.setOffline] Error:', err);
      return ResponseUtil.serverError(res, '下线失败');
    }
  }

  /**
   * 恢复上线
   * PUT /api/audit/projects/:hotelId/online
   */
  static async setOnline(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;

      const project = await auditProjectService.setOnline(hotelId);
      return ResponseUtil.success(res, project, '恢复上线成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[AuditProjectController.setOnline] Error:', err);
      return ResponseUtil.serverError(res, '恢复上线失败');
    }
  }
}
