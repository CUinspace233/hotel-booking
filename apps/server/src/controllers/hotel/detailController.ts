import { Request, Response } from 'express';
import { hotelDetailService, ServiceError } from '../../services/hotel';
import { ResponseUtil } from '../../utils/response';

/**
 * 酒店详情控制器
 * 处理第二层（详情）的 HTTP 请求
 */
export class HotelDetailController {
  /**
   * 获取酒店详情
   * GET /api/hotel/details/:hotelId
   */
  static async getOne(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;

      const detail = await hotelDetailService.getByHotelId(hotelId);
      return ResponseUtil.success(res, detail, '获取成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelDetailController.getOne] Error:', err);
      return ResponseUtil.serverError(res, '获取详情失败');
    }
  }

  /**
   * 更新酒店详情
   * PUT /api/hotel/details/:hotelId
   */
  static async update(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;
      const updateData = req.body;

      const detail = await hotelDetailService.update(hotelId, updateData);
      return ResponseUtil.success(res, detail, '更新成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelDetailController.update] Error:', err);
      return ResponseUtil.serverError(res, '更新失败');
    }
  }

  /**
   * 设置酒店设施（批量覆盖）
   * POST /api/hotel/details/:hotelId/facilities
   */
  static async setFacilities(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;
      const { facilities } = req.body;

      if (!Array.isArray(facilities)) {
        return ResponseUtil.error(res, 'facilities 必须是数组', 400);
      }

      const result = await hotelDetailService.setFacilities(hotelId, facilities);
      return ResponseUtil.success(res, result, '设置成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelDetailController.setFacilities] Error:', err);
      return ResponseUtil.serverError(res, '设置设施失败');
    }
  }

  /**
   * 获取酒店设施列表
   * GET /api/hotel/details/:hotelId/facilities
   */
  static async getFacilities(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;

      const facilities = await hotelDetailService.getFacilities(hotelId);
      return ResponseUtil.success(res, facilities, '获取成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelDetailController.getFacilities] Error:', err);
      return ResponseUtil.serverError(res, '获取设施失败');
    }
  }

  /**
   * 删除酒店设施
   * DELETE /api/hotel/details/:hotelId/facilities/:code
   */
  static async deleteFacility(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;
      const code = req.params.code as string;

      await hotelDetailService.deleteFacility(hotelId, code);
      return ResponseUtil.success(res, null, '删除成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelDetailController.deleteFacility] Error:', err);
      return ResponseUtil.serverError(res, '删除设施失败');
    }
  }

  /**
   * 添加酒店图片
   * POST /api/hotel/details/:hotelId/images
   */
  static async addImages(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;
      const { images } = req.body;

      if (!Array.isArray(images)) {
        return ResponseUtil.error(res, 'images 必须是数组', 400);
      }

      const result = await hotelDetailService.addImages(hotelId, images);
      return ResponseUtil.success(res, result, '添加成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelDetailController.addImages] Error:', err);
      return ResponseUtil.serverError(res, '添加图片失败');
    }
  }

  /**
   * 获取酒店图片列表
   * GET /api/hotel/details/:hotelId/images
   */
  static async getImages(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;

      const images = await hotelDetailService.getImages(hotelId);
      return ResponseUtil.success(res, images, '获取成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelDetailController.getImages] Error:', err);
      return ResponseUtil.serverError(res, '获取图片失败');
    }
  }

  /**
   * 删除酒店图片
   * DELETE /api/hotel/details/:hotelId/images/:id
   */
  static async deleteImage(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      await hotelDetailService.deleteImage(parseInt(id, 10));
      return ResponseUtil.success(res, null, '删除成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelDetailController.deleteImage] Error:', err);
      return ResponseUtil.serverError(res, '删除图片失败');
    }
  }
}
