/**
 * 文件上传 API
 */

// API 基础地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export interface UploadResponse {
  code: number;
  message: string;
  data: UploadResult | null;
}

export interface MultiUploadResponse {
  code: number;
  message: string;
  data: { images: UploadResult[] } | null;
}

/**
 * 上传单张图片
 * @param file 图片文件
 * @returns 上传结果
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });

  const result: UploadResponse = await response.json();

  // 后端成功时返回 code: 0（业务成功码），需同时兼容 200
  if ((result.code !== 0 && result.code !== 200) || !result.data) {
    throw new Error(result.message || '上传失败');
  }

  return result.data;
}

/**
 * 上传多张图片
 * @param files 图片文件数组
 * @returns 上传结果数组
 */
export async function uploadImages(files: File[]): Promise<UploadResult[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_BASE_URL}/api/upload/images`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });

  const result: MultiUploadResponse = await response.json();

  // 后端成功时返回 code: 0（业务成功码），需同时兼容 200
  if ((result.code !== 0 && result.code !== 200) || !result.data) {
    throw new Error(result.message || '上传失败');
  }

  return result.data.images;
}

/**
 * 获取完整的图片 URL
 * 如果是相对路径（本地上传的图片），添加 API 基础地址前缀
 * @param url 图片 URL
 * @returns 完整的图片 URL
 */
export function getFullImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE_URL}${url}`;
}

export const uploadApi = {
  uploadImage,
  uploadImages,
  getFullImageUrl
};

export default uploadApi;
