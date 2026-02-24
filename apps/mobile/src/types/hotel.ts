/**
 * C 端酒店类型定义
 */

// 酒店列表项
export interface HotelListItem {
  hotelId: string;
  name: string | null;
  hotelType: string | null;
  coverImage: string | null;
  starRating: number | null;
  city: string | null;
  district: string | null;
  address: string | null;
  description: string | null;
  minPrice: number | null;
  facilityCodes: string[];
}

// 酒店列表查询参数
export interface HotelListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  city?: string;
  starRating?: number;
  hotelType?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'default';
}

// 分页信息
export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// 酒店列表响应
export interface HotelListResponse {
  list: HotelListItem[];
  pagination: PaginationInfo;
}

// API 统一响应格式
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
}

// 筛选状态
export interface FilterState {
  keyword: string;
  city: string;
  checkInDate: string;
  checkOutDate: string;
  starRating: number | undefined;
  hotelType: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  sortBy: 'price_asc' | 'price_desc' | 'rating_desc' | 'default';
}

// 设施映射
export const FACILITY_MAP: Record<string, string> = {
  wifi: 'WiFi',
  parking: '停车场',
  breakfast: '早餐',
  pool: '泳池',
  gym: '健身房',
  spa: 'SPA',
  restaurant: '餐厅',
  bar: '酒吧',
  laundry: '洗衣',
  shuttle: '接驳车',
  meeting: '会议室',
  business: '商务中心'
};

// 酒店类型映射
export const HOTEL_TYPE_MAP: Record<string, string> = {
  standard: '标准酒店',
  boutique: '精品酒店',
  resort: '度假酒店',
  business: '商务酒店',
  apartment: '公寓',
  hostel: '经济型'
};

// 热门城市
export const HOT_CITIES = [
  '北京',
  '上海',
  '广州',
  '深圳',
  '杭州',
  '成都',
  '重庆',
  '西安',
  '南京',
  '武汉',
  '长沙',
  '厦门'
];
