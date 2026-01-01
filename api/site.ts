/**
 * 站点管理 API
 */
import { get, put } from './index';
import { Site } from '../types';

// 获取站点列表
export const getSites = async (): Promise<Site[]> => {
  return get<Site[]>('/admin/sites');
};

// 更新站点信息
export const updateSite = async (id: string, data: Partial<Site>): Promise<Site> => {
  return put<Site>(`/admin/sites/${id}`, data);
};

// 更新站点域名
export const updateSiteDomain = async (id: string, domain: string): Promise<Site> => {
  return put<Site>(`/admin/sites/${id}/domain?domain=${encodeURIComponent(domain)}`, {});
};

