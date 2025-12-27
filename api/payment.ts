/**
 * 支付管理 API
 */
import { get, put, post, del } from './index';
import { SiteId } from '../constants/sites';

// 支付配置接口
export interface PaymentConfig {
  id: number; // 配置ID
  paymentType: string; // 支付方式：wechat-微信支付，alipay-支付宝支付，bank_transfer-对公转账
  configJson?: string; // 配置信息（JSON格式）
  isEnabled: boolean; // 是否启用
  siteId: SiteId; // 站点ID（1=医美类, 2=电商类, 3=生活服务类）
}

// 获取支付配置列表（按站点ID）
export const getPaymentConfigs = async (siteId: SiteId): Promise<PaymentConfig[]> => {
  return get<PaymentConfig[]>(`/admin/payments?siteId=${siteId}`);
};

// 创建或更新支付配置
export const createOrUpdatePaymentConfig = async (
  paymentType: string,
  siteId: SiteId,
  config: Partial<PaymentConfig>
): Promise<PaymentConfig> => {
  return post<PaymentConfig>(`/admin/payments/${paymentType}?siteId=${siteId}`, config);
};

// 更新支付配置的启用状态
export const updatePaymentConfigStatus = async (
  paymentType: string,
  siteId: SiteId,
  isEnabled: boolean
): Promise<PaymentConfig> => {
  return put<PaymentConfig>(`/admin/payments/${paymentType}/status?siteId=${siteId}`, isEnabled);
};

// 更新支付配置
export const updatePaymentConfig = async (
  paymentType: string,
  siteId: SiteId,
  config: Partial<PaymentConfig>
): Promise<PaymentConfig> => {
  return put<PaymentConfig>(`/admin/payments/${paymentType}?siteId=${siteId}`, config);
};

// 删除支付配置
export const deletePaymentConfig = async (
  paymentType: string,
  siteId: SiteId
): Promise<void> => {
  return del<void>(`/admin/payments/${paymentType}?siteId=${siteId}`);
};

