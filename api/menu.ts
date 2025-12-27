/**
 * 菜单管理 API
 */
import { get, put } from './index';
import { MenuConfig } from '../types';
import { SiteId } from '../constants/sites';

// 获取菜单配置（按站点ID）
export const getMenus = async (siteId: SiteId): Promise<MenuConfig[]> => {
  return get<MenuConfig[]>(`/admin/menus?siteId=${siteId}`);
};

// 更新菜单配置
export const updateMenu = async (id: string, menu: Partial<MenuConfig>, siteId: number): Promise<MenuConfig> => {
  if (!siteId) {
    throw new Error('站点ID不能为空');
  }
  return put<MenuConfig>(`/admin/menus/${id}?siteId=${siteId}`, menu);
};

