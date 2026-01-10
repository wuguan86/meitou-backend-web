import { useState, useEffect } from 'react';
import { UserAsset } from '../types';
import * as assetAPI from '../api/asset';
import { SiteId } from '../constants/sites';

// useAssets Hook - 管理资产列表数据
export const useAssets = (
  activeCategory: SiteId, 
  activeTab: 'all' | 'image' | 'video', 
  search: string
) => {
  const [assets, setAssets] = useState<UserAsset[]>([]); // 资产列表
  const [loading, setLoading] = useState(false); // 加载状态
  
  // 加载资产列表
  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await assetAPI.getAssets(
        activeCategory, 
        activeTab === 'all' ? undefined : activeTab, 
        search || undefined
      );
      setAssets(data);
    } catch (err: any) {
      console.error('加载内容失败:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 当分类、类型或搜索条件变化时重新加载
  useEffect(() => {
    loadAssets();
  }, [activeCategory, activeTab, search]);
  
  return {
    assets, // 资产列表
    loading, // 加载状态
    loadAssets, // 重新加载函数
    setAssets // 设置资产列表（用于更新）
  };
};

