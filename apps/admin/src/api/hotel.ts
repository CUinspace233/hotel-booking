import { rpc } from '@/utils/rpc';
import type {
  HotelStatus,
  VersionType,
  HotelProject,
  HotelDetail,
  RoomDetail,
  HotelFacility,
  HotelImage,
  RoomImage,
  PolicyDetail,
  HotelFormData,
  CreateHotelProjectParams,
  UpdateHotelProjectParams,
  HotelProjectListParams,
  HotelFullInfo,
  UpdateHotelDetailParams,
  UpsertRoomParams,
  UpsertPolicyParams,
  PaginatedResponse
} from '@/types';

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
  const project = fullInfo || {};
  const details = fullInfo?.details || [];
  const detail = details[0] || null;
  const rooms = fullInfo?.rooms || [];
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
    facilities: facilities.map((f: HotelFacility) => ({
      id: `${f.hotelId}_${f.facilityCode}_${Date.now()}_${Math.random()}`,
      category: f.facilityCategory || 'public',
      facilityCode: f.facilityCode || '',
      facilityName: f.facilityName || '',
      description: f.description || ''
    })),
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

  // ===================== 房型图片相关 API =====================

  /**
   * 获取房型图片列表
   * @param roomId 房型业务ID
   */
  getRoomImages(roomId: string): Promise<RoomImage[]> {
    return rpc.get<RoomImage[]>(`/hotel/rooms/${roomId}/images`);
  },

  /**
   * 添加房型图片
   * @param roomId 房型业务ID
   * @param images 图片列表
   */
  addRoomImages(
    roomId: string,
    images: Array<{ imageUrl: string; sortOrder?: number }>
  ): Promise<{ count: number }> {
    return rpc.post<{ count: number }>(`/hotel/rooms/${roomId}/images`, { images });
  },

  /**
   * 删除房型图片
   * @param roomId 房型业务ID
   * @param imageId 图片ID
   */
  deleteRoomImage(roomId: string, imageId: number): Promise<null> {
    return rpc.delete<null>(`/hotel/rooms/${roomId}/images/${imageId}`);
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
   * @param facilities 设施列表
   */
  updateFacilities(
    hotelId: string,
    facilities: Array<{
      facilityCode: string;
      facilityName: string;
      facilityCategory?: string;
      description?: string;
      isFree?: boolean;
    }>
  ): Promise<HotelFacility[]> {
    return rpc.post<HotelFacility[]>(`/hotel/details/${hotelId}/facilities`, { facilities });
  },

  // ===================== 酒店图片相关 API =====================

  /**
   * 获取酒店图片列表
   * @param hotelId 酒店业务ID
   */
  getHotelImages(hotelId: string): Promise<HotelImage[]> {
    return rpc.get<HotelImage[]>(`/hotel/details/${hotelId}/images`);
  },

  /**
   * 添加酒店图片
   * @param hotelId 酒店业务ID
   * @param images 图片列表
   */
  addHotelImages(
    hotelId: string,
    images: Array<{ imageUrl: string; imageType?: string; sortOrder?: number }>
  ): Promise<{ count: number }> {
    return rpc.post<{ count: number }>(`/hotel/details/${hotelId}/images`, { images });
  },

  /**
   * 删除酒店图片
   * @param hotelId 酒店业务ID
   * @param imageId 图片ID
   */
  deleteHotelImage(hotelId: string, imageId: number): Promise<null> {
    return rpc.delete<null>(`/hotel/details/${hotelId}/images/${imageId}`);
  },

  /**
   * 更新酒店主图（封面图）
   * @param hotelId 酒店业务ID
   * @param coverImage 主图URL
   */
  updateCoverImage(hotelId: string, coverImage: string): Promise<HotelDetail> {
    return rpc.put<HotelDetail>(`/hotel/details/${hotelId}`, { coverImage });
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
