import {
  hotelRoomRepository,
  facilityRepository,
  hotelProjectRepository
} from '../../repositories/hotel';
import { generateRoomId } from '../../utils/idGenerator';
import type {
  CreateHotelRoomParams,
  UpdateHotelRoomParams,
  RoomFacilityItem,
  RoomImageItem,
  BatchUpdateRoomItem
} from '../../types/hotel';

// 服务层错误类
export class ServiceError extends Error {
  code: number;

  constructor(message: string, code = 400) {
    super(message);
    this.code = code;
    this.name = 'ServiceError';
  }
}

/**
 * 酒店房型业务逻辑层
 * 负责第三层（房型）的业务处理
 */
class HotelRoomService {
  /**
   * 获取酒店下所有房型
   */
  async getListByHotelId(hotelId: string, status?: string) {
    // 检查酒店是否存在
    const project = await hotelProjectRepository.findByHotelId(hotelId);
    if (!project) {
      throw new ServiceError('酒店不存在', 404);
    }

    const rooms = await hotelRoomRepository.findByHotelId(hotelId, status);
    return rooms;
  }

  /**
   * 获取单个房型详情
   */
  async getByRoomId(roomId: string) {
    const room = await hotelRoomRepository.findByRoomIdWithRelations(roomId);
    if (!room) {
      throw new ServiceError('房型不存在', 404);
    }
    return room;
  }

  /**
   * 创建房型
   */
  async create(params: CreateHotelRoomParams) {
    // 检查酒店是否存在
    const project = await hotelProjectRepository.findByHotelId(params.hotelId);
    if (!project) {
      throw new ServiceError('酒店不存在', 404);
    }

    const roomId = generateRoomId();

    const room = await hotelRoomRepository.create({
      roomId,
      roomName: params.roomName,
      roomType: params.roomType || 'standard',
      bedType: params.bedType,
      bedCount: params.bedCount,
      bedSize: params.bedSize,
      roomSize: params.roomSize,
      floor: params.floor,
      windowType: params.windowType,
      maxOccupancy: params.maxOccupancy,
      basePrice: params.basePrice,
      breakfastType: params.breakfastType,
      breakfastCount: params.breakfastCount,
      totalCount: params.totalCount,
      availableCount: params.availableCount,
      description: params.description,
      coverImage: params.coverImage,
      sortOrder: params.sortOrder,
      project: {
        connect: { hotelId: params.hotelId }
      }
    });

    return room;
  }

  /**
   * 更新房型
   */
  async update(roomId: string, params: UpdateHotelRoomParams) {
    // 检查房型是否存在
    const existing = await hotelRoomRepository.findByRoomId(roomId);
    if (!existing) {
      throw new ServiceError('房型不存在', 404);
    }

    const room = await hotelRoomRepository.update(roomId, {
      roomName: params.roomName,
      roomType: params.roomType,
      bedType: params.bedType,
      bedCount: params.bedCount,
      bedSize: params.bedSize,
      roomSize: params.roomSize,
      floor: params.floor,
      windowType: params.windowType,
      maxOccupancy: params.maxOccupancy,
      basePrice: params.basePrice,
      breakfastType: params.breakfastType,
      breakfastCount: params.breakfastCount,
      totalCount: params.totalCount,
      availableCount: params.availableCount,
      description: params.description,
      coverImage: params.coverImage,
      sortOrder: params.sortOrder,
      status: params.status
    });
    return room;
  }

  /**
   * 删除房型（软删除）
   */
  async delete(roomId: string) {
    // 检查房型是否存在
    const existing = await hotelRoomRepository.findByRoomId(roomId);
    if (!existing) {
      throw new ServiceError('房型不存在', 404);
    }

    const result = await hotelRoomRepository.softDelete(roomId);
    return result;
  }

  /**
   * 设置房型设施（批量覆盖）
   */
  async setFacilities(roomId: string, facilities: RoomFacilityItem[]) {
    // 检查房型是否存在
    const room = await hotelRoomRepository.findByRoomId(roomId);
    if (!room) {
      throw new ServiceError('房型不存在', 404);
    }

    const count = await facilityRepository.addRoomFacilities(roomId, facilities);
    return { count };
  }

