/**
 * 后台账号管理 API
 */
import { get, post, put, del } from './index';
import { BackendAccount } from '../types';

// 获取账号列表
export const getAccounts = async (): Promise<BackendAccount[]> => {
  return get<BackendAccount[]>('/accounts');
};

// 创建账号
export const createAccount = async (account: Partial<BackendAccount>): Promise<BackendAccount> => {
  return post<BackendAccount>('/accounts', account);
};

// 更新账号
export const updateAccount = async (id: string, account: Partial<BackendAccount>): Promise<BackendAccount> => {
  return put<BackendAccount>(`/accounts/${id}`, account);
};

// 删除账号
export const deleteAccount = async (id: string): Promise<void> => {
  await del(`/accounts/${id}`);
};

