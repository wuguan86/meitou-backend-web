/**
 * 营销管理 API
 */
import { get, post, put, del } from './index';
import { MarketingAd, ManualConfig, PopupConfig } from '../types';
import { SiteId } from '../constants/sites';

// 获取广告列表
export const getAds = async (siteId: SiteId): Promise<MarketingAd[]> => {
  const params = new URLSearchParams();
  params.append('siteId', siteId.toString()); // siteId 是必传参数
  
  return get<MarketingAd[]>(`/admin/marketing/ads?${params.toString()}`);
};

// 创建广告
export const createAd = async (siteId: SiteId, ad: Partial<MarketingAd>): Promise<MarketingAd> => {
  return post<MarketingAd>(`/admin/marketing/ads?siteId=${siteId}`, ad);
};

// 更新广告
export const updateAd = async (id: string, siteId: SiteId, ad: Partial<MarketingAd>): Promise<MarketingAd> => {
  return put<MarketingAd>(`/admin/marketing/ads/${id}?siteId=${siteId}`, ad);
};

// 删除广告
export const deleteAd = async (id: string, siteId: SiteId): Promise<void> => {
  await del(`/admin/marketing/ads/${id}?siteId=${siteId}`);
};

// 获取手册配置
export const getManuals = async (): Promise<ManualConfig[]> => {
  return get<ManualConfig[]>('/admin/marketing/manuals');
};

// 更新手册配置
export const updateManual = async (manual: ManualConfig): Promise<ManualConfig> => {
  return put<ManualConfig>('/admin/marketing/manuals', manual);
};

export const getPopupConfig = async (siteId: SiteId): Promise<PopupConfig> => {
  return get<PopupConfig>(`/admin/marketing/popup?siteId=${siteId}`);
};

export const savePopupConfig = async (siteId: SiteId, config: Partial<PopupConfig>): Promise<PopupConfig> => {
  return post<PopupConfig>(`/admin/marketing/popup?siteId=${siteId}`, config);
};

// 获取弹窗列表
export const getPopupList = async (siteId: SiteId): Promise<PopupConfig[]> => {
  return get<PopupConfig[]>(`/admin/marketing/popup?siteId=${siteId}`);
};

// 创建弹窗
export const createPopup = async (siteId: SiteId, config: Partial<PopupConfig>): Promise<PopupConfig> => {
  return post<PopupConfig>(`/admin/marketing/popup?siteId=${siteId}`, config);
};

// 更新弹窗
export const updatePopup = async (id: string, siteId: SiteId, config: Partial<PopupConfig>): Promise<PopupConfig> => {
  return put<PopupConfig>(`/admin/marketing/popup/${id}?siteId=${siteId}`, config);
};

// 删除弹窗
export const deletePopup = async (id: string, siteId: SiteId): Promise<void> => {
  await del(`/admin/marketing/popup/${id}?siteId=${siteId}`);
};

