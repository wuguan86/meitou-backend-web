/**
 * 会员套餐配置管理 API
 */
import { get, post, put, del } from './index';
import { SiteId } from '../constants/sites';

// 会员套餐接口
export interface MembershipPackage {
  id: number;
  siteId: number; // 站点ID
  name: string; // 套餐名称
  levelCode: string; // 等级代码
  sortOrder: number; // 排序权重
  isActive: boolean; // 是否上架
  isRecommended: boolean; // 是否推荐
  badgeText?: string; // 顶部标签文案
  
  monthlyPrice: number; // 单月原价
  monthlyDiscountPrice: number; // 单月首购/优惠价
  yearlyPrice: number; // 包年总原价
  yearlyDiscountPrice: number; // 包年优惠后总价
  
  pointsReward: number; // 赠送算力值
  
  buttonText: string; // 按钮文字
  buttonType: 'buy' | 'contact'; // 动作类型
  primaryColor?: string; // 主题色
  featuresJson: string; // 权益列表JSON字符串
  
  createdAt?: string;
  updatedAt?: string;
}

// 获取所有会员套餐（按站点ID）
export const getPackages = async (siteId: SiteId): Promise<MembershipPackage[]> => {
  return get<MembershipPackage[]>(`/admin/membership-packages?siteId=${siteId}`);
};

// 根据ID获取会员套餐
export const getPackageById = async (id: number, siteId: SiteId): Promise<MembershipPackage> => {
  return get<MembershipPackage>(`/admin/membership-packages/${id}?siteId=${siteId}`);
};

// 创建会员套餐
export const createPackage = async (siteId: SiteId, pkg: Partial<MembershipPackage>): Promise<MembershipPackage> => {
  return post<MembershipPackage>(`/admin/membership-packages?siteId=${siteId}`, pkg);
};

// 更新会员套餐
export const updatePackage = async (id: number, siteId: SiteId, pkg: Partial<MembershipPackage>): Promise<MembershipPackage> => {
  return put<MembershipPackage>(`/admin/membership-packages/${id}?siteId=${siteId}`, pkg);
};

// 删除会员套餐
export const deletePackage = async (id: number, siteId: SiteId): Promise<void> => {
  return del<void>(`/admin/membership-packages/${id}?siteId=${siteId}`);
};