  /**
   * 获取房型设施列表
   */
  async getFacilities(roomId: string) {
    return facilityRepository.getRoomFacilities(roomId);
  }

  /**
   * 删除房型设施
   */
  async deleteFacility(roomId: string, facilityCode: string) {
    const result = await facilityRepository.deleteRoomFacility(roomId, facilityCode);
    if (!result) {
      throw new ServiceError('设施不存在', 404);
    }
    return result;
  }

  /**
   * 添加房型图片
   */
  async addImages(roomId: string, images: RoomImageItem[]) {
    // 检查房型是否存在
    const room = await hotelRoomRepository.findByRoomId(roomId);
    if (!room) {
      throw new ServiceError('房型不存在', 404);
    }

    const count = await facilityRepository.addRoomImages(roomId, images);
    return { count };
  }

  /**
   * 获取房型图片列表
   */
  async getImages(roomId: string) {
    return facilityRepository.getRoomImages(roomId);
  }

  /**
   * 删除房型图片
   */
  async deleteImage(imageId: number) {
    const result = await facilityRepository.deleteRoomImage(imageId);
    if (!result) {
      throw new ServiceError('图片不存在', 404);
    }
    return result;
  }

  /**
   * 统计酒店房型数量
   */
  async countByHotelId(hotelId: string) {
    return hotelRoomRepository.countByHotelId(hotelId);
  }

  /**
   * 批量更新房间（智能处理新增、更新、删除）
   * - 有 roomId 且在数据库中存在：更新
   * - 无 roomId 或以 'new_' 开头：新增
   * - 数据库中存在但不在提交列表中：删除（软删除）
   * @param version 版本类型：draft / published，默认 draft
   */
  async batchUpdate(hotelId: string, rooms: BatchUpdateRoomItem[], version: string = 'draft') {
    // 检查酒店是否存在
    const project = await hotelProjectRepository.findByHotelId(hotelId);
    if (!project) {
      throw new ServiceError('酒店不存在', 404);
    }

    // 获取当前数据库中的房间（指定版本）
    const existingRooms = await hotelRoomRepository.findByHotelId(hotelId, undefined, version);
    const existingRoomIds = new Set(existingRooms.map((r) => r.roomId));

    // 分类处理
    const toCreate: BatchUpdateRoomItem[] = [];
    const toUpdate: { roomId: string; data: BatchUpdateRoomItem }[] = [];
    const submittedRoomIds = new Set<string>();

    for (const room of rooms) {
      // 新增：无 roomId 或以 'new_' 开头
      if (!room.roomId || room.roomId.startsWith('new_')) {
        toCreate.push(room);
      } else if (existingRoomIds.has(room.roomId)) {
        // 更新：有 roomId 且存在于数据库
        toUpdate.push({ roomId: room.roomId, data: room });
        submittedRoomIds.add(room.roomId);
      } else {
        // roomId 不存在于数据库，当作新增处理
        toCreate.push(room);
      }
    }

    // 找出需要删除的房间（数据库中有，但提交列表中没有）
    const toDelete = existingRooms
      .filter((r) => !submittedRoomIds.has(r.roomId))
      .map((r) => r.roomId);

    // 执行新增
    for (const room of toCreate) {
      const roomId = generateRoomId();
      await hotelRoomRepository.create({
        roomId,
        roomName: room.roomName,
        roomType: 'standard',
        version,
        bedCount: room.bedCount || null,
        roomSize: room.roomSize || null,
        maxOccupancy: room.maxOccupancy || null,
        floor: room.floor || null,
        basePrice: room.basePrice ?? null,
        project: {
          connect: { hotelId }
        }
      });
    }

    // 执行更新
    for (const { roomId, data } of toUpdate) {
      await hotelRoomRepository.update(roomId, {
        roomName: data.roomName,
        bedCount: data.bedCount || null,
        roomSize: data.roomSize || null,
        maxOccupancy: data.maxOccupancy || null,
        floor: data.floor || null,
        basePrice: data.basePrice ?? null
      });
    }

    // 执行软删除
    for (const roomId of toDelete) {
      await hotelRoomRepository.softDelete(roomId);
    }

    // 返回更新后的房间列表
    return hotelRoomRepository.findByHotelId(hotelId, undefined, version);
  }
}

// 导出单例
export const hotelRoomService = new HotelRoomService();
