/**
 * 菜单管理 API
 */
import { get, put } from './index';
import { MenuConfig } from '../types';

// 获取菜单配置（按站点）
export const getMenus = async (siteCategory: string): Promise<MenuConfig[]> => {
  return get<MenuConfig[]>(`/menus?siteCategory=${siteCategory}`);
};

// 更新菜单配置
export const updateMenu = async (id: string, menu: Partial<MenuConfig>): Promise<MenuConfig> => {
  return put<MenuConfig>(`/menus/${id}`, menu);
};

