/**
 * 广场管理 API
 */
import { get, put, del } from './index';

export interface PublishedContent {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  title: string;
  description?: string;
  type: 'image' | 'video';
  generationType: string;
  contentUrl: string;
  thumbnail?: string;
  generationConfig?: string;
  status: 'published' | 'hidden';
  isPinned: boolean;
  likeCount: number;
  publishedAt: string;
  siteId: string;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export const squareAPI = {
  getList: async (page: number = 1, size: number = 100, siteId?: number, type?: string, keyword?: string): Promise<PageResult<PublishedContent>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (siteId) params.append('siteId', siteId.toString());
    if (type) params.append('type', type);
    if (keyword) params.append('keyword', keyword);
    return get<PageResult<PublishedContent>>(`/admin/square/list?${params.toString()}`);
  },
  toggleStatus: async (id: string, siteId: number): Promise<void> => {
    return put<void>(`/admin/square/${id}/status?siteId=${siteId}`);
  },
  togglePin: async (id: string, siteId: number): Promise<void> => {
    return put<void>(`/admin/square/${id}/pin?siteId=${siteId}`);
  },
  deleteContent: async (id: string, siteId: number): Promise<void> => {
    return del<void>(`/admin/square/${id}?siteId=${siteId}`);
  },
  updateLikeCount: async (id: string, count: number, siteId: number): Promise<void> => {
    return put<void>(`/admin/square/${id}/like?count=${count}&siteId=${siteId}`);
  }
};
