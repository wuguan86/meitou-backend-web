/**
 * 数据概览 API
 */
import { get } from './index';

export interface DashboardParams {
  siteId?: number;
  timeRange?: string;
  startDate?: string;
  endDate?: string;
}

// 获取统计数据
export const getStats = async (params: DashboardParams): Promise<any> => {
  const query = new URLSearchParams();
  if (params.siteId) query.append('siteId', params.siteId.toString());
  if (params.timeRange) query.append('timeRange', params.timeRange);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  
  return get(`/admin/dashboard/stats?${query.toString()}`);
};

// 获取趋势数据
export const getTrend = async (params: DashboardParams): Promise<any> => {
  const query = new URLSearchParams();
  if (params.siteId) query.append('siteId', params.siteId.toString());
  if (params.timeRange) query.append('timeRange', params.timeRange);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  
  return get(`/admin/dashboard/trend?${query.toString()}`);
};

// 获取排名数据
export const getRanking = async (params: DashboardParams): Promise<any> => {
  const query = new URLSearchParams();
  if (params.siteId) query.append('siteId', params.siteId.toString());
  if (params.timeRange) query.append('timeRange', params.timeRange);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  
  return get(`/admin/dashboard/ranking?${query.toString()}`);
};
