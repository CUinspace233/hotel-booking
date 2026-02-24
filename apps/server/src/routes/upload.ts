import { Router, type IRouter, Request, Response, NextFunction } from 'express';
import { UploadController, upload } from '../controllers/uploadController';
import { authMiddleware } from '../middlewares/auth';
import { ResponseUtil } from '../utils/response';
import multer from 'multer';

const router: IRouter = Router();

// 所有上传路由都需要认证
router.use(authMiddleware);

/**
 * 上传路由
 *
 * POST   /api/upload/image   - 上传单张图片
 * POST   /api/upload/images  - 上传多张图片
 * DELETE /api/upload/image/:filename - 删除图片
 */

// Multer 错误处理中间件
const handleMulterError = (err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return ResponseUtil.error(res, '图片大小不能超过 2MB', 400);
    }
    return ResponseUtil.error(res, `上传错误: ${err.message}`, 400);
  } else if (err) {
    return ResponseUtil.error(res, err.message || '上传失败', 400);
  }
  next();
};

// 上传单张图片
router.post('/image', upload.single('file'), handleMulterError, UploadController.uploadImage);

// 上传多张图片（最多 10 张）
router.post('/images', upload.array('files', 10), handleMulterError, UploadController.uploadImages);

// 删除图片
router.delete('/image/:filename', UploadController.deleteImage);

export default router;
