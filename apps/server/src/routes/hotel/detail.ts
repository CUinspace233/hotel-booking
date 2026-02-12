import { Router, type IRouter } from 'express';
import { HotelDetailController } from '../../controllers/hotel';
import { authMiddleware } from '../../middlewares/auth';

const router: IRouter = Router();

// 所有详情路由都需要认证
router.use(authMiddleware);

/**
 * 酒店详情路由
 *
 * GET    /api/hotel/details/:hotelId              - 获取酒店详情
 * PUT    /api/hotel/details/:hotelId              - 更新酒店详情
 * GET    /api/hotel/details/:hotelId/facilities   - 获取酒店设施
 * POST   /api/hotel/details/:hotelId/facilities   - 设置酒店设施
 * DELETE /api/hotel/details/:hotelId/facilities/:code - 删除酒店设施
 * GET    /api/hotel/details/:hotelId/images       - 获取酒店图片
 * POST   /api/hotel/details/:hotelId/images       - 添加酒店图片
 * DELETE /api/hotel/details/:hotelId/images/:id   - 删除酒店图片
 */

// 获取酒店详情
router.get('/:hotelId', HotelDetailController.getOne);

// 更新酒店详情
router.put('/:hotelId', HotelDetailController.update);

// 设施相关
router.get('/:hotelId/facilities', HotelDetailController.getFacilities);
router.post('/:hotelId/facilities', HotelDetailController.setFacilities);
router.delete('/:hotelId/facilities/:code', HotelDetailController.deleteFacility);

// 图片相关
router.get('/:hotelId/images', HotelDetailController.getImages);
router.post('/:hotelId/images', HotelDetailController.addImages);
router.delete('/:hotelId/images/:id', HotelDetailController.deleteImage);

export default router;
