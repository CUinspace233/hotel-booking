import axios from 'axios';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';

/**
 * 统一响应数据格式（与后端一致）
 */
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

/**
 * 请求配置扩展
 */
interface RequestConfig extends AxiosRequestConfig {
  // 是否显示错误提示，默认 true
  showError?: boolean;
  // 是否跳过 Token 认证
  skipAuth?: boolean;
}

/**
 * RPC 错误类
 */
export class RpcError extends Error {
  code: number;
  data: unknown;

  constructor(message: string, code: number = -1, data: unknown = null) {
    super(message);
    this.name = 'RpcError';
    this.code = code;
    this.data = data;
  }
}

/**
 * RPC 请求封装类
 * 统一管理项目中的所有 HTTP 请求
 */
class Rpc {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor() {
    // 根据环境配置 baseURL
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003/api';

    // 创建 axios 实例
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 15000, // 15秒超时
      withCredentials: true, // 允许携带 Cookie（用于认证）
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 初始化拦截器
    this.initInterceptors();
  }

  /**
   * 初始化请求和响应拦截器
   */
  private initInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig & { skipAuth?: boolean }) => {
        // 如果不跳过认证，则添加 Token
        if (!config.skipAuth) {
          const token = this.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        // 打印请求日志（开发环境）
        if (import.meta.env.DEV) {
          console.log(
            `[RPC Request] ${config.method?.toUpperCase()} ${config.url}`,
            config.data || config.params
          );
        }

        return config;
      },
      (error) => {
        console.error('[RPC Request Error]', error);
        return Promise.reject(new RpcError('请求配置错误', -1));
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data } = response;

        // 打印响应日志（开发环境）
        if (import.meta.env.DEV) {
          console.log(`[RPC Response] ${response.config.url}`, data);
        }

        // 业务逻辑成功（code === 0 表示成功）
        if (data.code === 0) {
          return response;
        }

        // 业务逻辑失败，抛出错误
        return Promise.reject(new RpcError(data.message || '请求失败', data.code, data.data));
      },
      (error) => {
        // HTTP 错误处理
        if (error.response) {
          const { status, data } = error.response;

          // Token 过期或未授权
          if (status === 401) {
            this.handleUnauthorized();
            return Promise.reject(new RpcError('登录已过期，请重新登录', 401));
          }

          // 权限不足
          if (status === 403) {
            return Promise.reject(new RpcError('权限不足', 403));
          }

          // 服务器错误
          if (status >= 500) {
            return Promise.reject(new RpcError('服务器错误，请稍后重试', status));
          }

          // 其他错误
          return Promise.reject(
            new RpcError(data?.message || '请求失败', data?.code || status, data?.data)
          );
        }

        // 网络错误
        if (error.request) {
          return Promise.reject(new RpcError('网络连接失败，请检查网络', -1));
        }

        // 请求被取消
        if (axios.isCancel(error)) {
          return Promise.reject(new RpcError('请求已取消', -2));
        }

        // 其他错误
        return Promise.reject(new RpcError(error.message || '未知错误', -1));
      }
    );
  }

  /**
   * 获取存储的 Token
   */
  private getToken(): string | null {
    try {
      const userStorage = localStorage.getItem('user-storage');
      if (userStorage) {
        const parsed = JSON.parse(userStorage);
        return parsed?.state?.userInfo?.token || null;
      }
    } catch {
      console.warn('解析 Token 失败');
    }
    return null;
  }

  /**
   * 处理未授权（Token 过期等）
   */
  private handleUnauthorized(): void {
    // 清除本地存储
    localStorage.removeItem('user-storage');
    // 跳转到登录页
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  /**
   * GET 请求
   */
  async get<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.instance.get<ApiResponse<T>>(url, { params, ...config });
    return response.data.data;
  }

  /**
   * POST 请求
   */
  async post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  /**
   * PUT 请求
   */
  async put<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  /**
   * DELETE 请求
   */
  async delete<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.instance.delete<ApiResponse<T>>(url, { params, ...config });
    return response.data.data;
  }

  /**
   * PATCH 请求
   */
  async patch<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  /**
   * 文件上传
   */
  async upload<T = unknown>(
    url: string,
    file: File,
    fieldName: string = 'file',
    extraData?: Record<string, unknown>,
    config?: RequestConfig
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    // 添加额外数据
    if (extraData) {
      Object.entries(extraData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const response = await this.instance.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  }
}

// 导出单例实例
export const rpc = new Rpc();

// 默认导出
export default rpc;

/**
 * 简化的 API 调用接口
 * 支持类似 api.get('/url', params, config) 的调用方式
 *
 * 使用示例：
 * 1. 简单GET请求：const resp = await api.get('/marketing/getAddress', {}, { timeout: 60000 });
 * 2. 带参数的GET请求：const res = await api.get('/coupon/cancel', { params: { id: 1, name: 'test' } });
 * 3. POST请求：const data = await api.post('/user/create', { name: 'test' });
 */
export const api = {
  /**
   * GET 请求
   * @param url 请求地址
   * @param params 查询参数（可直接传对象，也可包装在 { params: {} } 中）
   * @param config 额外配置（如 timeout）
   */
  get: async <T = unknown>(
    url: string,
    params?: Record<string, unknown> | { params?: Record<string, unknown> },
    config?: RequestConfig
  ): Promise<T> => {
    // 兼容两种传参方式
    let queryParams: Record<string, unknown> | undefined = undefined;
    let finalConfig: RequestConfig | undefined = config;

    if (params && typeof params === 'object' && 'params' in params) {
      // 方式2：{ params: { ... } } 形式
      const paramsObj = params as { params?: Record<string, unknown>; [key: string]: unknown };
      queryParams = paramsObj.params;
      // 合并其他配置项（排除params）
      const { params: _, ...restParams } = paramsObj;
      finalConfig = { ...restParams, ...config } as RequestConfig;
    } else if (params) {
      // 方式1：直接传递参数对象
      queryParams = params as Record<string, unknown>;
    }

    return rpc.get<T>(url, queryParams, finalConfig);
  },

  /**
   * POST 请求
   * @param url 请求地址
   * @param data 请求体数据
   * @param config 额外配置（如 timeout）
   */
  post: async <T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> => {
    return rpc.post<T>(url, data, config);
  },

  /**
   * PUT 请求
   * @param url 请求地址
   * @param data 请求体数据
   * @param config 额外配置（如 timeout）
   */
  put: async <T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> => {
    return rpc.put<T>(url, data, config);
  },

  /**
   * DELETE 请求
   * @param url 请求地址
   * @param params 查询参数
   * @param config 额外配置（如 timeout）
   */
  delete: async <T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: RequestConfig
  ): Promise<T> => {
    return rpc.delete<T>(url, params, config);
  },

  /**
   * PATCH 请求
   * @param url 请求地址
   * @param data 请求体数据
   * @param config 额外配置（如 timeout）
   */
  patch: async <T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> => {
    return rpc.patch<T>(url, data, config);
  },

  /**
   * 文件上传
   * @param url 请求地址
   * @param file 文件对象
   * @param fieldName 文件字段名，默认 'file'
   * @param extraData 额外数据
   * @param config 额外配置
   */
  upload: async <T = unknown>(
    url: string,
    file: File,
    fieldName: string = 'file',
    extraData?: Record<string, unknown>,
    config?: RequestConfig
  ): Promise<T> => {
    return rpc.upload<T>(url, file, fieldName, extraData, config);
  }
};
