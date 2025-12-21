/**
 * 生成记录 API
 */
import { get } from './index';
import { GenerationRecord } from '../types';

// 获取生成记录列表
export const getGenerationRecords = async (): Promise<GenerationRecord[]> => {
  return get<GenerationRecord[]>('/admin/generation-records');
};

// 获取生成记录详情
export const getGenerationRecordById = async (id: string): Promise<GenerationRecord> => {
  return get<GenerationRecord>(`/admin/generation-records/${id}`);
};

