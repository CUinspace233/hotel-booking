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
 * POST   /api/hotel/projects/:hotelId/publish - 发布草稿
 * POST   /api/hotel/projects/:hotelId/sync-draft - 同步已发布数据到草稿
 * PUT    /api/hotel/projects/:hotelId/offline - 下线酒店（管理员）
 * PUT    /api/hotel/projects/:hotelId/online - 恢复上线（管理员）
 * PUT    /api/hotel/projects/:hotelId/withdraw-review - 撤回审核
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

// 发布草稿（将 draft 同步为 published）
router.post('/:hotelId/publish', HotelProjectController.publishDraft);

// 同步已发布数据到草稿（用于开始编辑已发布酒店）
router.post('/:hotelId/sync-draft', HotelProjectController.syncDraft);

// 下线酒店（管理员）
router.put('/:hotelId/offline', HotelProjectController.setOffline);

// 恢复上线（管理员）
router.put('/:hotelId/online', HotelProjectController.setOnline);

// 撤回审核
router.put('/:hotelId/withdraw-review', HotelProjectController.withdrawReview);

// 删除项目
router.delete('/:hotelId', HotelProjectController.delete);

export default router;
