import { Router, type IRouter } from 'express';
import { userController } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router: IRouter = Router();

/**
 * 认证相关路由
 */

// 获取 RSA 公钥（供前端加密密码）- 无需认证
router.get('/public-key', (req, res) => userController.getPublicKey(req, res));

// 用户登录 - 无需认证
router.post('/login', (req, res) => userController.login(req, res));

// 用户登出 - 无需认证（清除 Cookie）
router.post('/logout', (req, res) => userController.logout(req, res));

// 用户注册 - 无需认证
router.post('/register', (req, res) => userController.register(req, res));

// 获取当前用户信息 - 需要认证
router.get('/profile', authMiddleware, (req, res) => userController.getProfile(req, res));

// 修改密码 - 需要认证
router.put('/password', authMiddleware, (req, res) => userController.changePassword(req, res));

export default router;
