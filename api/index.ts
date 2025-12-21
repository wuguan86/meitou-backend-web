/**
 * API 基础配置
 * 提供统一的 HTTP 请求封装
 */

const API_BASE_URL = 'http://localhost:8080/api';

// 请求拦截器：添加 Token
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // 从 localStorage 获取 Token
  const token = localStorage.getItem('admin_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// 统一请求处理
const request = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '请求失败');
  }

  // 如果响应格式是 Result<T>
  if (data.code !== undefined) {
    if (data.code === 200) {
      return data.data;
    } else {
      throw new Error(data.message || '请求失败');
    }
  }

  return data;
};

// GET 请求
export const get = <T>(url: string): Promise<T> => {
  return request<T>(url, { method: 'GET' });
};

// POST 请求
export const post = <T>(url: string, body?: any): Promise<T> => {
  return request<T>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

// PUT 请求
export const put = <T>(url: string, body?: any): Promise<T> => {
  return request<T>(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

// DELETE 请求
export const del = <T>(url: string): Promise<T> => {
  return request<T>(url, { method: 'DELETE' });
};

// 文件上传请求（使用 FormData）
export const uploadFile = async <T>(
  url: string,
  file: File,
  folder?: string
): Promise<T> => {
  // 创建 FormData
  const formData = new FormData();
  formData.append('file', file);
  if (folder) {
    formData.append('folder', folder);
  }

  // 获取 Token（不包含 Content-Type，让浏览器自动设置）
  const headers: HeadersInit = {};
  const token = localStorage.getItem('admin_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 发送请求
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '上传失败');
  }

  // 如果响应格式是 Result<T>
  if (data.code !== undefined) {
    if (data.code === 200) {
      return data.data;
    } else {
      throw new Error(data.message || '上传失败');
    }
  }

  return data;
};

export default { get, post, put, delete: del, uploadFile };

