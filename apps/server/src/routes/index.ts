import { Router, type IRouter } from 'express';
import authRoutes from './auth.js';

const router: IRouter = Router();

// 挂载认证路由
router.use('/auth', authRoutes);

// 后续可以在这里添加更多路由
// router.use('/hotels', hotelRoutes);
// router.use('/orders', orderRoutes);

export default router;
