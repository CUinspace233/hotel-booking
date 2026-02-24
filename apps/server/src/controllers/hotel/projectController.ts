import { Request, Response } from 'express';
import { hotelProjectService, hotelVersionService, ServiceError } from '../../services/hotel';
import { ResponseUtil } from '../../utils/response';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import type { HotelStatus } from '../../types/hotel';

/**
 * 酒店项目控制器
 * 处理第一层（项目）的 HTTP 请求
 */
export class HotelProjectController {
  /**
   * 获取酒店项目列表
   * GET /api/hotel/projects
   */
  static async list(req: Request, res: Response) {
    try {
      const { page = '1', pageSize = '10', status, keyword } = req.query;
      const authReq = req as AuthenticatedRequest;

      const result = await hotelProjectService.getList({
        page: parseInt(page as string, 10),
        pageSize: parseInt(pageSize as string, 10),
        status: status as HotelStatus | undefined,
        keyword: keyword as string | undefined,
        creatorId: authReq.userId
      });

      return ResponseUtil.success(res, result, '获取成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelProjectController.list] Error:', err);
      return ResponseUtil.serverError(res, '获取列表失败');
    }
  }

  /**
   * 获取单个酒店项目
   * GET /api/hotel/projects/:hotelId
   */
  static async getOne(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;

      const project = await hotelProjectService.getByHotelId(hotelId);
      return ResponseUtil.success(res, project, '获取成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelProjectController.getOne] Error:', err);
      return ResponseUtil.serverError(res, '获取项目失败');
    }
  }

  /**
   * 获取酒店完整信息（三层聚合）
   * GET /api/hotel/full/:hotelId?version=draft|published
   */
  static async getFull(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;
      const version = (req.query.version as string) || 'draft';

      const fullInfo = await hotelProjectService.getFullInfo(hotelId, version);
      return ResponseUtil.success(res, fullInfo, '获取成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelProjectController.getFull] Error:', err);
      return ResponseUtil.serverError(res, '获取完整信息失败');
    }
  }

  /**
   * 创建酒店项目
   * POST /api/hotel/projects
   */
  static async create(req: Request, res: Response) {
    try {
      const { name, hotelType, remark } = req.body;
      const authReq = req as AuthenticatedRequest;

      const project = await hotelProjectService.create({
        name,
        hotelType,
        remark,
        creatorId: authReq.userId,
        creator: authReq.username
      });

      return ResponseUtil.success(res, project, '创建成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelProjectController.create] Error:', err);
      return ResponseUtil.serverError(res, '创建失败');
    }
  }

  /**
   * 更新酒店项目
   * PUT /api/hotel/projects/:hotelId
   */
  static async update(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;
      const { name, hotelType, remark } = req.body;

      const project = await hotelProjectService.update(hotelId, {
        name,
        hotelType,
        remark
      });

      return ResponseUtil.success(res, project, '更新成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelProjectController.update] Error:', err);
      return ResponseUtil.serverError(res, '更新失败');
    }
  }

  /**
   * 更新酒店状态
   * PUT /api/hotel/projects/:hotelId/status
   */
  static async updateStatus(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;
      const { status } = req.body;

      if (!status) {
        return ResponseUtil.error(res, '状态不能为空', 400);
      }

      const project = await hotelProjectService.updateStatus(hotelId, status as HotelStatus);
      return ResponseUtil.success(res, project, '状态更新成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelProjectController.updateStatus] Error:', err);
      return ResponseUtil.serverError(res, '状态更新失败');
    }
  }

  /**
   * 删除酒店项目
   * DELETE /api/hotel/projects/:hotelId
   */
  static async delete(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;

      await hotelProjectService.delete(hotelId);
      return ResponseUtil.success(res, null, '删除成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelProjectController.delete] Error:', err);
      return ResponseUtil.serverError(res, '删除失败');
    }
  }

  /**
   * 发布草稿（将 draft 同步为 published）
   * POST /api/hotel/projects/:hotelId/publish
   */
  static async publishDraft(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;

      const result = await hotelVersionService.publishDraft(hotelId);
      return ResponseUtil.success(res, result, '发布成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelProjectController.publishDraft] Error:', err);
      return ResponseUtil.serverError(res, '发布失败');
    }
  }

  /**
   * 同步已发布数据到草稿（用于开始编辑已发布酒店）
   * POST /api/hotel/projects/:hotelId/sync-draft
   */
  static async syncDraft(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;

      const result = await hotelVersionService.createDraftFromPublished(hotelId);
      return ResponseUtil.success(res, result, '同步成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelProjectController.syncDraft] Error:', err);
      return ResponseUtil.serverError(res, '同步失败');
    }
  }

  /**
   * 下线酒店（管理员操作）
   * PUT /api/hotel/projects/:hotelId/offline
   */
  static async setOffline(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;
      const { reason } = req.body;

      const project = await hotelProjectService.updateStatus(hotelId, 'offline');

      // 如果提供了下线原因，更新到 remark 字段
      if (reason) {
        await hotelProjectService.update(hotelId, { remark: `下线原因: ${reason}` });
      }

      return ResponseUtil.success(res, project, '下线成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelProjectController.setOffline] Error:', err);
      return ResponseUtil.serverError(res, '下线失败');
    }
  }

  /**
   * 恢复上线（管理员操作）
   * PUT /api/hotel/projects/:hotelId/online
   */
  static async setOnline(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;

      const project = await hotelProjectService.updateStatus(hotelId, 'approved');
      return ResponseUtil.success(res, project, '恢复上线成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelProjectController.setOnline] Error:', err);
      return ResponseUtil.serverError(res, '恢复上线失败');
    }
  }

  /**
   * 撤回审核
   * PUT /api/hotel/projects/:hotelId/withdraw-review
   */
  static async withdrawReview(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;

      const project = await hotelProjectService.withdrawReview(hotelId);
      return ResponseUtil.success(res, project, '撤回审核成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelProjectController.withdrawReview] Error:', err);
      return ResponseUtil.serverError(res, '撤回审核失败');
    }
  }
}
