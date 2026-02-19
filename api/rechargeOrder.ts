import api from './index';
import { PageResult } from '../types';

export interface RechargeOrder {
  id: number;
  orderNo: string;
  userId: number;
  amount: number;
  points: number;
  productType: string;
  paymentType: string;
  status: string;
  createdAt: string;
  user?: {
    username: string;
    phone: string;
  };
}

export interface RechargeStats {
  totalAmount: number;
  totalOrders?: number;
}

export interface RechargeOrderQuery {
  siteId: number;
  search?: string;
  paymentType?: string;
  status?: string;
  productType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export const getRechargeOrders = (params: RechargeOrderQuery) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return api.get<PageResult<RechargeOrder>>(`/admin/recharge-orders?${queryString}`);
};

export const getRechargeStats = (params: RechargeOrderQuery) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return api.get<RechargeStats>(`/admin/recharge-orders/stats?${queryString}`);
};

export const exportRechargeOrders = (params: RechargeOrderQuery) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return api.get(`/admin/recharge-orders/export?${queryString}`, {
    responseType: 'blob'
  });
};
