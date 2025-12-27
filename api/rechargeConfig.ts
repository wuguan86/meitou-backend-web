/**
 * 充值配置管理 API
 */
import { get, post, put, del } from './index';
import { SiteId } from '../constants/sites';

// 充值配置接口（后端返回的数据格式）
interface RechargeConfigResponse {
  id: number; // 后端返回Long类型，JSON序列化为number
  siteId: number; // 站点ID：1=医美类, 2=电商类, 3=生活服务类
  exchangeRate: number; // 兑换比例（1元 = X算力）
  minAmount: number; // 最低充值金额（元）
  optionsJson: string; // 充值选项列表（JSON格式）
  allowCustom: boolean; // 是否启用自定义金额
  isEnabled: boolean; // 是否启用
  createdAt?: string;
  updatedAt?: string;
}

// 前端使用的充值配置接口（id转换为string）
export interface RechargeConfig {
  id: string;
  siteId: SiteId; // 站点ID：1=医美类, 2=电商类, 3=生活服务类
  exchangeRate: number; // 兑换比例（1元 = X算力）
  minAmount: number; // 最低充值金额（元）
  optionsJson: string; // 充值选项列表（JSON格式）
  allowCustom: boolean; // 是否启用自定义金额
  isEnabled: boolean; // 是否启用
  createdAt?: string;
  updatedAt?: string;
}

// 数据转换函数：将后端响应转换为前端格式
const convertConfig = (config: RechargeConfigResponse): RechargeConfig => {
  return {
    ...config,
    id: String(config.id), // 将number转换为string
  };
};

// 充值选项
export interface RechargeOption {
  points: number; // 算力点数
  price: number; // 价格（元）
}

// 获取所有充值配置（按站点ID）
export const getRechargeConfigs = async (siteId: SiteId): Promise<RechargeConfig[]> => {
  const data = await get<RechargeConfigResponse[]>(`/admin/recharge-configs?siteId=${siteId}`);
  return data.map(convertConfig);
};

// 根据站点ID获取充值配置
export const getRechargeConfigBySiteId = async (siteId: SiteId): Promise<RechargeConfig> => {
  const data = await get<RechargeConfigResponse>(`/admin/recharge-configs/by-site?siteId=${siteId}`);
  return convertConfig(data);
};

// 根据ID获取充值配置
export const getRechargeConfigById = async (id: string): Promise<RechargeConfig> => {
  const data = await get<RechargeConfigResponse>(`/admin/recharge-configs/${id}`);
  return convertConfig(data);
};

// 创建充值配置
export const createRechargeConfig = async (config: Partial<RechargeConfig>): Promise<RechargeConfig> => {
  if (!config.siteId) {
    throw new Error('站点ID不能为空');
  }
  // 转换请求数据：将string类型的id转换为number（如果存在）
  const requestData: any = { ...config };
  if (requestData.id) {
    requestData.id = parseInt(requestData.id);
  }
  const data = await post<RechargeConfigResponse>(`/admin/recharge-configs?siteId=${config.siteId}`, requestData);
  return convertConfig(data);
};

// 更新充值配置
export const updateRechargeConfig = async (id: string, config: Partial<RechargeConfig>): Promise<RechargeConfig> => {
  if (!config.siteId) {
    throw new Error('站点ID不能为空');
  }
  // 转换请求数据：移除id字段（更新时不需要）
  const requestData: any = { ...config };
  delete requestData.id;
  const data = await put<RechargeConfigResponse>(`/admin/recharge-configs/${id}?siteId=${config.siteId}`, requestData);
  return convertConfig(data);
};

// 删除充值配置
export const deleteRechargeConfig = async (id: string, siteId: SiteId): Promise<void> => {
  return del<void>(`/admin/recharge-configs/${id}?siteId=${siteId}`);
};

