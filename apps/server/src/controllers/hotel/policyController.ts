import { Request, Response } from 'express';
import { hotelPolicyService, ServiceError } from '../../services/hotel';
import { ResponseUtil } from '../../utils/response';

/**
 * 酒店政策控制器
 * 处理政策相关的 HTTP 请求
 */
export class HotelPolicyController {
  /**
   * 获取酒店政策列表
   * GET /api/hotel/policies?hotelId=xxx&version=draft|published
   */
  static async list(req: Request, res: Response) {
    try {
      const { hotelId, version = 'draft' } = req.query;

      if (!hotelId) {
        return ResponseUtil.error(res, 'hotelId 不能为空', 400);
      }

      const policies = await hotelPolicyService.getListByHotelId(
        hotelId as string,
        version as string
      );
      return ResponseUtil.success(res, policies, '获取成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelPolicyController.list] Error:', err);
      return ResponseUtil.serverError(res, '获取政策列表失败');
    }
  }

  /**
   * 获取单个政策详情
   * GET /api/hotel/policies/:policyId
   */
  static async getOne(req: Request, res: Response) {
    try {
      const policyId = req.params.policyId as string;

      const policy = await hotelPolicyService.getByPolicyId(policyId);
      return ResponseUtil.success(res, policy, '获取成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelPolicyController.getOne] Error:', err);
      return ResponseUtil.serverError(res, '获取政策失败');
    }
  }

  /**
   * 创建政策
   * POST /api/hotel/policies
   */
  static async create(req: Request, res: Response) {
    try {
      const createData = req.body;

      if (!createData.hotelId) {
        return ResponseUtil.error(res, 'hotelId 不能为空', 400);
      }
      if (!createData.policyType) {
        return ResponseUtil.error(res, '政策类型不能为空', 400);
      }
      if (!createData.policyName) {
        return ResponseUtil.error(res, '政策名称不能为空', 400);
      }

      const policy = await hotelPolicyService.create(createData);
      return ResponseUtil.success(res, policy, '创建成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelPolicyController.create] Error:', err);
      return ResponseUtil.serverError(res, '创建政策失败');
    }
  }

  /**
   * 更新政策
   * PUT /api/hotel/policies/:policyId
   */
  static async update(req: Request, res: Response) {
    try {
      const policyId = req.params.policyId as string;
      const updateData = req.body;

      const policy = await hotelPolicyService.update(policyId, updateData);
      return ResponseUtil.success(res, policy, '更新成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelPolicyController.update] Error:', err);
      return ResponseUtil.serverError(res, '更新政策失败');
    }
  }

  /**
   * 删除政策
   * DELETE /api/hotel/policies/:policyId
   */
  static async delete(req: Request, res: Response) {
    try {
      const policyId = req.params.policyId as string;

      await hotelPolicyService.delete(policyId);
      return ResponseUtil.success(res, null, '删除成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelPolicyController.delete] Error:', err);
      return ResponseUtil.serverError(res, '删除政策失败');
    }
  }

  /**
   * 批量更新政策
   * PUT /api/hotel/policies/batch
   * Body: { hotelId: string, policies: array, version?: string }
   */
  static async batchUpdate(req: Request, res: Response) {
    try {
      const { hotelId, policies, version = 'draft' } = req.body;

      if (!hotelId) {
        return ResponseUtil.error(res, 'hotelId 不能为空', 400);
      }

      if (!Array.isArray(policies)) {
        return ResponseUtil.error(res, 'policies 必须是数组', 400);
      }

      // 验证每个政策数据
      for (const policy of policies) {
        if (!policy.policyType) {
          return ResponseUtil.error(res, '每个政策必须包含 policyType', 400);
        }
        if (!policy.policyName) {
          return ResponseUtil.error(res, '每个政策必须包含 policyName', 400);
        }
      }

      const updatedPolicies = await hotelPolicyService.batchUpdate(hotelId, policies, version);
      return ResponseUtil.success(res, updatedPolicies, '批量更新成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelPolicyController.batchUpdate] Error:', err);
      return ResponseUtil.serverError(res, '批量更新政策失败');
    }
  }
}
