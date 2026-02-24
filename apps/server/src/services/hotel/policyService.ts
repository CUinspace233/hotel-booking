import { hotelPolicyRepository, hotelProjectRepository } from '../../repositories/hotel';
import { generatePolicyId } from '../../utils/idGenerator';
import type {
  CreatePolicyParams,
  UpdatePolicyParams,
  BatchUpdatePolicyItem
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
 * 酒店政策业务逻辑层
 */
class HotelPolicyService {
  /**
   * 获取酒店下所有政策
   * @param version 版本类型：draft / published
   */
  async getListByHotelId(hotelId: string, version: string = 'draft') {
    // 检查酒店是否存在
    const project = await hotelProjectRepository.findByHotelId(hotelId);
    if (!project) {
      throw new ServiceError('酒店不存在', 404);
    }

    return hotelPolicyRepository.findByHotelId(hotelId, version);
  }

  /**
   * 获取单个政策详情
   */
  async getByPolicyId(policyId: string) {
    const policy = await hotelPolicyRepository.findByPolicyId(policyId);
    if (!policy) {
      throw new ServiceError('政策不存在', 404);
    }
    return policy;
  }

  /**
   * 创建政策
   * @param version 版本类型：draft / published
   */
  async create(params: CreatePolicyParams, version: string = 'draft') {
    // 检查酒店是否存在
    const project = await hotelProjectRepository.findByHotelId(params.hotelId);
    if (!project) {
      throw new ServiceError('酒店不存在', 404);
    }

    const policyId = generatePolicyId();

    const policy = await hotelPolicyRepository.create({
      policyId,
      hotelId: params.hotelId,
      version,
      policyType: params.policyType,
      policyName: params.policyName,
      policyContent: params.policyContent || null,
      sortOrder: params.sortOrder || 0
    });

    return policy;
  }

  /**
   * 更新政策
   */
  async update(policyId: string, params: UpdatePolicyParams) {
    // 检查政策是否存在
    const existing = await hotelPolicyRepository.findByPolicyId(policyId);
    if (!existing) {
      throw new ServiceError('政策不存在', 404);
    }

    const policy = await hotelPolicyRepository.update(policyId, {
      policyType: params.policyType,
      policyName: params.policyName,
      policyContent: params.policyContent,
      sortOrder: params.sortOrder
    });

    return policy;
  }

  /**
   * 删除政策（软删除）
   */
  async delete(policyId: string) {
    // 检查政策是否存在
    const existing = await hotelPolicyRepository.findByPolicyId(policyId);
    if (!existing) {
      throw new ServiceError('政策不存在', 404);
    }

    return hotelPolicyRepository.softDelete(policyId);
  }

  /**
   * 批量更新政策（智能处理新增、更新、删除）
   * @param version 版本类型：draft / published
   */
  async batchUpdate(hotelId: string, policies: BatchUpdatePolicyItem[], version: string = 'draft') {
    // 检查酒店是否存在
    const project = await hotelProjectRepository.findByHotelId(hotelId);
    if (!project) {
      throw new ServiceError('酒店不存在', 404);
    }

    // 获取当前数据库中的政策（指定版本）
    const existingPolicies = await hotelPolicyRepository.findByHotelId(hotelId, version);
    const existingPolicyIds = new Set(existingPolicies.map((p) => p.policyId));

    // 分类处理
    const toCreate: BatchUpdatePolicyItem[] = [];
    const toUpdate: { policyId: string; data: BatchUpdatePolicyItem }[] = [];
    const submittedPolicyIds = new Set<string>();

    for (const policy of policies) {
      if (!policy.policyId || policy.policyId.startsWith('new_')) {
        // 新增
        toCreate.push(policy);
      } else if (existingPolicyIds.has(policy.policyId)) {
        // 更新
        toUpdate.push({ policyId: policy.policyId, data: policy });
        submittedPolicyIds.add(policy.policyId);
      } else {
        // policyId 不存在于数据库，当作新增处理
        toCreate.push(policy);
      }
    }

    // 找出需要删除的政策
    const toDelete = existingPolicies
      .filter((p) => !submittedPolicyIds.has(p.policyId))
      .map((p) => p.policyId);

    // 执行新增
    for (let i = 0; i < toCreate.length; i++) {
      const policy = toCreate[i];
      const policyId = generatePolicyId();
      await hotelPolicyRepository.create({
        policyId,
        hotelId,
        version,
        policyType: policy.policyType,
        policyName: policy.policyName,
        policyContent: policy.policyContent || null,
        sortOrder: i
      });
    }

    // 执行更新
    for (let i = 0; i < toUpdate.length; i++) {
      const { policyId, data } = toUpdate[i];
      await hotelPolicyRepository.update(policyId, {
        policyType: data.policyType,
        policyName: data.policyName,
        policyContent: data.policyContent || null,
        sortOrder: i + toCreate.length
      });
    }

    // 执行软删除
    for (const policyId of toDelete) {
      await hotelPolicyRepository.softDelete(policyId);
    }

    // 返回更新后的政策列表
    return hotelPolicyRepository.findByHotelId(hotelId, version);
  }
}

// 导出单例
export const hotelPolicyService = new HotelPolicyService();
