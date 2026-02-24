/**
 * 通用类型定义
 */

/** 分页信息 */
export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  list: T[];
  pagination: PaginationInfo;
}
