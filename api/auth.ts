/**
 * 认证相关 API
 */
import { post, get } from './index';

export interface LoginRequest {
  account: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  role: string;
}

// 登录
export const login = async (request: LoginRequest): Promise<LoginResponse> => {
  const response = await post<LoginResponse>('/auth/login', request);
  // 保存 Token
  if (response.token) {
    localStorage.setItem('admin_token', response.token);
    localStorage.setItem('vidu_admin_session', 'true');
  }
  return response;
};

// 登出
export const logout = async (): Promise<void> => {
  await post('/auth/logout');
  localStorage.removeItem('admin_token');
  localStorage.removeItem('vidu_admin_session');
};

// 检查登录状态
export const checkAuth = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('admin_token');
    if (!token) return false;
    
    const response = await get<boolean>('/auth/check');
    return response;
  } catch {
    return false;
  }
};

