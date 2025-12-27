/**
 * API平台管理相关 API
 */
import { post, get, put, del } from './index';

// API平台请求接口
export interface ApiPlatformRequest {
  name: string; // 平台名称
  alias?: string; // 别名
  siteId?: number; // 所属站点ID（可选，NULL表示全局平台）：1=医美类, 2=电商类, 3=生活服务类
  nodeInfo?: string; // 节点信息
  isEnabled?: boolean; // 是否启用
  apiKey?: string; // API密钥
  description?: string; // 描述
  supportedModels?: string; // 支持的模型列表（以#号分割的字符串，例如：flux-1.0#flux-2.0）
  type?: string; // API类型：image_analysis, video_analysis, txt2img, img2img, txt2video, img2video, voice_clone
  interfaces?: ApiInterfaceRequest[]; // 接口列表
}

// API接口请求接口
export interface ApiInterfaceRequest {
  url: string; // 接口URL
  method: string; // 请求方法
  responseMode?: string; // 响应模式
  headers?: string; // 请求头配置（JSON字符串）
  parametersJson?: string; // 参数配置（JSON字符串）
  paramDocs?: string; // 参数文档（JSON字符串）
}

// API接口响应接口
export interface ApiInterfaceResponse {
  id: number; // 接口ID
  url: string; // 接口URL
  method: string; // 请求方法
  responseMode?: string; // 响应模式
  headers?: string; // 请求头配置（JSON字符串）
  parametersJson?: string; // 参数配置（JSON字符串）
  paramDocs?: string; // 参数文档（JSON字符串）
}

// API平台响应接口
export interface ApiPlatformResponse {
  id: number; // 平台ID
  name: string; // 平台名称
  alias?: string; // 别名
  site?: string; // 所属站点（向后兼容，已废弃，使用 siteId）
  siteId?: number; // 所属站点ID（可选，NULL表示全局平台）：1=医美类, 2=电商类, 3=生活服务类
  nodeInfo?: string; // 节点信息
  isEnabled: boolean; // 是否启用
  apiKey?: string; // API密钥
  description?: string; // 描述
  supportedModels?: string; // 支持的模型列表（以#号分割的字符串，例如：flux-1.0#flux-2.0）
  type?: string; // API类型：image_analysis, video_analysis, txt2img, img2img, txt2video, img2video, voice_clone
  interfaces?: ApiInterfaceResponse[]; // 接口列表
}

// 获取平台列表
export const getPlatforms = async (siteId?: number): Promise<ApiPlatformResponse[]> => {
  const params = siteId ? `?siteId=${siteId}` : '';
  return await get<ApiPlatformResponse[]>(`/admin/api-platforms${params}`);
};

// 获取平台详情
export const getPlatform = async (id: number): Promise<ApiPlatformResponse> => {
  return await get<ApiPlatformResponse>(`/admin/api-platforms/${id}`);
};

// 创建平台
export const createPlatform = async (request: ApiPlatformRequest): Promise<ApiPlatformResponse> => {
  return await post<ApiPlatformResponse>('/admin/api-platforms', request);
};

// 更新平台
export const updatePlatform = async (id: number, request: ApiPlatformRequest): Promise<ApiPlatformResponse> => {
  return await put<ApiPlatformResponse>(`/admin/api-platforms/${id}`, request);
};

// 删除平台
export const deletePlatform = async (id: number, siteId: number): Promise<void> => {
  return await del<void>(`/admin/api-platforms/${id}?siteId=${siteId}`);
};

