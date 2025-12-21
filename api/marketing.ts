/**
 * 营销管理 API
 */
import { get, post, put, del } from './index';
import { MarketingAd, ManualConfig } from '../types';

// 获取广告列表
export const getAds = async (siteCategory?: string): Promise<MarketingAd[]> => {
  const params = new URLSearchParams();
  if (siteCategory) params.append('siteCategory', siteCategory);
  
  return get<MarketingAd[]>(`/admin/marketing/ads?${params.toString()}`);
};

// 创建广告
export const createAd = async (ad: Partial<MarketingAd>): Promise<MarketingAd> => {
  return post<MarketingAd>('/admin/marketing/ads', ad);
};

// 更新广告
export const updateAd = async (id: string, ad: Partial<MarketingAd>): Promise<MarketingAd> => {
  return put<MarketingAd>(`/admin/marketing/ads/${id}`, ad);
};

// 删除广告
export const deleteAd = async (id: string): Promise<void> => {
  await del(`/admin/marketing/ads/${id}`);
};

// 获取手册配置
export const getManuals = async (): Promise<ManualConfig[]> => {
  return get<ManualConfig[]>('/admin/marketing/manuals');
};

// 更新手册配置
export const updateManual = async (manual: ManualConfig): Promise<ManualConfig> => {
  return put<ManualConfig>('/admin/marketing/manuals', manual);
};

