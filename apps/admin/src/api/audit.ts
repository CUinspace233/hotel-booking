import { rpc } from '@/utils/rpc';
import { transformToFormData } from './hotel';
import type { HotelProject, HotelFormData, PaginatedResponse } from '@/types';

/** 审核列表查询参数 */
export interface AuditProjectListParams {
  page?: number;
  pageSize?: number;
  status?: 'all' | 'pending' | 'approved' | 'offline' | 'rejected';
  keyword?: string;
}

/**
 * 审核模块 API
 * 仅管理员使用，对应 /api/audit/* 接口
 */
export const auditApi = {
  /**
   * 获取审核项目列表
   */
  getList(params?: AuditProjectListParams): Promise<PaginatedResponse<HotelProject>> {
    return rpc.get<PaginatedResponse<HotelProject>>(
      '/audit/projects',
      params as Record<string, unknown>
    );
  },

  /**
   * 获取审核用详情（转换为表单数据格式）
   */
  async getFormData(hotelId: string): Promise<HotelFormData> {
    const fullInfo = await rpc.get<unknown>(`/audit/projects/${hotelId}/detail`);
    return transformToFormData(fullInfo);
  },

  /**
   * 审核通过
   */
  approve(hotelId: string): Promise<{ success: boolean }> {
    return rpc.post<{ success: boolean }>(`/audit/projects/${hotelId}/approve`, {});
  },

  /**
   * 审核驳回
   */
  reject(hotelId: string, remark?: string): Promise<HotelProject> {
    return rpc.put<HotelProject>(`/audit/projects/${hotelId}/reject`, { remark });
  },

  /**
   * 下线酒店
   */
  setOffline(hotelId: string, reason?: string): Promise<HotelProject> {
    return rpc.put<HotelProject>(`/audit/projects/${hotelId}/offline`, { reason });
  },

  /**
   * 恢复上线
   */
  setOnline(hotelId: string): Promise<HotelProject> {
    return rpc.put<HotelProject>(`/audit/projects/${hotelId}/online`, {});
  }
};
