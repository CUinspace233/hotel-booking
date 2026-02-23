import { Request, Response } from 'express';
import { hotelRoomService, ServiceError } from '../../services/hotel';
import { ResponseUtil } from '../../utils/response';

/**
 * 酒店房型控制器
 * 处理第三层（房型）的 HTTP 请求
 */
export class HotelRoomController {
  /**
   * 获取酒店房型列表
   * GET /api/hotel/rooms?hotelId=xxx
   */
  static async list(req: Request, res: Response) {
    try {
      const { hotelId, status } = req.query;

      if (!hotelId) {
        return ResponseUtil.error(res, 'hotelId 不能为空', 400);
      }

      const rooms = await hotelRoomService.getListByHotelId(
        hotelId as string,
        status as string | undefined
      );
      return ResponseUtil.success(res, rooms, '获取成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelRoomController.list] Error:', err);
      return ResponseUtil.serverError(res, '获取房型列表失败');
    }
  }

  /**
   * 获取单个房型详情
   * GET /api/hotel/rooms/:roomId
   */
  static async getOne(req: Request, res: Response) {
    try {
      const roomId = req.params.roomId as string;

      const room = await hotelRoomService.getByRoomId(roomId);
      return ResponseUtil.success(res, room, '获取成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelRoomController.getOne] Error:', err);
      return ResponseUtil.serverError(res, '获取房型失败');
    }
  }

  /**
   * 创建房型
   * POST /api/hotel/rooms
   */
  static async create(req: Request, res: Response) {
    try {
      const createData = req.body;

      // 基本参数校验
      if (!createData.hotelId) {
        return ResponseUtil.error(res, 'hotelId 不能为空', 400);
      }
      if (!createData.roomName) {
        return ResponseUtil.error(res, '房型名称不能为空', 400);
      }

      const room = await hotelRoomService.create(createData);
      return ResponseUtil.success(res, room, '创建成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelRoomController.create] Error:', err);
      return ResponseUtil.serverError(res, '创建房型失败');
    }
  }

  /**
   * 更新房型
   * PUT /api/hotel/rooms/:roomId
   */
  static async update(req: Request, res: Response) {
    try {
      const roomId = req.params.roomId as string;
      const updateData = req.body;

      const room = await hotelRoomService.update(roomId, updateData);
      return ResponseUtil.success(res, room, '更新成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelRoomController.update] Error:', err);
      return ResponseUtil.serverError(res, '更新房型失败');
    }
  }

  /**
   * 删除房型
   * DELETE /api/hotel/rooms/:roomId
   */
  static async delete(req: Request, res: Response) {
    try {
      const roomId = req.params.roomId as string;

      await hotelRoomService.delete(roomId);
      return ResponseUtil.success(res, null, '删除成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelRoomController.delete] Error:', err);
      return ResponseUtil.serverError(res, '删除房型失败');
    }
  }

  /**
   * 设置房型设施（批量覆盖）
   * POST /api/hotel/rooms/:roomId/facilities
   */
  static async setFacilities(req: Request, res: Response) {
    try {
      const roomId = req.params.roomId as string;
      const { facilities } = req.body;

      if (!Array.isArray(facilities)) {
        return ResponseUtil.error(res, 'facilities 必须是数组', 400);
      }

      const result = await hotelRoomService.setFacilities(roomId, facilities);
      return ResponseUtil.success(res, result, '设置成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelRoomController.setFacilities] Error:', err);
      return ResponseUtil.serverError(res, '设置设施失败');
    }
  }

  /**
   * 获取房型设施列表
   * GET /api/hotel/rooms/:roomId/facilities
   */
  static async getFacilities(req: Request, res: Response) {
    try {
      const roomId = req.params.roomId as string;

      const facilities = await hotelRoomService.getFacilities(roomId);
      return ResponseUtil.success(res, facilities, '获取成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelRoomController.getFacilities] Error:', err);
      return ResponseUtil.serverError(res, '获取设施失败');
    }
  }

  /**
   * 添加房型图片
   * POST /api/hotel/rooms/:roomId/images
   */
  static async addImages(req: Request, res: Response) {
    try {
      const roomId = req.params.roomId as string;
      const { images } = req.body;

      if (!Array.isArray(images)) {
        return ResponseUtil.error(res, 'images 必须是数组', 400);
      }

      const result = await hotelRoomService.addImages(roomId, images);
      return ResponseUtil.success(res, result, '添加成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelRoomController.addImages] Error:', err);
      return ResponseUtil.serverError(res, '添加图片失败');
    }
  }

  /**
   * 获取房型图片列表
   * GET /api/hotel/rooms/:roomId/images
   */
  static async getImages(req: Request, res: Response) {
    try {
      const roomId = req.params.roomId as string;

      const images = await hotelRoomService.getImages(roomId);
      return ResponseUtil.success(res, images, '获取成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelRoomController.getImages] Error:', err);
      return ResponseUtil.serverError(res, '获取图片失败');
    }
  }

  /**
   * 删除房型图片
   * DELETE /api/hotel/rooms/:roomId/images/:id
   */
  static async deleteImage(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      await hotelRoomService.deleteImage(parseInt(id, 10));
      return ResponseUtil.success(res, null, '删除成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelRoomController.deleteImage] Error:', err);
      return ResponseUtil.serverError(res, '删除图片失败');
    }
  }

  /**
   * 批量更新房间
   * PUT /api/hotel/rooms/batch
   * Body: { hotelId: string, rooms: BatchUpdateRoomItem[], version?: string }
   */
  static async batchUpdate(req: Request, res: Response) {
    try {
      const { hotelId, rooms, version = 'draft' } = req.body;

      if (!hotelId) {
        return ResponseUtil.error(res, 'hotelId 不能为空', 400);
      }

      if (!Array.isArray(rooms)) {
        return ResponseUtil.error(res, 'rooms 必须是数组', 400);
      }

      // 验证每个房间数据
      for (const room of rooms) {
        if (!room.roomName || typeof room.roomName !== 'string') {
          return ResponseUtil.error(res, '每个房间必须包含有效的 roomName', 400);
        }
      }

      const updatedRooms = await hotelRoomService.batchUpdate(hotelId, rooms, version);
      return ResponseUtil.success(res, updatedRooms, '批量更新成功');
    } catch (err) {
      if (err instanceof ServiceError) {
        return ResponseUtil.error(res, err.message, err.code);
      }
      console.error('[HotelRoomController.batchUpdate] Error:', err);
      return ResponseUtil.serverError(res, '批量更新房间失败');
    }
  }
}
