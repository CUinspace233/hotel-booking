import { Request, Response } from 'express';
import { userService, ServiceError, LoginParams, RegisterParams } from '../services/userService';
import { ResponseUtil } from '../utils/response';
import { setTokenCookies, clearTokenCookies, AuthenticatedRequest } from '../middlewares/auth';

/**
 * 用户控制器（Controller）
 * 负责处理 HTTP 请求，参数校验，调用 Service 层
 */
class UserController {
  /**
   * 用户登录
   * POST /api/auth/login
   * 登录成功后，将加密的双 Token 设置到 HttpOnly Cookie
   */
  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password, role } = req.body;

      // 参数校验
      if (!username || !password || !role) {
        return ResponseUtil.error(res, '用户名、密码和角色不能为空');
      }

      if (!['admin', 'merchant'].includes(role)) {
        return ResponseUtil.error(res, '角色类型无效');
      }

      const params: LoginParams = { username, password, role };
      const result = await userService.login(params);

      // 设置加密后的 Token 到 Cookie
      setTokenCookies(res, result.accessToken, result.refreshToken);

      // 返回用户信息（不返回 Token，Token 通过 Cookie 传递）
      return ResponseUtil.success(res, { user: result.user }, '登录成功');
    } catch (error) {
      if (error instanceof ServiceError) {
        return ResponseUtil.error(res, error.message, error.code);
      }
      console.error('Login error:', error);
      return ResponseUtil.serverError(res, '登录失败，请稍后重试');
    }
  }

  /**
   * 用户登出
   * POST /api/auth/logout
   * 清除 Cookie 中的 Token
   */
  async logout(req: Request, res: Response): Promise<Response> {
    try {
      // 清除 Cookie
      clearTokenCookies(res);
      return ResponseUtil.success(res, null, '登出成功');
    } catch (error) {
      console.error('Logout error:', error);
      return ResponseUtil.serverError(res, '登出失败，请稍后重试');
    }
  }

  /**
   * 用户注册
   * POST /api/auth/register
   */
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password, email, phone, role } = req.body;

      // 参数校验
      if (!username || !password || !email || !phone) {
        return ResponseUtil.error(res, '用户名、密码、邮箱和手机号不能为空');
      }

      // 用户名格式校验
      if (username.length < 3 || username.length > 20) {
        return ResponseUtil.error(res, '用户名长度需在3-20个字符之间');
      }

      // 密码格式校验
      if (password.length < 6 || password.length > 20) {
        return ResponseUtil.error(res, '密码长度需在6-20个字符之间');
      }

      // 邮箱格式校验
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ResponseUtil.error(res, '邮箱格式不正确');
      }

      // 手机号格式校验
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return ResponseUtil.error(res, '手机号格式不正确');
      }

      // 角色校验
      if (role && !['admin', 'merchant'].includes(role)) {
        return ResponseUtil.error(res, '角色类型无效');
      }

      const params: RegisterParams = { username, password, email, phone, role };
      const user = await userService.register(params);

      return ResponseUtil.success(res, user, '注册成功');
    } catch (error) {
      if (error instanceof ServiceError) {
        return ResponseUtil.error(res, error.message, error.code);
      }
      console.error('Register error:', error);
      return ResponseUtil.serverError(res, '注册失败，请稍后重试');
    }
  }

  /**
   * 获取当前用户信息
   * GET /api/auth/profile
   */
  async getProfile(req: Request, res: Response): Promise<Response> {
    try {
      // 从中间件注入的用户信息中获取 userId
      const userId = (req as AuthenticatedRequest).userId;

      const user = await userService.getUserById(userId);
      if (!user) {
        return ResponseUtil.notFound(res, '用户不存在');
      }

      return ResponseUtil.success(res, user, '获取成功');
    } catch (error) {
      console.error('Get profile error:', error);
      return ResponseUtil.serverError(res, '获取用户信息失败');
    }
  }

  /**
   * 修改密码
   * PUT /api/auth/password
   */
  async changePassword(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { oldPassword, newPassword } = req.body;

      // 参数校验
      if (!oldPassword || !newPassword) {
        return ResponseUtil.error(res, '原密码和新密码不能为空');
      }

      if (newPassword.length < 6 || newPassword.length > 20) {
        return ResponseUtil.error(res, '新密码长度需在6-20个字符之间');
      }

      await userService.changePassword(userId, oldPassword, newPassword);

      // 修改密码成功后，清除 Cookie，要求重新登录
      clearTokenCookies(res);

      return ResponseUtil.success(res, null, '密码修改成功，请重新登录');
    } catch (error) {
      if (error instanceof ServiceError) {
        return ResponseUtil.error(res, error.message, error.code);
      }
      console.error('Change password error:', error);
      return ResponseUtil.serverError(res, '密码修改失败');
    }
  }
}

// 导出单例
export const userController = new UserController();
