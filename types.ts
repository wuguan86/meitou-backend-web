
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
  category: 'medical' | 'ecommerce' | 'life'; 
  createdAt: string;
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
  category: 'medical' | 'ecommerce' | 'life';
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
  siteCategory: 'medical' | 'ecommerce' | 'life'; 
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
  siteCategory: 'medical' | 'ecommerce' | 'life';
  contentUrl?: string; 
}

export interface InvitationCode {
  id: string;
  code: string;
  points: number;
  usedCount: number;
  maxUses: number;
  status: 'active' | 'expired';
  createdAt: string;
  siteCategory: 'medical' | 'ecommerce' | 'life'; 
  channel: string; 
  validStartDate?: string; 
  validEndDate?: string; 
}

export interface ManualConfig {
  id: string;
  siteCategory: 'medical' | 'ecommerce' | 'life';
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

export interface ApiPlatform {
  id: string;
  name: string;
  alias?: string;
  apiKey: string;
  isEnabled: boolean;
  description?: string; 
  site?: 'medical' | 'ecommerce' | 'life';
  nodeInfo?: string;
  interfaces: ApiInterface[];
  icon?: string;
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
  | 'gen_records'
  | 'invitations' 
  | 'accounts'
  | 'roles'
  | 'users';
