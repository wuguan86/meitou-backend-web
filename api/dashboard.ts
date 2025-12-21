/**
 * 数据概览 API
 */
import { get } from './index';

// 获取统计数据
export const getStats = async (category?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  
  return get(`/admin/dashboard/stats?${params.toString()}`);
};

// 获取趋势数据
export const getTrend = async (category?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  
  return get(`/admin/dashboard/trend?${params.toString()}`);
};

// 获取排名数据
export const getRanking = async (category?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  
  return get(`/admin/dashboard/ranking?${params.toString()}`);
};

