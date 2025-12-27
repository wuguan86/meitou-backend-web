import { useState, useEffect } from 'react';
import { User } from '../types';
import * as userAPI from '../api/user';
import { SiteId } from '../constants/sites';

// useUsers Hook - 管理用户列表数据
export const useUsers = (activeSiteId: SiteId, search: string) => {
  const [users, setUsers] = useState<User[]>([]); // 用户列表
  const [loading, setLoading] = useState(false); // 加载状态
  
  // 加载用户列表
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userAPI.getUsers(activeSiteId, search || undefined);
      setUsers(data);
    } catch (err: any) {
      alert('加载用户列表失败: ' + (err.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };
  
  // 当站点ID或搜索条件变化时重新加载
  useEffect(() => {
    loadUsers();
  }, [activeSiteId, search]);
  
  // 前端过滤（后端已经根据siteId过滤，这里只做搜索过滤）
  const filteredUsers = users.filter(u => 
    search === '' || u.username?.includes(search) || u.email?.includes(search) || u.phone?.includes(search)
  );
  
  return {
    users: filteredUsers, // 过滤后的用户列表
    loading, // 加载状态
    loadUsers, // 重新加载函数
    setUsers // 设置用户列表（用于更新）
  };
};

