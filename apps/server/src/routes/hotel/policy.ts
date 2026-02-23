import { Router, type IRouter } from 'express';
import { HotelPolicyController } from '../../controllers/hotel';
import { authMiddleware } from '../../middlewares/auth';

const router: IRouter = Router();

// 所有政策路由都需要认证
router.use(authMiddleware);

/**
 * 酒店政策路由
 *
 * GET    /api/hotel/policies              - 获取政策列表 (需要 ?hotelId=xxx)
 * PUT    /api/hotel/policies/batch        - 批量更新政策
 * GET    /api/hotel/policies/:policyId    - 获取单个政策
 * POST   /api/hotel/policies              - 创建政策
 * PUT    /api/hotel/policies/:policyId    - 更新政策
 * DELETE /api/hotel/policies/:policyId    - 删除政策
 */

// 获取政策列表（需要 query 参数 hotelId）
router.get('/', HotelPolicyController.list);

// 批量更新政策（必须在 /:policyId 之前定义）
router.put('/batch', HotelPolicyController.batchUpdate);

// 获取单个政策
router.get('/:policyId', HotelPolicyController.getOne);

// 创建政策
router.post('/', HotelPolicyController.create);

// 更新政策
router.put('/:policyId', HotelPolicyController.update);

// 删除政策
router.delete('/:policyId', HotelPolicyController.delete);

export default router;
