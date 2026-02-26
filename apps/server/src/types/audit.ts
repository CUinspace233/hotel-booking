/**
 * 审核模块类型定义
 */
export type AuditProjectStatus = 'all' | 'pending' | 'approved' | 'offline' | 'rejected';

export interface AuditProjectListParams {
  page?: number;
  pageSize?: number;
  status?: AuditProjectStatus;
  keyword?: string;
}
