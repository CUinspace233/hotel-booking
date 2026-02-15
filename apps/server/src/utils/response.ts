import { Response } from 'express';

// 统一响应格式
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
}

// 响应工具类
export class ResponseUtil {
  /**
   * 成功响应
   */
  static success<T>(res: Response, data: T, message = '操作成功'): Response {
    const response: ApiResponse<T> = {
      code: 0, // 业务成功码为 0，区分于 HTTP 状态码
      message,
      data
    };
    return res.status(200).json(response);
  }

  /**
   * 失败响应
   */
  static error(res: Response, message = '操作失败', code = 400): Response {
    const response: ApiResponse = {
      code,
      message,
      data: null
    };
    return res.status(code).json(response);
  }

  /**
   * 未授权响应
   */
  static unauthorized(res: Response, message = '未授权，请先登录'): Response {
    return this.error(res, message, 401);
  }

  /**
   * 禁止访问响应
   */
  static forbidden(res: Response, message = '权限不足'): Response {
    return this.error(res, message, 403);
  }

  /**
   * 资源不存在响应
   */
  static notFound(res: Response, message = '资源不存在'): Response {
    return this.error(res, message, 404);
  }

  /**
   * 服务器错误响应
   */
  static serverError(res: Response, message = '服务器内部错误'): Response {
    return this.error(res, message, 500);
  }
}
