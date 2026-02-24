/**
 * 类型定义统一导出
 */

// 通用类型
export type { PaginationInfo, PaginatedResponse } from './common';

// 酒店相关类型
export type {
  HotelType,
  HotelStatus,
  VersionType,
  PolicyType,
  FacilityCategory,
  HotelProject,
  HotelDetail,
  RoomDetail,
  HotelFacility,
  HotelImage,
  RoomImage,
  PolicyDetail,
  FrontendRoomDetail,
  FrontendPolicyDetail,
  FrontendFacilityDetail,
  HotelFormData,
  CreateHotelProjectParams,
  UpdateHotelProjectParams,
  HotelProjectListParams,
  UpdateStatusParams,
  HotelFullInfo,
  UpdateHotelDetailParams,
  UpsertRoomParams,
  UpsertPolicyParams
} from './hotel';

// 认证相关类型
export type {
  LoginParams,
  LoginResult,
  RegisterParams,
  RegisterResult,
  UserProfile,
  ChangePasswordParams
} from './auth';
