import { useState, useEffect } from 'react';
import { GenerationRecord } from '../types';
import * as generationAPI from '../api/generation';
import { SiteId, SITES } from '../constants/sites';

// useGenerationRecords Hook - 管理生成记录数据
export const useGenerationRecords = (siteId: SiteId = SITES.MEDICAL) => {
  const [records, setRecords] = useState<GenerationRecord[]>([]); // 生成记录列表
  const [loading, setLoading] = useState(false); // 加载状态
  const [total, setTotal] = useState(0); // 总记录数
  const [page, setPage] = useState(1); // 当前页码
  const [size, setSize] = useState(10); // 每页数量
  
  // 加载生成记录
  const loadRecords = async (currentPage: number = page, currentSize: number = size) => {
    setLoading(true);
    try {
      const data = await generationAPI.getGenerationRecords(siteId, currentPage, currentSize);
      setRecords(data.records);
      setTotal(data.total);
    } catch (err: any) {
      console.error('加载记录失败:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 组件挂载时加载记录
  useEffect(() => {
    setPage(1);
    loadRecords(1, size);
  }, [siteId]);

  // 处理分页变化
  const handlePageChange = (newPage: number, newSize?: number) => {
    setPage(newPage);
    if (newSize) {
      setSize(newSize);
    }
    loadRecords(newPage, newSize || size);
  };
  
  return {
    records, // 生成记录列表
    loading, // 加载状态
    total, // 总记录数
    page, // 当前页码
    size, // 每页数量
    handlePageChange, // 处理分页变化
    loadRecords // 重新加载函数
  };
};
