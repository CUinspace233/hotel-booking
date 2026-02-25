import { Router, type IRouter } from 'express';
import authRoutes from './auth.js';
import hotelRoutes from './hotel/index.js';
import uploadRoutes from './upload.js';
import publicRoutes from './public.js';

const router: IRouter = Router();

// 挂载认证路由
router.use('/auth', authRoutes);

// 挂载酒店模块路由
router.use('/hotel', hotelRoutes);

// 挂载上传路由
router.use('/upload', uploadRoutes);

// 挂载 C 端公开路由（无需 auth）
router.use('/public', publicRoutes);

export default router;
