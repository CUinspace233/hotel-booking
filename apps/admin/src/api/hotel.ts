import { rpc } from '@/utils/rpc';

// ===================== 类型定义 =====================

// 酒店类型枚举
export type HotelType =
  | 'business'
  | 'resort'
  | 'boutique'
  | 'budget'
  | 'apartment'
  | 'standard'
  | 'hostel';

// 酒店状态枚举
export type HotelStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'offline';

// 酒店项目数据（来自后端）
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
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  detail?: HotelDetail | null;
}

// 酒店详情
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
  contactPhone: string | null;
  contactEmail: string | null;
  frontDeskPhone: string | null;
  fax: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  childrenPolicy: string | null;
  petPolicy: string | null;
  cancelPolicy: string | null;
  description: string | null;
  highlight: string | null;
  trafficInfo: string | null;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
}

// 分页信息
export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[];
  pagination: PaginationInfo;
}

// 创建酒店项目参数
export interface CreateHotelProjectParams {
  name: string;
  hotelType: HotelType;
  remark?: string;
}

// 更新酒店项目参数
export interface UpdateHotelProjectParams {
  name?: string;
  hotelType?: HotelType;
  remark?: string;
}

// 查询酒店列表参数
export interface HotelProjectListParams {
  page?: number;
  pageSize?: number;
  status?: HotelStatus;
  keyword?: string;
}

// 更新状态参数
export interface UpdateStatusParams {
  status: HotelStatus;
}

// ===================== API 接口 =====================

/**
 * 酒店项目相关 API
 */
export const hotelApi = {
  /**
   * 获取酒店项目列表
   * @param params 查询参数
   */
  getList(params?: HotelProjectListParams): Promise<PaginatedResponse<HotelProject>> {
    return rpc.get<PaginatedResponse<HotelProject>>(
      '/hotel/projects',
      params as Record<string, unknown>
    );
  },

  /**
   * 获取单个酒店项目
   * @param hotelId 酒店业务ID
   */
  getOne(hotelId: string): Promise<HotelProject> {
    return rpc.get<HotelProject>(`/hotel/projects/${hotelId}`);
  },

  /**
   * 创建酒店项目
   * @param params 创建参数
   */
  create(params: CreateHotelProjectParams): Promise<HotelProject> {
    return rpc.post<HotelProject>('/hotel/projects', params);
  },

  /**
   * 更新酒店项目
   * @param hotelId 酒店业务ID
   * @param params 更新参数
   */
  update(hotelId: string, params: UpdateHotelProjectParams): Promise<HotelProject> {
    return rpc.put<HotelProject>(`/hotel/projects/${hotelId}`, params);
  },

  /**
   * 更新酒店状态
   * @param hotelId 酒店业务ID
   * @param status 新状态
   */
  updateStatus(hotelId: string, status: HotelStatus): Promise<HotelProject> {
    return rpc.put<HotelProject>(`/hotel/projects/${hotelId}/status`, { status });
  },

  /**
   * 删除酒店项目（软删除）
   * @param hotelId 酒店业务ID
   */
  delete(hotelId: string): Promise<null> {
    return rpc.delete<null>(`/hotel/projects/${hotelId}`);
  },

  /**
   * 提交审核（将状态从draft改为pending）
   * @param hotelId 酒店业务ID
   */
  submitReview(hotelId: string): Promise<HotelProject> {
    return rpc.put<HotelProject>(`/hotel/projects/${hotelId}/status`, { status: 'pending' });
  }
};

export default hotelApi;
