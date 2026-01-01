/**
 * API 基础配置
 * 提供统一的 HTTP 请求封装
 */
import { message } from 'antd';

// 开发环境：使用相对路径，通过Vite代理转发
// 生产环境：根据实际部署情况配置
const API_BASE_URL = '/api';

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
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    // 检查响应状态
    if (!response.ok) {
      // 处理 401 Unauthorized 或 403 Forbidden
      if (response.status === 401 || response.status === 403) {
        // 清除认证信息
        localStorage.removeItem('admin_token');
        localStorage.removeItem('vidu_admin_session');
        
        message.error('会话已过期，请重新登录');
        // 刷新页面以重置状态（回到登录页）
        setTimeout(() => window.location.reload(), 1500);
        throw new Error('会话已过期，请重新登录');
      }

      // 处理 500 系统错误
      if (response.status >= 500) {
        const errorMsg = '系统内部错误，请联系管理员';
        message.error(errorMsg);
        throw new Error(errorMsg);
      }

      // 尝试解析错误信息
      let errorMessage = '请求失败';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      message.error(errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // 如果响应格式是 Result<T>
    if (data.code !== undefined) {
      if (data.code === 200) {
        return data.data;
      } else {
        // 业务错误 (Business Error)
        const errorMsg = data.message || '操作失败';
        message.error(errorMsg);
        throw new Error(errorMsg);
      }
    }

    return data;
  } catch (error: any) {
    // 处理网络错误（如连接失败、跨域问题等）
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const netErrorMsg = '无法连接到服务器，请检查后端服务是否运行';
      message.error(netErrorMsg);
      throw new Error(netErrorMsg);
    }
    
    // 如果是我们在上面抛出的错误，不需要再次处理，但为了Promise链的catch，还是抛出
    // 注意：这里可能导致组件层的 catch 也捕捉到。
    // 如果组件层也 alert，就会重复。我们将移除组件层的 alert。
    throw error;
  }
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

