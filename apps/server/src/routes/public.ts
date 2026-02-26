import { Router, type IRouter } from 'express';
import { PublicController } from '../controllers/publicController';

const router: IRouter = Router();

// C 端酒店列表（分页，支持筛选）
router.get('/hotels', PublicController.hotelList);

// C 端酒店详情
router.get('/hotels/:hotelId', PublicController.hotelDetail);

export default router;
