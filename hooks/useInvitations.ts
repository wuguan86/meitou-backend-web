import { useState, useEffect } from 'react';
import { InvitationCode } from '../types';
import * as invitationAPI from '../api/invitation';

// useInvitations Hook - 管理邀请码数据
export const useInvitations = (activeCategory: string) => {
  const [codes, setCodes] = useState<InvitationCode[]>([]); // 邀请码列表
  const [loading, setLoading] = useState(false); // 加载状态
  
  // 加载邀请码列表
  const loadCodes = async () => {
    setLoading(true);
    try {
      const data = await invitationAPI.getInvitations(activeCategory);
      setCodes(data);
    } catch (err: any) {
      console.error('加载邀请码失败:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 当分类变化时重新加载
  useEffect(() => {
    loadCodes();
  }, [activeCategory]);
  
  return {
    codes, // 邀请码列表
    loading, // 加载状态
    loadCodes // 重新加载函数
  };
};

