import { useState, useEffect } from 'react';
import { message } from 'antd';
import { User } from '../types';
import * as userAPI from '../api/user';
import { SiteId } from '../constants/sites';

// useUsers Hook - 管理用户列表数据
export const useUsers = (activeSiteId: SiteId, search: string) => {
  const [users, setUsers] = useState<User[]>([]); // 用户列表
  const [loading, setLoading] = useState(false); // 加载状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // 加载用户列表
  const loadUsers = async (page = pagination.current, size = pagination.pageSize) => {
    setLoading(true);
    try {
      const data = await userAPI.getUsers(activeSiteId, search || undefined, page, size);
      setUsers(data.records);
      setPagination({
        current: Number(data.current),
        pageSize: Number(data.size),
        total: Number(data.total)
      });
    } catch (err: any) {
      console.error('加载用户列表失败:', err);
      message.error('加载用户列表失败: ' + (err.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };
  
  // 当站点ID或搜索条件变化时重新加载（重置为第一页）
  useEffect(() => {
    loadUsers(1, 10);
  }, [activeSiteId, search]);
  
  // 处理分页变化
  const handlePageChange = (page: number, pageSize: number) => {
    loadUsers(page, pageSize);
  };
  
  return {
    users, // 用户列表
    loading, // 加载状态
    pagination, // 分页信息
    loadUsers: () => loadUsers(pagination.current, pagination.pageSize), // 重新加载函数（保持当前页）
    handlePageChange, // 分页变化处理
    setUsers // 设置用户列表（用于更新）
  };
};

