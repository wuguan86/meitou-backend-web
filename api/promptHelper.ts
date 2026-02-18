import { get, post } from './index';
import { SiteId } from '../constants/sites';

export interface PromptHelperConfig {
  id?: number;
  siteId?: number;
  subjectEnhancement: string;
  sceneEnhancement: string;
  cameraComposition: string;
  lightQuality: string;
  detailEnhancement: string;
  computeConsumption?: number;
}

// 获取提示词助手配置
export const getPromptHelperConfig = async (siteId: SiteId): Promise<PromptHelperConfig> => {
  return get<PromptHelperConfig>(`/admin/prompt-helper?siteId=${siteId}`);
};

// 保存提示词助手配置
export const savePromptHelperConfig = async (siteId: SiteId, config: PromptHelperConfig): Promise<PromptHelperConfig> => {
  return post<PromptHelperConfig>(`/admin/prompt-helper?siteId=${siteId}`, config);
};
