import { Request, Response } from 'express';
import { publicHotelService } from '../services/hotel/publicService';
import { ServiceError } from '../services/hotel/projectService';
import { ResponseUtil } from '../utils/response';

/**
 * C 端公开接口控制器
 * 无需登录，面向 C 端用户
 */
export class PublicController {
  /**
   * C 端酒店列表
   * GET /api/public/hotels
   */
  static async hotelList(req: Request, res: Response) {
    try {
      const {
        page = '1',
        pageSize = '10',
        keyword,
        city,
        starRating,
        hotelType,
        minPrice,
        maxPrice,
        sortBy
      } = req.query;

      const result = await publicHotelService.getList({
        page: parseInt(page as string, 10),
        pageSize: parseInt(pageSize as string, 10),
        keyword: keyword as string | undefined,
        city: city as string | undefined,
        starRating: starRating ? parseInt(starRating as string, 10) : undefined,
        hotelType: hotelType as string | undefined,
        minPrice: minPrice ? parseInt(minPrice as string, 10) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice as string, 10) : undefined,
        sortBy: sortBy as 'price_asc' | 'price_desc' | 'rating_desc' | 'default' | undefined
      });

      return ResponseUtil.success(res, result, '获取成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[PublicController.hotelList] Error:', err);
      return ResponseUtil.serverError(res, '获取酒店列表失败');
    }
  }

  /**
   * C 端酒店详情
   * GET /api/public/hotels/:hotelId
   */
  static async hotelDetail(req: Request, res: Response) {
    try {
      const hotelId = req.params.hotelId as string;

      const result = await publicHotelService.getDetail(hotelId);
      return ResponseUtil.success(res, result, '获取成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[PublicController.hotelDetail] Error:', err);
      return ResponseUtil.serverError(res, '获取酒店详情失败');
    }
  }
}
