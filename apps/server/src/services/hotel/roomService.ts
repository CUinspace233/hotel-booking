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
  RoomImageItem
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
      name: params.name,
      roomType: params.roomType,
      bedType: params.bedType,
      bedCount: params.bedCount,
      bedSize: params.bedSize,
      area: params.area,
      floorRange: params.floorRange,
      windowType: params.windowType,
      maxGuests: params.maxGuests,
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

    const room = await hotelRoomRepository.update(roomId, params);
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
}

// 导出单例
export const hotelRoomService = new HotelRoomService();
