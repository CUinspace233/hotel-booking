import { Router, type IRouter } from 'express';
import { HotelRoomController } from '../../controllers/hotel';
import { authMiddleware } from '../../middlewares/auth';

const router: IRouter = Router();

// 所有房型路由都需要认证
router.use(authMiddleware);

/**
 * 酒店房型路由
 *
 * GET    /api/hotel/rooms              - 获取房型列表 (需要 ?hotelId=xxx)
 * PUT    /api/hotel/rooms/batch        - 批量更新房间（新增/更新/删除）
 * GET    /api/hotel/rooms/:roomId      - 获取单个房型
 * POST   /api/hotel/rooms              - 创建房型
 * PUT    /api/hotel/rooms/:roomId      - 更新房型
 * DELETE /api/hotel/rooms/:roomId      - 删除房型
 * GET    /api/hotel/rooms/:roomId/facilities   - 获取房型设施
 * POST   /api/hotel/rooms/:roomId/facilities   - 设置房型设施
 * GET    /api/hotel/rooms/:roomId/images       - 获取房型图片
 * POST   /api/hotel/rooms/:roomId/images       - 添加房型图片
 * DELETE /api/hotel/rooms/:roomId/images/:id   - 删除房型图片
 */

// 获取房型列表（需要 query 参数 hotelId）
router.get('/', HotelRoomController.list);

// 批量更新房间（必须在 /:roomId 之前定义，否则 'batch' 会被当作 roomId）
router.put('/batch', HotelRoomController.batchUpdate);

// 获取单个房型
router.get('/:roomId', HotelRoomController.getOne);

// 创建房型
router.post('/', HotelRoomController.create);

// 更新房型
router.put('/:roomId', HotelRoomController.update);

// 删除房型
router.delete('/:roomId', HotelRoomController.delete);

// 设施相关
router.get('/:roomId/facilities', HotelRoomController.getFacilities);
router.post('/:roomId/facilities', HotelRoomController.setFacilities);

// 图片相关
router.get('/:roomId/images', HotelRoomController.getImages);
router.post('/:roomId/images', HotelRoomController.addImages);
router.delete('/:roomId/images/:id', HotelRoomController.deleteImage);

export default router;
