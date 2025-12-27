/**
 * 生成记录 API
 */
import { get, post, put, del } from './index';
import { GenerationRecord } from '../types';
import { SiteId } from '../constants/sites';

// 获取生成记录列表（按站点ID）
export const getGenerationRecords = async (siteId: SiteId): Promise<GenerationRecord[]> => {
  return get<GenerationRecord[]>(`/admin/generation-records?siteId=${siteId}`);
};

// 获取生成记录详情
export const getGenerationRecordById = async (id: string): Promise<GenerationRecord> => {
  return get<GenerationRecord>(`/admin/generation-records/${id}`);
};

// 创建生成记录
export const createGenerationRecord = async (siteId: SiteId, record: Partial<GenerationRecord>): Promise<GenerationRecord> => {
  return post<GenerationRecord>(`/admin/generation-records?siteId=${siteId}`, record);
};

// 更新生成记录
export const updateGenerationRecord = async (id: string, siteId: SiteId, record: Partial<GenerationRecord>): Promise<GenerationRecord> => {
  return put<GenerationRecord>(`/admin/generation-records/${id}?siteId=${siteId}`, record);
};

// 删除生成记录
export const deleteGenerationRecord = async (id: string, siteId: SiteId): Promise<void> => {
  return del<void>(`/admin/generation-records/${id}?siteId=${siteId}`);
};

