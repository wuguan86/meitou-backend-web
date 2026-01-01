import { get, post } from './index';
import { SiteId } from '../constants/sites';

export interface CustomerServiceConfig {
  id?: number;
  siteId: number;
  qrCodeUrl: string;
  contactText: string;
}

export const getConfig = async (siteId: SiteId): Promise<CustomerServiceConfig> => {
  const params = new URLSearchParams();
  params.append('siteId', siteId.toString());
  return get<CustomerServiceConfig>(`/admin/customer-service/config?${params.toString()}`);
};

export const saveConfig = async (siteId: SiteId, config: Partial<CustomerServiceConfig>): Promise<CustomerServiceConfig> => {
  return post<CustomerServiceConfig>(`/admin/customer-service/config?siteId=${siteId}`, config);
};
