// ===================== 酒店相关 TypeScript 类型定义 =====================

// 酒店项目状态枚举
// pending_update: 已发布的酒店二次提审中
export type HotelStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'offline'
  | 'pending_update';

// 版本类型
export type VersionType = 'draft' | 'published';

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
  status?: HotelStatus | 'all';
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
  hasUnpublishedChanges: boolean;
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
  description?: string;
  isFree?: boolean;
}

// 酒店图片
export interface HotelImageItem {
  imageUrl: string;
  imageType?: string;
  sortOrder?: number;
}

// ===================== 第三层：房型信息 =====================

// 创建房型参数（与 Prisma Schema 字段统一）
export interface CreateHotelRoomParams {
  hotelId: string;
  roomName: string; // 与前端统一
  roomType?: string; // 改为可选
  bedType?: BedType;
  bedCount?: string; // String 类型，与前端统一
  bedSize?: string;
  roomSize?: string; // 与前端统一（原 area）
  floor?: string; // 与前端统一（原 floorRange）
  windowType?: WindowType;
  maxOccupancy?: string; // String 类型，与前端统一（原 maxGuests）
  basePrice?: number; // 改为可选
  breakfastType?: BreakfastType;
  breakfastCount?: number;
  totalCount?: number;
  availableCount?: number;
  description?: string;
  coverImage?: string;
  sortOrder?: number;
}

// 更新房型参数（与 Prisma Schema 字段统一）
export interface UpdateHotelRoomParams {
  roomName?: string; // 与前端统一
  roomType?: string;
  bedType?: BedType;
  bedCount?: string; // String 类型
  bedSize?: string;
  roomSize?: string; // 与前端统一
  floor?: string; // 与前端统一
  windowType?: WindowType;
  maxOccupancy?: string; // String 类型
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

// 批量更新房间参数（与前端 UpsertRoomParams 对应）
export interface BatchUpdateRoomItem {
  roomId?: string; // 有 roomId 表示更新，无 roomId 表示新增
  roomName: string;
  bedCount?: string;
  roomSize?: string;
  maxOccupancy?: string;
  floor?: string;
  basePrice?: number;
  totalCount?: number; // 库存数量（房间总数）
}

// 批量更新房间请求
export interface BatchUpdateRoomsParams {
  hotelId: string;
  rooms: BatchUpdateRoomItem[];
  version?: VersionType; // 默认 draft
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

// ===================== 酒店政策 =====================

// 政策类型枚举
export type PolicyType = 'checkIn' | 'checkOut' | 'pet' | 'cancel' | 'parking' | 'other';

// 创建政策参数
export interface CreatePolicyParams {
  hotelId: string;
  policyType: PolicyType;
  policyName: string;
  policyContent?: string;
  sortOrder?: number;
}

// 更新政策参数
export interface UpdatePolicyParams {
  policyType?: PolicyType;
  policyName?: string;
  policyContent?: string;
  sortOrder?: number;
}

// 批量更新政策项
export interface BatchUpdatePolicyItem {
  policyId?: string;
  policyType: PolicyType;
  policyName: string;
  policyContent?: string;
}

// 批量更新政策请求
export interface BatchUpdatePoliciesParams {
  hotelId: string;
  policies: BatchUpdatePolicyItem[];
  version?: VersionType; // 默认 draft
}

// ===================== 版本管理 =====================

// 获取指定版本数据的参数
export interface GetVersionParams {
  hotelId: string;
  version: VersionType;
}

// 发布草稿（将 draft 同步为 published）
export interface PublishDraftParams {
  hotelId: string;
}

// 创建草稿副本（从 published 复制到 draft）
export interface CreateDraftFromPublishedParams {
  hotelId: string;
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
