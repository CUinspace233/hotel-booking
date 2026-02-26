import prisma from '../../lib/prisma';
import { hotelProjectRepository } from '../../repositories/hotel';
import { generateRoomId, generatePolicyId } from '../../utils/idGenerator';

export class ServiceError extends Error {
  code: number;

  constructor(message: string, code = 400) {
    super(message);
    this.code = code;
    this.name = 'ServiceError';
  }
}

/**
 * 酒店版本管理服务
 * 负责草稿发布、版本复制等操作
 */
class HotelVersionService {
  /**
   * 发布草稿（将 draft 数据复制为 published）
   * 用于首次审核通过或二次审核通过
   */
  async publishDraft(hotelId: string) {
    const project = await hotelProjectRepository.findByHotelId(hotelId);
    if (!project) {
      throw new ServiceError('酒店项目不存在', 404);
    }

    return prisma.$transaction(async (tx) => {
      // 1. 删除旧的 published 版本数据
      await tx.hotelPolicy.deleteMany({
        where: { hotelId, version: 'published' }
      });
      await tx.hotelFacility.deleteMany({
        where: { hotelId, version: 'published' }
      });
      await tx.hotelImage.deleteMany({
        where: { hotelId, version: 'published' }
      });
      // 先删除 HotelRoom 的子表（RoomFacility、RoomImage），否则会触发外键约束
      const publishedRoomIds = (
        await tx.hotelRoom.findMany({
          where: { hotelId, version: 'published' },
          select: { roomId: true }
        })
      ).map((r) => r.roomId);
      if (publishedRoomIds.length > 0) {
        await tx.roomFacility.deleteMany({
          where: { roomId: { in: publishedRoomIds } }
        });
        await tx.roomImage.deleteMany({
          where: { roomId: { in: publishedRoomIds } }
        });
      }
      await tx.hotelRoom.deleteMany({
        where: { hotelId, version: 'published' }
      });
      await tx.hotelDetail.deleteMany({
        where: { hotelId, version: 'published' }
      });

      // 2. 获取当前的 draft 数据
      const draftDetail = await tx.hotelDetail.findUnique({
        where: { hotelId_version: { hotelId, version: 'draft' } }
      });

      if (draftDetail) {
        // 3. 复制 detail 到 published
        await tx.hotelDetail.create({
          data: {
            hotelId,
            version: 'published',
            fullName: draftDetail.fullName,
            englishName: draftDetail.englishName,
            starRating: draftDetail.starRating,
            brand: draftDetail.brand,
            openingYear: draftDetail.openingYear,
            renovationYear: draftDetail.renovationYear,
            totalRooms: draftDetail.totalRooms,
            totalFloors: draftDetail.totalFloors,
            country: draftDetail.country,
            province: draftDetail.province,
            city: draftDetail.city,
            district: draftDetail.district,
            address: draftDetail.address,
            longitude: draftDetail.longitude,
            latitude: draftDetail.latitude,
            phone: draftDetail.phone,
            contactEmail: draftDetail.contactEmail,
            frontDeskPhone: draftDetail.frontDeskPhone,
            fax: draftDetail.fax,
            checkInTime: draftDetail.checkInTime,
            checkOutTime: draftDetail.checkOutTime,
            childrenPolicy: draftDetail.childrenPolicy,
            petPolicy: draftDetail.petPolicy,
            cancellationPolicy: draftDetail.cancellationPolicy,
            otherPolicies: draftDetail.otherPolicies,
            description: draftDetail.description,
            highlight: draftDetail.highlight,
            trafficInfo: draftDetail.trafficInfo,
            coverImage: draftDetail.coverImage
          }
        });

        // 4. 复制 facilities
        const draftFacilities = await tx.hotelFacility.findMany({
          where: { hotelId, version: 'draft' }
        });
        for (const f of draftFacilities) {
          await tx.hotelFacility.create({
            data: {
              hotelId,
              version: 'published',
              facilityCode: f.facilityCode,
              facilityName: f.facilityName,
              facilityCategory: f.facilityCategory,
              isFree: f.isFree
            }
          });
        }

        // 5. 复制 images
        const draftImages = await tx.hotelImage.findMany({
          where: { hotelId, version: 'draft' }
        });
        for (const img of draftImages) {
          await tx.hotelImage.create({
            data: {
              hotelId,
              version: 'published',
              imageUrl: img.imageUrl,
              imageType: img.imageType,
              sortOrder: img.sortOrder
            }
          });
        }

        // 6. 复制 policies
        const draftPolicies = await tx.hotelPolicy.findMany({
          where: { hotelId, version: 'draft', isDeleted: false }
        });
        for (const p of draftPolicies) {
          await tx.hotelPolicy.create({
            data: {
              policyId: generatePolicyId(),
              hotelId,
              version: 'published',
              policyType: p.policyType,
              policyName: p.policyName,
              policyContent: p.policyContent,
              sortOrder: p.sortOrder
            }
          });
        }
      }

      // 7. 复制 rooms
      const draftRooms = await tx.hotelRoom.findMany({
        where: { hotelId, version: 'draft', isDeleted: false },
        include: { facilities: true, images: true }
      });

      for (const room of draftRooms) {
        const newRoomId = generateRoomId();
        await tx.hotelRoom.create({
          data: {
            roomId: newRoomId,
            hotelId,
            version: 'published',
            roomName: room.roomName,
            roomType: room.roomType,
            bedType: room.bedType,
            bedCount: room.bedCount,
            bedSize: room.bedSize,
            roomSize: room.roomSize,
            floor: room.floor,
            windowType: room.windowType,
            maxOccupancy: room.maxOccupancy,
            basePrice: room.basePrice,
            breakfastType: room.breakfastType,
            breakfastCount: room.breakfastCount,
            totalCount: room.totalCount,
            availableCount: room.availableCount,
            description: room.description,
            coverImage: room.coverImage,
            sortOrder: room.sortOrder
          }
        });

        // 复制房型设施和图片
        for (const f of room.facilities) {
          await tx.roomFacility.create({
            data: {
              roomId: newRoomId,
              facilityCode: f.facilityCode,
              facilityName: f.facilityName
            }
          });
        }
        for (const img of room.images) {
          await tx.roomImage.create({
            data: {
              roomId: newRoomId,
              imageUrl: img.imageUrl,
              sortOrder: img.sortOrder
            }
          });
        }
      }

      // 8. 更新项目状态
      await tx.hotelProject.update({
        where: { hotelId },
        data: {
          status: 'approved',
          hasUnpublishedChanges: false
        }
      });

      return { success: true };
    });
  }

