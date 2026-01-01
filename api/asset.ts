/**
 * 资产管理 API
 */
import { get, put, del, post } from './index';
import { UserAsset } from '../types';
import { SiteId } from '../constants/sites';

// 获取资产列表
export const getAssets = async (
  siteId?: SiteId,
  type?: string,
  search?: string,
  page: number = 1,
  size: number = 10
): Promise<any> => {
  const params = new URLSearchParams();
  if (siteId) params.append('siteId', siteId.toString());
  if (type) params.append('type', type);
  if (search) params.append('search', search);
  params.append('page', page.toString());
  params.append('size', size.toString());
  
  return get<any>(`/admin/assets?${params.toString()}`);
};

// 获取资产详情
export const getAssetById = async (id: string): Promise<UserAsset> => {
  return get<UserAsset>(`/admin/assets/${id}`);
};

// 更新资产
export const updateAsset = async (id: string, asset: Partial<UserAsset>): Promise<UserAsset> => {
  return put<UserAsset>(`/admin/assets/${id}`, asset);
};

// 删除资产
export const deleteAsset = async (id: string, siteId: SiteId): Promise<void> => {
  await del(`/admin/assets/${id}?siteId=${siteId}`);
};

// 更新点赞数
export const updateLikeCount = async (id: string, likeCount: number): Promise<UserAsset> => {
  return put<UserAsset>(`/admin/assets/${id}/like-count?likeCount=${likeCount}`);
};

