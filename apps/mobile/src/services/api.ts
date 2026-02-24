import Taro from '@tarojs/taro';
import type { HotelListParams, HotelListResponse, ApiResponse } from '../types/hotel';

// API 基础地址
const BASE_URL = 'http://localhost:3003/api';

/**
 * 通用请求封装
 */
async function request<T>(options: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, unknown>;
}): Promise<T> {
  const { url, method = 'GET', data } = options;

  const response = await Taro.request<ApiResponse<T>>({
    url: `${BASE_URL}${url}`,
    method,
    data,
    header: {
      'Content-Type': 'application/json'
    }
  });

  const result = response.data;

  if (result.code !== 0) {
    throw new Error(result.message || '请求失败');
  }

  return result.data as T;
}

/**
 * 获取 C 端酒店列表
 */
export async function getHotelList(params: HotelListParams): Promise<HotelListResponse> {
  // 过滤掉 undefined 的参数
  const query: Record<string, unknown> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'default') {
      query[key] = value;
    }
  });

  return request<HotelListResponse>({
    url: '/public/hotels',
    method: 'GET',
    data: query
  });
}

/**
 * 获取 C 端酒店详情
 */
export async function getHotelDetail(hotelId: string) {
  return request({
    url: `/public/hotels/${hotelId}`,
    method: 'GET'
  });
}
