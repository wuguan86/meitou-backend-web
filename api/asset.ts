/**
 * 资产管理 API
 */
import { get, put, del, post } from './index';
import { UserAsset } from '../types';

// 获取资产列表
export const getAssets = async (
  category?: string,
  type?: string,
  search?: string
): Promise<UserAsset[]> => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (type) params.append('type', type);
  if (search) params.append('search', search);
  
  return get<UserAsset[]>(`/assets?${params.toString()}`);
};

// 获取资产详情
export const getAssetById = async (id: string): Promise<UserAsset> => {
  return get<UserAsset>(`/assets/${id}`);
};

// 更新资产
export const updateAsset = async (id: string, asset: Partial<UserAsset>): Promise<UserAsset> => {
  return put<UserAsset>(`/assets/${id}`, asset);
};

// 删除资产
export const deleteAsset = async (id: string): Promise<void> => {
  await del(`/assets/${id}`);
};

// 置顶/取消置顶
export const togglePin = async (id: string): Promise<UserAsset> => {
  return put<UserAsset>(`/assets/${id}/pin`);
};

// 更新状态（上架/下架）
export const updateAssetStatus = async (id: string, status: string): Promise<UserAsset> => {
  return put<UserAsset>(`/assets/${id}/status?status=${status}`);
};

// 更新点赞数
export const updateLikeCount = async (id: string, likeCount: number): Promise<UserAsset> => {
  return put<UserAsset>(`/assets/${id}/like-count?likeCount=${likeCount}`);
};

