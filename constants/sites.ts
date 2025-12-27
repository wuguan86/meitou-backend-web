/**
 * 站点映射常量
 * siteId: 1=医美类, 2=电商类, 3=生活服务类
 */
export const SITES = {
  MEDICAL: 1,      // 医美类
  ECOMMERCE: 2,    // 电商类
  LIFE: 3          // 生活服务类
} as const;

export const SITE_NAMES: Record<number, string> = {
  [SITES.MEDICAL]: '医美类',
  [SITES.ECOMMERCE]: '电商类',
  [SITES.LIFE]: '生活服务类'
};

export const SITE_IDS = [SITES.MEDICAL, SITES.ECOMMERCE, SITES.LIFE] as const;

export type SiteId = typeof SITE_IDS[number];

