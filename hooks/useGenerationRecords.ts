import { useState, useEffect } from 'react';
import { GenerationRecord } from '../types';
import * as generationAPI from '../api/generation';
import { SiteId, SITES } from '../constants/sites';

// useGenerationRecords Hook - 管理生成记录数据
export const useGenerationRecords = (siteId: SiteId = SITES.MEDICAL) => {
  const [records, setRecords] = useState<GenerationRecord[]>([]); // 生成记录列表
  const [loading, setLoading] = useState(false); // 加载状态
  
  // 加载生成记录
  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await generationAPI.getGenerationRecords(siteId);
      setRecords(data);
    } catch (err: any) {
      console.error('加载记录失败:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 组件挂载时加载记录
  useEffect(() => {
    loadRecords();
  }, [siteId]);
  
  return {
    records, // 生成记录列表
    loading, // 加载状态
    loadRecords // 重新加载函数
  };
};

