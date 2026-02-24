import { Router, type IRouter } from 'express';
import authRoutes from './auth.js';
import hotelRoutes from './hotel/index.js';
import uploadRoutes from './upload.js';

const router: IRouter = Router();

// 挂载认证路由
router.use('/auth', authRoutes);

// 挂载酒店模块路由
router.use('/hotel', hotelRoutes);

// 挂载上传路由
router.use('/upload', uploadRoutes);

// 后续可以在这里添加更多路由
// router.use('/orders', orderRoutes);

export default router;
