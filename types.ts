import { SiteId } from './constants/sites';

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// Data Models

export interface User {
  id: string;
  email: string;
  username: string;
  password?: string; 
  phone: string;
  wechat?: string;
  role?: string;
  company?: string;
  balance: number;
  status: 'active' | 'suspended';
  siteId: SiteId; // 站点ID：1=医美类, 2=电商类, 3=生活服务类
  createdAt: string;
}

export interface Site {
  id: string;
  name: string; // 站点名称（如：医美类、电商类、生活服务类）
  code: string; // 站点代码（如：medical、ecommerce、life）
  domain: string; // 域名（用于识别站点，如：medical.example.com）
  logo?: string; // Logo图片地址
  websiteName?: string; // 网站名称
  loginSubtext?: string; // 登录框小文字
  websiteTitle?: string; // 网站Title信息
  favicon?: string; // Favicon图标地址
  status: 'active' | 'disabled'; // 状态：active-启用，disabled-禁用
  description?: string; // 站点描述
  manual?: string; // 使用手册
  userAgreement?: string; // 用户协议
  privacyPolicy?: string; // 隐私政策
  copyright?: string; // 版权信息(顶部)
  footerCopyright?: string; // 底部版权信息
  createdAt: string;
  updatedAt: string;
}

export interface BackendAccount {
  id: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  status: 'active' | 'locked';
  lastLogin: string;
}

export interface UserAsset {
  id: string;
  title: string;
  type: 'image' | 'video' | 'audio';
  siteId: SiteId; // 站点ID：1=医美类, 2=电商类, 3=生活服务类
  url: string;
  thumbnail?: string; 
  uploadDate: string;
  userId: string;
  userName: string;
  status: 'published' | 'hidden'; 
  isPinned: boolean; 
  likeCount: number; 
}

export interface MarketingAd {
  id: string;
  title: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  linkType: 'external' | 'internal_rich';
  linkUrl?: string;
  richContent?: string;
  summary?: string; 
  tags?: string[];  
  isActive: boolean;
  siteId: SiteId; // 站点ID：1=医美类, 2=电商类, 3=生活服务类
  position: number; 
  isFullScreen?: boolean; 
}

export interface GenerationRecord {
  id: string;
  userId: string;
  username: string;
  type: 'txt2img' | 'img2img' | 'txt2video' | 'img2video' | 'voice';
  model: string;
  prompt: string;
  cost: number;
  status: 'success' | 'failed' | 'processing';
  createdAt: string;
  siteId: SiteId; // 站点ID：1=医美类, 2=电商类, 3=生活服务类
  contentUrl?: string; 
  failureReason?: string;
  thumbnailUrl?: string;
}

export interface InvitationCode {
  id: string;
  code: string;
  points: number;
  usedCount: number;
  maxUses: number;
  status: 'active' | 'expired';
  createdAt: string;
  siteId: SiteId; // 站点ID：1=医美类, 2=电商类, 3=生活服务类
  channel: string; 
  validStartDate?: string; 
  validEndDate?: string; 
}

export interface ManualConfig {
  id: string;
  siteId: SiteId; // 站点ID：1=医美类, 2=电商类, 3=生活服务类
  title: string;
  url: string;
}

export interface ApiParamDoc {
  id: string;
  name: string;
  type: string;
  example: string;
  desc: string;
}

export interface ApiInterface {
  id: string;
  url: string;
  method: 'GET' | 'POST';
  responseMode: string;
  headers: {id: string, key: string, value: string}[];
  parametersJSON: string; 
  paramDocs: ApiParamDoc[];
}

export interface ApiCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  platforms: ApiPlatform[];
}

export interface ApiParameterMapping {
  id: string;
  platformId: string;
  modelName?: string;
  internalParam: string;
  targetParam: string;
  fixedValue?: string;
  defaultValue?: string;
  description?: string;
  mappingType: 1 | 2; // 1: Field Mapping, 2: Fixed Value
  isRequired: boolean;
  paramLocation: 'header' | 'query' | 'body';
  paramType: 'string' | 'integer' | 'boolean' | 'json';
  deleted: boolean;
  siteId: SiteId;
  createdAt: string;
  updatedAt: string;
}

export interface ApiPlatform {
  id: string | number;
  name: string;
  alias?: string;
  apiKey: string;
  isEnabled: boolean;
  description?: string; 
  siteId?: SiteId; // 站点ID（可选，NULL表示全局平台）：1=医美类, 2=电商类, 3=生活服务类
  nodeInfo?: string;
  interfaces: ApiInterface[];
  icon?: string;
  supportedModels?: string; // 支持的模型列表（JSON string of ModelConfig[] or old format string）
  type?: string; // API类型：image_analysis, video_analysis, txt2img, img2img, txt2video, img2video, upload_character, voice_clone, prompt_optimize
}

export interface ModelCostRule {
  id: string;
  resolution?: string;
  ratio?: string;
  duration?: number;
  cost: number;
}

export interface ModelConfig {
  id: string;
  name: string;
  label?: string;
  type: 'image' | 'video' | 'chat' | 'analysis';
  resolutions: string[];
  ratios: string[];
  durations?: number[];
  quantities?: number[];
  costRules: ModelCostRule[];
  defaultCost: number;
  chartProfile?: string;
}

export interface MenuConfig {
  id: string;
  label: string;
  isVisible: boolean;
  code: string;
}

// Navigation Types
export type NavSection = 
  | 'dashboard' 
  | 'square'
  | 'assets' 
  | 'marketing'
  | 'menus'
  | 'api' 
  | 'payment' 
  | 'recharge_config'
  | 'gen_records'
  | 'invitations' 
  | 'sites'
  | 'accounts'
  | 'roles'
  | 'users';
