/**
 * 用户管理 API
 */
import { get, post, put, del } from './index';
import { User, PageResult } from '../types';
import { SiteId } from '../constants/sites';

// 获取用户列表
export const getUsers = async (siteId: SiteId, search?: string, page: number = 1, size: number = 10): Promise<PageResult<User>> => {
  const params = new URLSearchParams();
  params.append('siteId', siteId.toString()); // siteId 是必传参数
  if (search) params.append('search', search);
  params.append('page', page.toString());
  params.append('size', size.toString());
  
  return get<PageResult<User>>(`/admin/users?${params.toString()}`);
};

// 获取用户详情
export const getUserById = async (id: string, siteId: SiteId): Promise<User> => {
  return get<User>(`/admin/users/${id}?siteId=${siteId}`);
};

// 创建用户
export const createUser = async (siteId: SiteId, user: Partial<User>): Promise<User> => {
  return post<User>(`/admin/users?siteId=${siteId}`, user);
};

// 更新用户
export const updateUser = async (id: string, siteId: SiteId, user: Partial<User>): Promise<User> => {
  return put<User>(`/admin/users/${id}?siteId=${siteId}`, user);
};

// 删除用户
export const deleteUser = async (id: string, siteId: SiteId): Promise<void> => {
  await del(`/admin/users/${id}?siteId=${siteId}`);
};

// 赠送积分
export const giftPoints = async (id: string, siteId: SiteId, points: number): Promise<User> => {
  return post<User>(`/admin/users/${id}/gift-points?siteId=${siteId}&points=${points}`);
};

