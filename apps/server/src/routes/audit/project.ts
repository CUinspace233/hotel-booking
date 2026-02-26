import { Router, type IRouter } from 'express';
import { AuditProjectController } from '../../controllers/audit';

const router: IRouter = Router();

/**
 * 审核项目路由（需 adminOnly 中间件）
 * GET    /api/audit/projects              - 获取审核列表
 * GET    /api/audit/projects/:hotelId/detail - 获取审核用详情
 * POST   /api/audit/projects/:hotelId/approve - 审核通过
 * PUT    /api/audit/projects/:hotelId/reject  - 审核驳回
 * PUT    /api/audit/projects/:hotelId/offline - 下线
 * PUT    /api/audit/projects/:hotelId/online  - 恢复上线
 */

router.get('/', AuditProjectController.list);
router.get('/:hotelId/detail', AuditProjectController.getDetail);
router.post('/:hotelId/approve', AuditProjectController.approve);
router.put('/:hotelId/reject', AuditProjectController.reject);
router.put('/:hotelId/offline', AuditProjectController.setOffline);
router.put('/:hotelId/online', AuditProjectController.setOnline);

export default router;
