import { Router, type IRouter } from 'express';
import { HotelProjectController } from '../../controllers/hotel';
import { authMiddleware } from '../../middlewares/auth';

const router: IRouter = Router();

// 所有项目路由都需要认证
router.use(authMiddleware);

/**
 * 酒店项目路由
 *
 * GET    /api/hotel/projects          - 获取项目列表
 * GET    /api/hotel/projects/:hotelId - 获取单个项目
 * POST   /api/hotel/projects          - 创建项目
 * PUT    /api/hotel/projects/:hotelId - 更新项目
 * PUT    /api/hotel/projects/:hotelId/status - 更新项目状态
 * DELETE /api/hotel/projects/:hotelId - 删除项目
 */

// 获取项目列表
router.get('/', HotelProjectController.list);

// 获取单个项目
router.get('/:hotelId', HotelProjectController.getOne);

// 创建项目
router.post('/', HotelProjectController.create);

// 更新项目
router.put('/:hotelId', HotelProjectController.update);

// 更新项目状态
router.put('/:hotelId/status', HotelProjectController.updateStatus);

// 删除项目
router.delete('/:hotelId', HotelProjectController.delete);

export default router;
