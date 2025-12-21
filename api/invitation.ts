/**
 * 邀请码管理 API
 */
import { get, post, put } from './index';
import { InvitationCode } from '../types';

// 获取邀请码列表
export const getInvitations = async (siteCategory?: string): Promise<InvitationCode[]> => {
  const params = new URLSearchParams();
  if (siteCategory) params.append('siteCategory', siteCategory);
  
  return get<InvitationCode[]>(`/admin/invitations?${params.toString()}`);
};

// 生成邀请码
export const generateInvitations = async (params: {
  count: number;
  points: number;
  maxUses: number;
  siteCategory: string;
  channel?: string;
  validStartDate?: string;
  validEndDate?: string;
}): Promise<InvitationCode[]> => {
  return post<InvitationCode[]>('/admin/invitations/generate', params);
};

// 更新邀请码
export const updateInvitation = async (id: string, code: Partial<InvitationCode>): Promise<InvitationCode> => {
  return put<InvitationCode>(`/admin/invitations/${id}`, code);
};

