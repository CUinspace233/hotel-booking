import { hotelDetailRepository, facilityRepository } from '../../repositories/hotel';
import type { UpdateHotelDetailParams, HotelFacilityItem, HotelImageItem } from '../../types/hotel';

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
 * 酒店详情业务逻辑层
 * 负责第二层（详情）的业务处理
 */
class HotelDetailService {
  /**
   * 获取酒店详情（含设施和图片）
   * @param version 版本类型：draft / published
   */
  async getByHotelId(hotelId: string, version: string = 'draft') {
    const detail = await hotelDetailRepository.findByHotelIdWithRelations(hotelId, version);
    if (!detail) {
      throw new ServiceError('酒店详情不存在', 404);
    }
    return detail;
  }

  /**
   * 更新酒店详情
   * @param version 版本类型：draft / published
   */
  async update(hotelId: string, params: UpdateHotelDetailParams, version: string = 'draft') {
    // 使用 upsert，如果不存在则创建
    const detail = await hotelDetailRepository.upsert(
      hotelId,
      params as Record<string, unknown>,
      version
    );
    return detail;
  }

  /**
   * 添加酒店设施（批量覆盖）
   * 若草稿详情不存在则先创建，再写入设施
   */
  async setFacilities(hotelId: string, facilities: HotelFacilityItem[]) {
    const version = 'draft';
    let detail = await hotelDetailRepository.findByHotelId(hotelId, version);
    if (!detail) {
      // 详情不存在时先 upsert 空详情，避免因历史数据或新建流程未创建 detail 导致保存失败
      await hotelDetailRepository.upsert(hotelId, {}, version);
    }

    const count = await facilityRepository.addHotelFacilities(hotelId, facilities, version);
    return { count };
  }

  /**
   * 获取酒店设施列表
   */
  async getFacilities(hotelId: string) {
    return facilityRepository.getHotelFacilities(hotelId);
  }

  /**
   * 删除酒店设施
   */
  async deleteFacility(hotelId: string, facilityCode: string) {
    const result = await facilityRepository.deleteHotelFacility(hotelId, facilityCode);
    if (!result) {
      throw new ServiceError('设施不存在', 404);
    }
    return result;
  }

  /**
   * 添加酒店图片（追加）
   */
  async addImages(hotelId: string, images: HotelImageItem[]) {
    // 检查详情是否存在
    const detail = await hotelDetailRepository.findByHotelId(hotelId);
    if (!detail) {
      throw new ServiceError('酒店详情不存在，请先创建酒店', 404);
    }

    const count = await facilityRepository.addHotelImages(hotelId, images);
    return { count };
  }

  /**
   * 获取酒店图片列表
   */
  async getImages(hotelId: string) {
    return facilityRepository.getHotelImages(hotelId);
  }

  /**
   * 删除酒店图片
   */
  async deleteImage(imageId: number) {
    const result = await facilityRepository.deleteHotelImage(imageId);
    if (!result) {
      throw new ServiceError('图片不存在', 404);
    }
    return result;
  }

  /**
   * 删除酒店所有图片
   */
  async deleteAllImages(hotelId: string) {
    const count = await facilityRepository.deleteAllHotelImages(hotelId);
    return { count };
  }
}

// 导出单例
export const hotelDetailService = new HotelDetailService();
