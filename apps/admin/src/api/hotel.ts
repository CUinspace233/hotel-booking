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
  hasUnpublishedChanges: boolean; // 是否有未发布的修改
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  detail?: HotelDetail | null;
}

// 酒店详情（与后端 HotelDetail 表对应）
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
  phone: string | null; // 联系电话（与前端统一）
  contactEmail: string | null;
  frontDeskPhone: string | null;
  fax: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  childrenPolicy: string | null;
  petPolicy: string | null;
  cancellationPolicy: string | null; // 取消政策（与前端统一）
  otherPolicies: string | null; // 其他政策（前端独有字段）
  description: string | null;
  highlight: string | null;
  trafficInfo: string | null;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
}

// 房间详情（与后端 HotelRoom 表对应，字段已统一）
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

// 酒店设施
export interface HotelFacility {
  id: number;
  hotelId: string;
  facilityCode: string;
  facilityName: string;
  facilityCategory: string | null;
  isFree: boolean;
  createdAt: string;
}

// 酒店图片
export interface HotelImage {
  id: number;
  hotelId: string;
  imageUrl: string;
  imageType: string;
  sortOrder: number;
  createdAt: string;
}

// ===================== 政策类型定义 =====================

// 政策类型枚举
export type PolicyType = 'checkIn' | 'checkOut' | 'pet' | 'cancel' | 'parking' | 'other';

// 预设政策类型选项
export const POLICY_TYPE_OPTIONS: { value: PolicyType; label: string }[] = [
  { value: 'checkIn', label: '入住时间' },
  { value: 'checkOut', label: '退房时间' },
  { value: 'pet', label: '宠物政策' },
  { value: 'cancel', label: '取消政策' },
  { value: 'parking', label: '停车政策' },
  { value: 'other', label: '其它政策' }
];

// 根据政策类型获取默认名称
export function getPolicyNameByType(type: PolicyType): string {
  const option = POLICY_TYPE_OPTIONS.find((o) => o.value === type);
  return option ? option.label : '';
}

// 政策详情（后端返回）
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

// ===================== 前端表单类型（与页面组件对应） =====================

// 前端房间详情（简化版，用于表单）
export interface FrontendRoomDetail {
  id: string;
  roomName: string;
  bedCount: string;
  roomSize: string;
  maxOccupancy: string;
  floor: string;
  basePrice: string;
}

// 前端政策详情（用于表单）
export interface FrontendPolicyDetail {
  id: string;
  policyType: PolicyType;
  policyName: string;
  policyContent: string;
}

// 前端酒店表单数据
export interface HotelFormData {
  name: string;
  address: string;
  phone: string;
  starRating: number;
  description: string;
  images: string[];
  roomTypes: string[];
  facilities: string[];
  status: string;
  policies: FrontendPolicyDetail[];
  roomDetails: FrontendRoomDetail[];
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

// ===================== 酒店完整信息响应类型 =====================

export interface HotelFullInfo {
  project: HotelProject;
  detail: HotelDetail | null;
  rooms: RoomDetail[];
  facilities: HotelFacility[];
  images: HotelImage[];
}

// 更新酒店详情参数
export interface UpdateHotelDetailParams {
  address?: string;
  phone?: string;
  starRating?: number;
  description?: string;
  checkInTime?: string;
  checkOutTime?: string;
  petPolicy?: string;
  cancellationPolicy?: string;
  otherPolicies?: string;
}

// 创建/更新房间参数
export interface UpsertRoomParams {
  roomId?: string;
  roomName: string;
  bedCount?: string;
  roomSize?: string;
  maxOccupancy?: string;
  floor?: string;
  basePrice?: number;
}

// 创建/更新政策参数
export interface UpsertPolicyParams {
  policyId?: string;
  policyType: PolicyType;
  policyName: string;
  policyContent?: string;
}

// ===================== 数据转换工具函数 =====================

/**
 * 将后端完整数据转换为前端表单数据
 *
 * 后端返回的是 Prisma 直接查询结果，结构为：
 * {
 *   id, hotelId, name, status, ...  // 项目字段在顶层
 *   details: [{ address, phone, ..., facilities: [], images: [], policies: [] }], // 数组，支持多版本
 *   rooms: []
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformToFormData(fullInfo: any): HotelFormData {
  // 后端返回的对象本身就是 project（项目字段在顶层）
  const project = fullInfo || {};
  // details 现在是数组（支持多版本），取第一个元素
  const details = fullInfo?.details || [];
  const detail = details[0] || null;
  const rooms = fullInfo?.rooms || [];
  // facilities、images、policies 嵌套在 detail 内部
  const facilities = detail?.facilities || [];
  const images = detail?.images || [];
  const policies = detail?.policies || [];

  return {
    name: project.name || '',
    address: detail?.address || '',
    phone: detail?.phone || '',
    starRating: detail?.starRating || 0,
    description: detail?.description || '',
    images: images.map((img: HotelImage) => img.imageUrl),
    roomTypes: [...new Set(rooms.map((r: RoomDetail) => r.roomType).filter(Boolean))] as string[],
    facilities: facilities.map((f: HotelFacility) => f.facilityCode),
    status: project.status || 'draft',
    policies: policies.map((p: PolicyDetail) => ({
      id: p.policyId || '',
      policyType: p.policyType || 'other',
      policyName: p.policyName || '',
      policyContent: p.policyContent || ''
    })),
    roomDetails: rooms.map((room: RoomDetail) => ({
      id: room.roomId || '',
      roomName: room.roomName || '',
      bedCount: room.bedCount || '',
      roomSize: room.roomSize || '',
      maxOccupancy: room.maxOccupancy || '',
      floor: room.floor || '',
      basePrice: room.basePrice != null ? String(room.basePrice / 100) : ''
    }))
  };
}

/**
 * 将前端表单数据转换为后端更新参数
 */
export function transformFromFormData(formData: HotelFormData): {
  project: UpdateHotelProjectParams;
  detail: UpdateHotelDetailParams;
  rooms: UpsertRoomParams[];
  policies: UpsertPolicyParams[];
} {
  return {
    project: {
      name: formData.name
    },
    detail: {
      address: formData.address,
      phone: formData.phone,
      starRating: formData.starRating,
      description: formData.description
    },
    rooms: formData.roomDetails.map((room) => ({
      roomId: room.id,
      roomName: room.roomName,
      bedCount: room.bedCount,
      roomSize: room.roomSize,
      maxOccupancy: room.maxOccupancy,
      floor: room.floor,
      basePrice: room.basePrice ? Math.round(parseFloat(room.basePrice) * 100) : undefined
    })),
    policies: formData.policies.map((policy) => ({
      policyId: policy.id.startsWith('new_') ? undefined : policy.id,
      policyType: policy.policyType,
      policyName: policy.policyName,
      policyContent: policy.policyContent
    }))
  };
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
  },

