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
  score: number | null;
  reviewCount: number | null;
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
  roomCount: number;
  adultCount: number;
  starRating: number | undefined;
  hotelType: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  sortBy: 'price_asc' | 'price_desc' | 'rating_desc' | 'default';
}

// 搜索建议项
export interface SearchSuggestionItem {
  hotelId: string;
  name: string;
  city: string;
  district: string;
  address: string;
  minPrice: number | null;
  starRating: number | null;
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

// ===================== 酒店详情页类型定义 =====================

// 酒店图片
export interface HotelImageInfo {
  id: number;
  imageUrl: string;
  imageType: string;
  sortOrder: number;
}

// 酒店设施
export interface HotelFacilityInfo {
  id: number;
  facilityCode: string;
  facilityName: string;
  facilityCategory: string | null;
  description: string | null;
  isFree: boolean;
}

// 酒店政策
export interface HotelPolicyInfo {
  id: number;
  policyId: string;
  policyType: string;
  policyName: string;
  policyContent: string | null;
  sortOrder: number;
}

// 酒店详情版本（published）
export interface HotelDetailInfo {
  id: number;
  hotelId: string;
  version: string;
  fullName: string | null;
  englishName: string | null;
  starRating: number | null;
  brand: string | null;
  openingYear: number | null;
  renovationYear: number | null;
  totalRooms: number | null;
  totalFloors: number | null;
  country: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  longitude: number | null;
  latitude: number | null;
  phone: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  description: string | null;
  highlight: string | null;
  coverImage: string | null;
  facilities: HotelFacilityInfo[];
  images: HotelImageInfo[];
  policies: HotelPolicyInfo[];
}

// 房型图片
export interface RoomImageInfo {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

// 房型设施
export interface RoomFacilityInfo {
  id: number;
  facilityCode: string;
  facilityName: string;
}

// 房型信息
export interface HotelRoomInfo {
  id: number;
  roomId: string;
  hotelId: string;
  version: string;
  roomName: string;
  roomType: string | null;
  bedType: string | null;
  bedCount: string | null;
  bedSize: string | null;
  roomSize: string | null;
  floor: string | null;
  windowType: string | null;
  maxOccupancy: string | null;
  basePrice: number | null;
  breakfastType: string | null;
  breakfastCount: number | null;
  totalCount: number | null;
  availableCount: number | null;
  description: string | null;
  coverImage: string | null;
  status: string;
  sortOrder: number;
  facilities: RoomFacilityInfo[];
  images: RoomImageInfo[];
}

// 酒店统计
export interface HotelStatsInfo {
  id: number;
  hotelId: string;
  score: number;
  reviewCount: number;
}

// 酒店详情完整响应
export interface HotelDetailResponse {
  id: number;
  hotelId: string;
  name: string | null;
  hotelType: string | null;
  status: string;
  details: HotelDetailInfo[];
  rooms: HotelRoomInfo[];
  stats: HotelStatsInfo | null;
}

// 床型映射
export const BED_TYPE_MAP: Record<string, string> = {
  single: '单人床',
  double: '双人床',
  queen: '大床',
  king: '特大床',
  twin: '双床',
  bunk: '上下铺'
};

// 窗户类型映射
export const WINDOW_TYPE_MAP: Record<string, string> = {
  window: '有窗',
  no_window: '无窗',
  inner_window: '内窗',
  skylight: '天窗'
};

// 早餐类型映射
export const BREAKFAST_TYPE_MAP: Record<string, string> = {
  none: '不含早',
  chinese: '中式早餐',
  western: '西式早餐',
  buffet: '自助早餐',
  both: '中西早餐'
};
