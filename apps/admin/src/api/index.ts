/**
 * API 模块统一导出
 */

// 认证相关 API
export {
  authApi,
  type LoginParams,
  type LoginResult,
  type RegisterParams,
  type RegisterResult,
  type UserProfile,
  type ChangePasswordParams
} from './auth';

// 酒店相关 API
export {
  hotelApi,
  type HotelType,
  type HotelStatus,
  type HotelProject,
  type HotelDetail,
  type PaginationInfo,
  type PaginatedResponse,
  type CreateHotelProjectParams,
  type UpdateHotelProjectParams,
  type HotelProjectListParams,
  type UpdateStatusParams
} from './hotel';
