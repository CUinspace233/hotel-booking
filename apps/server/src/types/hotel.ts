// ===================== 酒店相关 TypeScript 类型定义 =====================

// 酒店项目状态枚举
export type HotelStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'offline';

// 酒店类型
export type HotelType = 'standard' | 'boutique' | 'resort' | 'business' | 'apartment' | 'hostel';

// 房型类型
export type RoomType = 'standard' | 'deluxe' | 'suite' | 'family' | 'executive';

// 床型
export type BedType = 'single' | 'double' | 'queen' | 'king' | 'twin' | 'bunk';

// 窗户类型
export type WindowType = 'window' | 'no_window' | 'inner_window' | 'skylight';

// 早餐类型
export type BreakfastType = 'none' | 'chinese' | 'western' | 'buffet' | 'both';

// ===================== 第一层：酒店项目 =====================

// 创建酒店项目参数
export interface CreateHotelProjectParams {
  name?: string;
  hotelType?: HotelType;
  remark?: string;
  creatorId: number;
  creator: string;
}

// 更新酒店项目参数
export interface UpdateHotelProjectParams {
  name?: string;
  hotelType?: HotelType;
  remark?: string;
}

// 酒店项目列表查询参数
export interface HotelProjectListParams {
  page?: number;
  pageSize?: number;
  status?: HotelStatus;
  keyword?: string;
  creatorId?: number;
}

// 酒店项目响应（不含关联）
export interface HotelProjectResponse {
  id: number;
  hotelId: string;
  name: string | null;
  hotelType: string | null;
  status: string;
  creatorId: number;
  creator: string;
  remark: string | null;
  submitTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ===================== 第二层：酒店详情 =====================

// 更新酒店详情参数
export interface UpdateHotelDetailParams {
  fullName?: string;
  englishName?: string;
  starRating?: number;
  brand?: string;
  openingYear?: number;
  renovationYear?: number;
  totalRooms?: number;
  totalFloors?: number;
  country?: string;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  contactPhone?: string;
  contactEmail?: string;
  frontDeskPhone?: string;
  fax?: string;
  checkInTime?: string;
  checkOutTime?: string;
  childrenPolicy?: string;
  petPolicy?: string;
  cancelPolicy?: string;
  description?: string;
  highlight?: string;
  trafficInfo?: string;
  coverImage?: string;
}

// 酒店设施
export interface HotelFacilityItem {
  facilityCode: string;
  facilityName: string;
  facilityCategory?: string;
  isFree?: boolean;
}

// 酒店图片
export interface HotelImageItem {
  imageUrl: string;
  imageType?: string;
  sortOrder?: number;
}

// ===================== 第三层：房型信息 =====================

// 创建房型参数
export interface CreateHotelRoomParams {
  hotelId: string;
  name: string;
  roomType: RoomType;
  bedType?: BedType;
  bedCount?: number;
  bedSize?: string;
  area?: number;
  floorRange?: string;
  windowType?: WindowType;
  maxGuests?: number;
  basePrice: number;
  breakfastType?: BreakfastType;
  breakfastCount?: number;
  totalCount?: number;
  availableCount?: number;
  description?: string;
  coverImage?: string;
  sortOrder?: number;
}

// 更新房型参数
export interface UpdateHotelRoomParams {
  name?: string;
  roomType?: RoomType;
  bedType?: BedType;
  bedCount?: number;
  bedSize?: string;
  area?: number;
  floorRange?: string;
  windowType?: WindowType;
  maxGuests?: number;
  basePrice?: number;
  breakfastType?: BreakfastType;
  breakfastCount?: number;
  totalCount?: number;
  availableCount?: number;
  description?: string;
  coverImage?: string;
  sortOrder?: number;
  status?: string;
}

// 房型列表查询参数
export interface HotelRoomListParams {
  hotelId: string;
  status?: string;
}

// 房型设施
export interface RoomFacilityItem {
  facilityCode: string;
  facilityName: string;
}

// 房型图片
export interface RoomImageItem {
  imageUrl: string;
  sortOrder?: number;
}

// ===================== 分页响应 =====================

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  list: T[];
  pagination: PaginationInfo;
}
