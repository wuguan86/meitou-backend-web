/**
 * 用户管理 API
 */
import { get, post, put, del } from './index';
import { User } from '../types';

// 获取用户列表
export const getUsers = async (category?: string, search?: string): Promise<User[]> => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  
  return get<User[]>(`/admin/users?${params.toString()}`);
};

// 获取用户详情
export const getUserById = async (id: string): Promise<User> => {
  return get<User>(`/admin/users/${id}`);
};

// 创建用户
export const createUser = async (user: Partial<User>): Promise<User> => {
  return post<User>('/admin/users', user);
};

// 更新用户
export const updateUser = async (id: string, user: Partial<User>): Promise<User> => {
  return put<User>(`/admin/users/${id}`, user);
};

// 删除用户
export const deleteUser = async (id: string): Promise<void> => {
  await del(`/admin/users/${id}`);
};

// 赠送积分
export const giftPoints = async (id: string, points: number): Promise<User> => {
  return post<User>(`/admin/users/${id}/gift-points?points=${points}`);
};

