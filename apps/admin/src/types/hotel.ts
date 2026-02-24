/**
 * 酒店相关类型定义
 */

// ===================== 枚举类型 =====================

/** 酒店类型枚举 */
export type HotelType =
  | 'business'
  | 'resort'
  | 'boutique'
  | 'budget'
  | 'apartment'
  | 'standard'
  | 'hostel';

/**
 * 酒店状态枚举
 * pending_update: 已发布的酒店二次提审中
 */
export type HotelStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'offline'
  | 'pending_update';

/** 版本类型 */
export type VersionType = 'draft' | 'published';

/** 政策类型枚举 */
export type PolicyType = 'checkIn' | 'checkOut' | 'pet' | 'cancel' | 'parking' | 'other';

/** 设施分类类型 */
export type FacilityCategory =
  | 'transport'
  | 'family'
  | 'dining'
  | 'sports'
  | 'reception'
  | 'business'
  | 'public'
  | 'cleaning'
  | 'security';

// ===================== 数据模型 =====================

/** 酒店项目数据（来自后端） */
export interface HotelProject {
  id: number;
  hotelId: string;
  name: string | null;
  hotelType: string | null;
  status: HotelStatus;
  creatorId: number;
  creator: string;
  remark: string | null;
  submitTime: string | null;
  hasUnpublishedChanges: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  detail?: HotelDetail | null;
}

/** 酒店详情（与后端 HotelDetail 表对应） */
export interface HotelDetail {
  id: number;
  hotelId: string;
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
  contactEmail: string | null;
  frontDeskPhone: string | null;
  fax: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  childrenPolicy: string | null;
  petPolicy: string | null;
  cancellationPolicy: string | null;
  otherPolicies: string | null;
  description: string | null;
  highlight: string | null;
  trafficInfo: string | null;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 房间详情（与后端 HotelRoom 表对应，字段已统一） */
export interface RoomDetail {
  id: number;
  roomId: string;
  hotelId: string;
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
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 酒店设施 */
export interface HotelFacility {
  id: number;
  hotelId: string;
  facilityCode: string;
  facilityName: string;
  facilityCategory: string | null;
  description: string | null;
  isFree: boolean;
  createdAt: string;
}

/** 酒店图片 */
export interface HotelImage {
  id: number;
  hotelId: string;
  imageUrl: string;
  imageType: string;
  sortOrder: number;
  createdAt: string;
}

/** 房型图片 */
export interface RoomImage {
  id: number;
  roomId: string;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
}

/** 政策详情（后端返回） */
export interface PolicyDetail {
  id: number;
  policyId: string;
  hotelId: string;
  policyType: PolicyType;
  policyName: string;
  policyContent: string | null;
  sortOrder: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===================== 前端表单类型 =====================

/** 前端房间详情（简化版，用于表单） */
export interface FrontendRoomDetail {
  id: string;
  roomName: string;
  bedCount: string;
  roomSize: string;
  maxOccupancy: string;
  floor: string;
  basePrice: string;
  totalCount: string; // 库存数量（房间总数）
}

/** 前端政策详情（用于表单） */
export interface FrontendPolicyDetail {
  id: string;
  policyType: PolicyType;
  policyName: string;
  policyContent: string;
}

/** 前端设施详情（用于表单） */
export interface FrontendFacilityDetail {
  id: string;
  category: string;
  facilityCode: string;
  facilityName: string;
  description?: string;
}

/** 前端酒店表单数据 */
export interface HotelFormData {
  name: string;
  address: string;
  phone: string;
  starRating: number;
  openingYear?: number;
  description: string;
  images: string[];
  roomTypes: string[];
  facilities: FrontendFacilityDetail[];
  status: string;
  policies: FrontendPolicyDetail[];
  roomDetails: FrontendRoomDetail[];
}

// ===================== API 参数类型 =====================

/** 创建酒店项目参数 */
export interface CreateHotelProjectParams {
  name: string;
  hotelType: HotelType;
  remark?: string;
}

/** 更新酒店项目参数 */
export interface UpdateHotelProjectParams {
  name?: string;
  hotelType?: HotelType;
  remark?: string;
}

/** 查询酒店列表参数 */
export interface HotelProjectListParams {
  page?: number;
  pageSize?: number;
  status?: HotelStatus;
  keyword?: string;
}

/** 更新状态参数 */
export interface UpdateStatusParams {
  status: HotelStatus;
}

/** 酒店完整信息响应类型 */
export interface HotelFullInfo {
  project: HotelProject;
  detail: HotelDetail | null;
  rooms: RoomDetail[];
  facilities: HotelFacility[];
  images: HotelImage[];
}

/** 更新酒店详情参数 */
export interface UpdateHotelDetailParams {
  address?: string;
  phone?: string;
  starRating?: number;
  openingYear?: number;
  description?: string;
  checkInTime?: string;
  checkOutTime?: string;
  petPolicy?: string;
  cancellationPolicy?: string;
  otherPolicies?: string;
}

/** 创建/更新房间参数 */
export interface UpsertRoomParams {
  roomId?: string;
  roomName: string;
  bedCount?: string;
  roomSize?: string;
  maxOccupancy?: string;
  floor?: string;
  basePrice?: number;
  totalCount?: number; // 库存数量（房间总数）
}

/** 创建/更新政策参数 */
export interface UpsertPolicyParams {
  policyId?: string;
  policyType: PolicyType;
  policyName: string;
  policyContent?: string;
}