  // ===================== 酒店详情相关 API =====================

  /**
   * 获取酒店完整信息（包含详情、房间、设施、图片）
   * @param hotelId 酒店业务ID
   * @param version 版本类型：draft（草稿）/ published（已发布）
   */
  getFullInfo(hotelId: string, version: VersionType = 'draft'): Promise<HotelFullInfo> {
    return rpc.get<HotelFullInfo>(`/hotel/full/${hotelId}`, { version });
  },

  /**
   * 获取酒店详情
   * @param hotelId 酒店业务ID
   */
  getDetail(hotelId: string): Promise<HotelDetail> {
    return rpc.get<HotelDetail>(`/hotel/details/${hotelId}`);
  },

  /**
   * 更新酒店详情
   * @param hotelId 酒店业务ID
   * @param params 更新参数
   */
  updateDetail(hotelId: string, params: UpdateHotelDetailParams): Promise<HotelDetail> {
    return rpc.put<HotelDetail>(`/hotel/details/${hotelId}`, params);
  },

  /**
   * 获取酒店完整信息并转换为表单数据
   * @param hotelId 酒店业务ID
   * @param version 版本类型：draft（草稿）/ published（已发布）
   */
  async getFormData(hotelId: string, version: VersionType = 'draft'): Promise<HotelFormData> {
    const fullInfo = await this.getFullInfo(hotelId, version);
    return transformToFormData(fullInfo);
  },

  /**
   * 保存表单数据（更新项目、详情、房间、政策）
   * @param hotelId 酒店业务ID
   * @param formData 表单数据
   */
  async saveFormData(hotelId: string, formData: HotelFormData): Promise<void> {
    const { project, detail, rooms, policies } = transformFromFormData(formData);

    await Promise.all([
      this.update(hotelId, project),
      this.updateDetail(hotelId, detail),
      this.updateRooms(hotelId, rooms),
      this.updatePolicies(hotelId, policies)
    ]);
  },

  // ===================== 房间相关 API =====================

  /**
   * 获取酒店房间列表
   * @param hotelId 酒店业务ID
   */
  getRooms(hotelId: string): Promise<RoomDetail[]> {
    return rpc.get<RoomDetail[]>('/hotel/rooms', { hotelId });
  },

  /**
   * 批量更新房间（会自动处理新增、更新、删除）
   * @param hotelId 酒店业务ID
   * @param rooms 房间列表
   */
  updateRooms(hotelId: string, rooms: UpsertRoomParams[]): Promise<RoomDetail[]> {
    return rpc.put<RoomDetail[]>('/hotel/rooms/batch', { hotelId, rooms });
  },

