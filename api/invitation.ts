/**
 * 邀请码管理 API
 */
import { get, post, put, del } from './index';
import { InvitationCode, PageResult } from '../types';
import { SiteId } from '../constants/sites';

// 获取邀请码列表
export const getInvitations = async (
  page: number = 1,
  pageSize: number = 10,
  siteId?: SiteId,
  code?: string,
  channel?: string,
  status?: string
): Promise<PageResult<InvitationCode>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', pageSize.toString());
  if (siteId) params.append('siteId', siteId.toString());
  if (code) params.append('code', code);
  if (channel) params.append('channel', channel);
  if (status) params.append('status', status);
  
  return get<PageResult<InvitationCode>>(`/admin/invitations?${params.toString()}`);
};

// 生成邀请码
export const generateInvitations = async (params: {
  count: number;
  points: number;
  maxUses: number;
  siteId: SiteId;
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

// 删除邀请码
export const deleteInvitation = async (id: string): Promise<void> => {
  return del(`/admin/invitations/${id}`);
};