  /**
   * 创建草稿副本（从 published 复制到 draft）
   * 用于已发布酒店开始编辑时，需要先同步 published 数据到 draft
   */
  async createDraftFromPublished(hotelId: string) {
    const project = await hotelProjectRepository.findByHotelId(hotelId);
    if (!project) {
      throw new ServiceError('酒店项目不存在', 404);
    }

    return prisma.$transaction(async (tx) => {
      // 1. 清空现有 draft 数据
      await tx.hotelPolicy.deleteMany({
        where: { hotelId, version: 'draft' }
      });
      await tx.hotelFacility.deleteMany({
        where: { hotelId, version: 'draft' }
      });
      await tx.hotelImage.deleteMany({
        where: { hotelId, version: 'draft' }
      });
      // 先删除 HotelRoom 的子表（RoomFacility、RoomImage），否则会触发外键约束
      const draftRoomIds = (
        await tx.hotelRoom.findMany({
          where: { hotelId, version: 'draft' },
          select: { roomId: true }
        })
      ).map((r) => r.roomId);
      if (draftRoomIds.length > 0) {
        await tx.roomFacility.deleteMany({
          where: { roomId: { in: draftRoomIds } }
        });
        await tx.roomImage.deleteMany({
          where: { roomId: { in: draftRoomIds } }
        });
      }
      await tx.hotelRoom.deleteMany({
        where: { hotelId, version: 'draft' }
      });
      await tx.hotelDetail.deleteMany({
        where: { hotelId, version: 'draft' }
      });

      // 2. 从 published 复制数据到 draft
      const publishedDetail = await tx.hotelDetail.findUnique({
        where: { hotelId_version: { hotelId, version: 'published' } }
      });

      if (publishedDetail) {
        await tx.hotelDetail.create({
          data: {
            hotelId,
            version: 'draft',
            fullName: publishedDetail.fullName,
            englishName: publishedDetail.englishName,
            starRating: publishedDetail.starRating,
            brand: publishedDetail.brand,
            openingYear: publishedDetail.openingYear,
            renovationYear: publishedDetail.renovationYear,
            totalRooms: publishedDetail.totalRooms,
            totalFloors: publishedDetail.totalFloors,
            country: publishedDetail.country,
            province: publishedDetail.province,
            city: publishedDetail.city,
            district: publishedDetail.district,
            address: publishedDetail.address,
            longitude: publishedDetail.longitude,
            latitude: publishedDetail.latitude,
            phone: publishedDetail.phone,
            contactEmail: publishedDetail.contactEmail,
            frontDeskPhone: publishedDetail.frontDeskPhone,
            fax: publishedDetail.fax,
            checkInTime: publishedDetail.checkInTime,
            checkOutTime: publishedDetail.checkOutTime,
            childrenPolicy: publishedDetail.childrenPolicy,
            petPolicy: publishedDetail.petPolicy,
            cancellationPolicy: publishedDetail.cancellationPolicy,
            otherPolicies: publishedDetail.otherPolicies,
            description: publishedDetail.description,
            highlight: publishedDetail.highlight,
            trafficInfo: publishedDetail.trafficInfo,
            coverImage: publishedDetail.coverImage
          }
        });

        // 复制 facilities
        const publishedFacilities = await tx.hotelFacility.findMany({
          where: { hotelId, version: 'published' }
        });
        for (const f of publishedFacilities) {
          await tx.hotelFacility.create({
            data: {
              hotelId,
              version: 'draft',
              facilityCode: f.facilityCode,
              facilityName: f.facilityName,
              facilityCategory: f.facilityCategory,
              isFree: f.isFree
            }
          });
        }

        // 复制 images
        const publishedImages = await tx.hotelImage.findMany({
          where: { hotelId, version: 'published' }
        });
        for (const img of publishedImages) {
          await tx.hotelImage.create({
            data: {
              hotelId,
              version: 'draft',
              imageUrl: img.imageUrl,
              imageType: img.imageType,
              sortOrder: img.sortOrder
            }
          });
        }

        // 复制 policies
        const publishedPolicies = await tx.hotelPolicy.findMany({
          where: { hotelId, version: 'published', isDeleted: false }
        });
        for (const p of publishedPolicies) {
          await tx.hotelPolicy.create({
            data: {
              policyId: generatePolicyId(),
              hotelId,
              version: 'draft',
              policyType: p.policyType,
              policyName: p.policyName,
              policyContent: p.policyContent,
              sortOrder: p.sortOrder
            }
          });
        }
      }

      // 复制 rooms
      const publishedRooms = await tx.hotelRoom.findMany({
        where: { hotelId, version: 'published', isDeleted: false },
        include: { facilities: true, images: true }
      });

      for (const room of publishedRooms) {
        const newRoomId = generateRoomId();
        await tx.hotelRoom.create({
          data: {
            roomId: newRoomId,
            hotelId,
            version: 'draft',
            roomName: room.roomName,
            roomType: room.roomType,
            bedType: room.bedType,
            bedCount: room.bedCount,
            bedSize: room.bedSize,
            roomSize: room.roomSize,
            floor: room.floor,
            windowType: room.windowType,
            maxOccupancy: room.maxOccupancy,
            basePrice: room.basePrice,
            breakfastType: room.breakfastType,
            breakfastCount: room.breakfastCount,
            totalCount: room.totalCount,
            availableCount: room.availableCount,
            description: room.description,
            coverImage: room.coverImage,
            sortOrder: room.sortOrder
          }
        });

        for (const f of room.facilities) {
          await tx.roomFacility.create({
            data: {
              roomId: newRoomId,
              facilityCode: f.facilityCode,
              facilityName: f.facilityName
            }
          });
        }
        for (const img of room.images) {
          await tx.roomImage.create({
            data: {
              roomId: newRoomId,
              imageUrl: img.imageUrl,
              sortOrder: img.sortOrder
            }
          });
        }
      }

      return { success: true };
    });
  }

  /**
   * 标记有未发布的修改
   */
  async markHasUnpublishedChanges(hotelId: string) {
    await hotelProjectRepository.update(hotelId, {
      hasUnpublishedChanges: true
    });
  }

  /**
   * 拒绝二次提审（不发布草稿，只更新状态回 approved）
   */
  async rejectSecondaryReview(hotelId: string) {
    const project = await hotelProjectRepository.findByHotelId(hotelId);
    if (!project) {
      throw new ServiceError('酒店项目不存在', 404);
    }

    if (project.status !== 'pending_update') {
      throw new ServiceError('只能拒绝处于二次提审状态的项目', 400);
    }

    await hotelProjectRepository.update(hotelId, {
      status: 'approved',
      hasUnpublishedChanges: true
    });

    return { success: true };
  }
}

export const hotelVersionService = new HotelVersionService();
