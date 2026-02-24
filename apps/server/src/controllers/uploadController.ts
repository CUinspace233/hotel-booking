import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ResponseUtil } from '../utils/response';

// 上传目录
const UPLOAD_DIR = path.join(__dirname, '../../uploads/images');

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 允许的文件类型
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// 文件大小限制：2MB
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件格式，仅支持 jpg、png、webp、gif'));
  }
};

// 创建 multer 实例
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

/**
 * 上传控制器
 */
export class UploadController {
  /**
   * 上传单张图片
   * POST /api/upload/image
   */
  static async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return ResponseUtil.error(res, '请选择要上传的图片', 400);
      }

      const imageUrl = `/uploads/images/${req.file.filename}`;

      return ResponseUtil.success(
        res,
        {
          url: imageUrl,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype
        },
        '上传成功'
      );
    } catch (err) {
      console.error('[UploadController.uploadImage] Error:', err);
      return ResponseUtil.serverError(res, '上传失败');
    }
  }

  /**
   * 上传多张图片
   * POST /api/upload/images
   */
  static async uploadImages(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return ResponseUtil.error(res, '请选择要上传的图片', 400);
      }

      const images = files.map((file) => ({
        url: `/uploads/images/${file.filename}`,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype
      }));

      return ResponseUtil.success(res, { images }, '上传成功');
    } catch (err) {
      console.error('[UploadController.uploadImages] Error:', err);
      return ResponseUtil.serverError(res, '上传失败');
    }
  }

  /**
   * 删除图片
   * DELETE /api/upload/image/:filename
   */
  static async deleteImage(req: Request, res: Response) {
    try {
      const filename = req.params.filename as string;

      if (!filename) {
        return ResponseUtil.error(res, '文件名不能为空', 400);
      }

      const filePath = path.join(UPLOAD_DIR, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return ResponseUtil.success(res, null, '删除成功');
    } catch (err) {
      console.error('[UploadController.deleteImage] Error:', err);
      return ResponseUtil.serverError(res, '删除失败');
    }
  }
}
