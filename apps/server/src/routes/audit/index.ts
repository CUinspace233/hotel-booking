import { Router, type IRouter } from 'express';
import { authMiddleware, adminOnly } from '../../middlewares/auth';
import projectRoutes from './project';

const router: IRouter = Router();

// 审核路由需认证且仅管理员可访问
router.use(authMiddleware, adminOnly);
router.use('/projects', projectRoutes);

export default router;
