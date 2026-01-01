import { useState, useEffect } from 'react';
import { BackendAccount } from '../types';
import * as accountAPI from '../api/account';

// useAccounts Hook - 管理后台账号数据
export const useAccounts = () => {
  const [accounts, setAccounts] = useState<BackendAccount[]>([]); // 账号列表
  const [loading, setLoading] = useState(false); // 加载状态
  
  // 加载账号列表
  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await accountAPI.getAccounts();
      setAccounts(data);
    } catch (err: any) {
      console.error('加载账号失败:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 组件挂载时加载账号列表
  useEffect(() => {
    loadAccounts();
  }, []);
  
  return {
    accounts, // 账号列表
    loading, // 加载状态
    loadAccounts // 重新加载函数
  };
};