  /**
   * 添加单个房间
   * @param hotelId 酒店业务ID
   * @param room 房间数据
   */
  addRoom(hotelId: string, room: UpsertRoomParams): Promise<RoomDetail> {
    return rpc.post<RoomDetail>('/hotel/rooms', { ...room, hotelId });
  },

  /**
   * 删除单个房间
   * @param hotelId 酒店业务ID
   * @param roomId 房间业务ID
   */
  deleteRoom(_hotelId: string, roomId: string): Promise<null> {
    return rpc.delete<null>(`/hotel/rooms/${roomId}`);
  },

  // ===================== 设施相关 API =====================

  /**
   * 获取酒店设施列表
   * @param hotelId 酒店业务ID
   */
  getFacilities(hotelId: string): Promise<HotelFacility[]> {
    return rpc.get<HotelFacility[]>(`/hotel/details/${hotelId}/facilities`);
  },

  /**
   * 更新酒店设施
   * @param hotelId 酒店业务ID
   * @param facilityCodes 设施代码列表
   */
  updateFacilities(hotelId: string, facilityCodes: string[]): Promise<HotelFacility[]> {
    return rpc.post<HotelFacility[]>(`/hotel/details/${hotelId}/facilities`, { facilityCodes });
  },

  // ===================== 图片相关 API =====================

  /**
   * 获取酒店图片列表
   * @param hotelId 酒店业务ID
   */
  getImages(hotelId: string): Promise<HotelImage[]> {
    return rpc.get<HotelImage[]>(`/hotel/details/${hotelId}/images`);
  },

  /**
   * 更新酒店图片
   * @param hotelId 酒店业务ID
   * @param imageUrls 图片URL列表
   */
  updateImages(hotelId: string, imageUrls: string[]): Promise<HotelImage[]> {
    return rpc.post<HotelImage[]>(`/hotel/details/${hotelId}/images`, { imageUrls });
  },

  // ===================== 政策相关 API =====================

  /**
   * 获取酒店政策列表
   * @param hotelId 酒店业务ID
   */
  getPolicies(hotelId: string): Promise<PolicyDetail[]> {
    return rpc.get<PolicyDetail[]>('/hotel/policies', { hotelId });
  },

  /**
   * 批量更新政策（会自动处理新增、更新、删除）
   * @param hotelId 酒店业务ID
   * @param policies 政策列表
   */
  updatePolicies(hotelId: string, policies: UpsertPolicyParams[]): Promise<PolicyDetail[]> {
    return rpc.put<PolicyDetail[]>('/hotel/policies/batch', { hotelId, policies });
  },

  /**
   * 添加单个政策
   * @param hotelId 酒店业务ID
   * @param policy 政策数据
   */
  addPolicy(hotelId: string, policy: UpsertPolicyParams): Promise<PolicyDetail> {
    return rpc.post<PolicyDetail>('/hotel/policies', { ...policy, hotelId });
  },

  /**
   * 删除单个政策
   * @param policyId 政策业务ID
   */
  deletePolicy(policyId: string): Promise<null> {
    return rpc.delete<null>(`/hotel/policies/${policyId}`);
  },

  // ===================== 版本管理相关 API =====================

  /**
   * 发布草稿（将 draft 数据同步为 published）
   * 用于审核通过后发布
   * @param hotelId 酒店业务ID
   */
  publishDraft(hotelId: string): Promise<{ success: boolean }> {
    return rpc.post<{ success: boolean }>(`/hotel/projects/${hotelId}/publish`, {});
  },

  /**
   * 同步已发布数据到草稿（用于已发布酒店开始编辑）
   * @param hotelId 酒店业务ID
   */
  syncDraft(hotelId: string): Promise<{ success: boolean }> {
    return rpc.post<{ success: boolean }>(`/hotel/projects/${hotelId}/sync-draft`, {});
  },

  /**
   * 提交二次审核（将状态从 approved 改为 pending_update）
   * @param hotelId 酒店业务ID
   */
  submitSecondaryReview(hotelId: string): Promise<HotelProject> {
    return rpc.put<HotelProject>(`/hotel/projects/${hotelId}/status`, { status: 'pending_update' });
  },

  // ===================== 上下线管理相关 API =====================

  /**
   * 下线酒店（管理员操作）
   * @param hotelId 酒店业务ID
   * @param reason 下线原因（可选）
   */
  setOffline(hotelId: string, reason?: string): Promise<HotelProject> {
    return rpc.put<HotelProject>(`/hotel/projects/${hotelId}/offline`, { reason });
  },

  /**
   * 恢复上线（管理员操作）
   * @param hotelId 酒店业务ID
   */
  setOnline(hotelId: string): Promise<HotelProject> {
    return rpc.put<HotelProject>(`/hotel/projects/${hotelId}/online`, {});
  }
};

export default hotelApi;
