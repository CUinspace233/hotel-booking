import { Router, type IRouter } from 'express';
import { HotelProjectController } from '../../controllers/hotel';
import { authMiddleware } from '../../middlewares/auth';
import projectRoutes from './project';
import detailRoutes from './detail';
import roomRoutes from './room';

const router: IRouter = Router();

/**
 * 酒店模块路由聚合
 *
 * /api/hotel/projects/*  - 酒店项目（第一层）
 * /api/hotel/details/*   - 酒店详情（第二层）
 * /api/hotel/rooms/*     - 酒店房型（第三层）
 * /api/hotel/full/:hotelId - 获取酒店完整信息（聚合三层）
 */

// 挂载子路由
router.use('/projects', projectRoutes);
router.use('/details', detailRoutes);
router.use('/rooms', roomRoutes);

// 聚合接口：获取酒店完整信息（三层数据）
router.get('/full/:hotelId', authMiddleware, HotelProjectController.getFull);

export default router;
