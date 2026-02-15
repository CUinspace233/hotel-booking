import prisma from '../../lib/prisma';
import type { HotelFacility, RoomFacility, HotelImage, RoomImage, Prisma } from '.prisma/client';

/**
 * 设施和图片数据访问层
 * 负责酒店设施、房型设施、酒店图片、房型图片的数据库操作
 */
class FacilityRepository {
  // ===================== 酒店设施 =====================

  /**
   * 添加酒店设施
   */
  async addHotelFacility(data: Prisma.HotelFacilityCreateInput): Promise<HotelFacility> {
    return prisma.hotelFacility.create({ data });
  }

  /**
   * 批量添加酒店设施
   */
  async addHotelFacilities(
    hotelId: string,
    facilities: Array<{
      facilityCode: string;
      facilityName: string;
      facilityCategory?: string;
      isFree?: boolean;
    }>
  ): Promise<number> {
    // 先删除已有设施
    await prisma.hotelFacility.deleteMany({ where: { hotelId } });

    // 批量创建
    const result = await prisma.hotelFacility.createMany({
      data: facilities.map((f) => ({
        hotelId,
        facilityCode: f.facilityCode,
        facilityName: f.facilityName,
        facilityCategory: f.facilityCategory || 'general',
        isFree: f.isFree ?? true
      }))
    });
    return result.count;
  }

  /**
   * 获取酒店设施列表
   */
  async getHotelFacilities(hotelId: string): Promise<HotelFacility[]> {
    return prisma.hotelFacility.findMany({ where: { hotelId } });
  }

  /**
   * 删除酒店设施
   */
  async deleteHotelFacility(hotelId: string, facilityCode: string): Promise<boolean> {
    try {
      await prisma.hotelFacility.delete({
        where: { hotelId_facilityCode: { hotelId, facilityCode } }
      });
      return true;
    } catch {
      return false;
    }
  }

  // ===================== 房型设施 =====================

  /**
   * 批量添加房型设施
   */
  async addRoomFacilities(
    roomId: string,
    facilities: Array<{
      facilityCode: string;
      facilityName: string;
    }>
  ): Promise<number> {
    // 先删除已有设施
    await prisma.roomFacility.deleteMany({ where: { roomId } });

    // 批量创建
    const result = await prisma.roomFacility.createMany({
      data: facilities.map((f) => ({
        roomId,
        facilityCode: f.facilityCode,
        facilityName: f.facilityName
      }))
    });
    return result.count;
  }

  /**
   * 获取房型设施列表
   */
  async getRoomFacilities(roomId: string): Promise<RoomFacility[]> {
    return prisma.roomFacility.findMany({ where: { roomId } });
  }

  /**
   * 删除房型设施
   */
  async deleteRoomFacility(roomId: string, facilityCode: string): Promise<boolean> {
    try {
      await prisma.roomFacility.delete({
        where: { roomId_facilityCode: { roomId, facilityCode } }
      });
      return true;
    } catch {
      return false;
    }
  }

  // ===================== 酒店图片 =====================

  /**
   * 添加酒店图片
   */
  async addHotelImage(data: Prisma.HotelImageCreateInput): Promise<HotelImage> {
    return prisma.hotelImage.create({ data });
  }

  /**
   * 批量添加酒店图片
   */
  async addHotelImages(
    hotelId: string,
    images: Array<{
      imageUrl: string;
      imageType?: string;
      sortOrder?: number;
    }>
  ): Promise<number> {
    const result = await prisma.hotelImage.createMany({
      data: images.map((img, index) => ({
        hotelId,
        imageUrl: img.imageUrl,
        imageType: img.imageType || 'hotel',
        sortOrder: img.sortOrder ?? index
      }))
    });
    return result.count;
  }

  /**
   * 获取酒店图片列表
   */
  async getHotelImages(hotelId: string): Promise<HotelImage[]> {
    return prisma.hotelImage.findMany({
      where: { hotelId },
      orderBy: { sortOrder: 'asc' }
    });
  }

  /**
   * 删除酒店图片
   */
  async deleteHotelImage(id: number): Promise<boolean> {
    try {
      await prisma.hotelImage.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 删除酒店所有图片
   */
  async deleteAllHotelImages(hotelId: string): Promise<number> {
    const result = await prisma.hotelImage.deleteMany({ where: { hotelId } });
    return result.count;
  }

  // ===================== 房型图片 =====================

  /**
   * 批量添加房型图片
   */
  async addRoomImages(
    roomId: string,
    images: Array<{
      imageUrl: string;
      sortOrder?: number;
    }>
  ): Promise<number> {
    const result = await prisma.roomImage.createMany({
      data: images.map((img, index) => ({
        roomId,
        imageUrl: img.imageUrl,
        sortOrder: img.sortOrder ?? index
      }))
    });
    return result.count;
  }

  /**
   * 获取房型图片列表
   */
  async getRoomImages(roomId: string): Promise<RoomImage[]> {
    return prisma.roomImage.findMany({
      where: { roomId },
      orderBy: { sortOrder: 'asc' }
    });
  }

  /**
   * 删除房型图片
   */
  async deleteRoomImage(id: number): Promise<boolean> {
    try {
      await prisma.roomImage.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 删除房型所有图片
   */
  async deleteAllRoomImages(roomId: string): Promise<number> {
    const result = await prisma.roomImage.deleteMany({ where: { roomId } });
    return result.count;
  }
}

// 导出单例
export const facilityRepository = new FacilityRepository();
