
import React from 'react';
import { 
  LayoutDashboard, 
  Menu, 
  Megaphone, 
  Settings, 
  Key, 
  CreditCard, 
  FileClock,
  Ticket,
  LayoutGrid,
  Images,
  Users as UsersIcon,
  ShieldAlert,
} from 'lucide-react';
import { ApiCategory, User, UserAsset, MarketingAd, GenerationRecord, InvitationCode, MenuConfig, ManualConfig, BackendAccount } from './types';

// Sidebar Menu Configuration - V2.6.2
export const SIDEBAR_MENU = [
  { id: 'dashboard', label: '首页', icon: <LayoutDashboard size={18} /> },
  { id: 'users', label: '用户管理', icon: <UsersIcon size={18} /> },
  { id: 'square', label: '广场管理', icon: <LayoutGrid size={18} /> },
  { id: 'assets', label: '资产管理', icon: <Images size={18} /> },
  { id: 'marketing', label: '营销管理', icon: <Megaphone size={18} /> }, 
  { 
    id: 'system', 
    label: '系统设置', 
    icon: <Settings size={18} />,
    children: [
      { id: 'menus', label: '菜单管理', icon: <Menu size={14} /> },
      { id: 'api', label: 'API接口管理', icon: <Key size={14} /> },
      { id: 'payment', label: '支付管理', icon: <CreditCard size={14} /> },
      { id: 'gen_records', label: '生成记录', icon: <FileClock size={14} /> },
      { id: 'invitations', label: '邀请码管理', icon: <Ticket size={14} /> },
      { id: 'accounts', label: '账号管理', icon: <ShieldAlert size={14} /> },
    ]
  },
];

export const MOCK_BACKEND_ACCOUNTS: BackendAccount[] = [
  { id: 'acc1', email: 'admin@meitou.com', role: 'admin', status: 'active', lastLogin: '2024-07-29 10:30' },
  { id: 'acc2', email: 'operator@meitou.com', role: 'operator', status: 'active', lastLogin: '2024-07-29 09:15' },
];

export const MOCK_GEN_RECORDS: GenerationRecord[] = [
  { id: 'gen_001', userId: '1', username: 'admin_beauty', type: 'txt2img', model: 'Flux.1', prompt: '赛博朋克风格的未来北京', cost: 5, status: 'success', createdAt: '2024-07-29 10:00:00', siteCategory: 'medical', contentUrl: 'https://picsum.photos/800/600?random=100' },
  { id: 'gen_002', userId: '2', username: 'dr_zhang', type: 'txt2video', model: 'Sora', prompt: '一只在雪地里奔跑的小狗', cost: 20, status: 'success', createdAt: '2024-07-29 11:30:00', siteCategory: 'medical', contentUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
];

export const MOCK_INVITATIONS: InvitationCode[] = [
  { id: '1', code: 'PROMO2024', points: 100, usedCount: 15, maxUses: 100, status: 'active', createdAt: '2024-07-01', siteCategory: 'medical', channel: '线下活动', validStartDate: '2024-01-01', validEndDate: '2024-12-31' },
];

export const MOCK_USERS: User[] = [
  { id: '1', email: 'contact@beauty.com', username: 'admin_beauty', phone: '13800138000', balance: 5000, status: 'active', category: 'medical', company: '美好医美诊所', role: '店长', createdAt: '2024-06-10' },
  { id: '2', email: 'dr.zhang@clinic.com', username: 'dr_zhang', phone: '13666666666', balance: 8000, status: 'active', category: 'medical', company: '张氏诊所', role: '医师', createdAt: '2024-05-15' },
];

export const MOCK_ASSETS: UserAsset[] = [
  { id: '101', title: '示例风景图', type: 'image', category: 'ecommerce', url: 'https://picsum.photos/400/300?random=1', uploadDate: '2024-07-01', userId: '1', userName: 'admin_beauty', status: 'published', isPinned: true, likeCount: 124 },
  { id: '102', title: '产品展示视频', type: 'video', category: 'medical', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', thumbnail: 'https://picsum.photos/400/300?random=2', uploadDate: '2024-07-05', userId: '1', userName: 'admin_beauty', status: 'published', isPinned: false, likeCount: 89 },
  { id: '103', title: '背景提示音', type: 'audio', category: 'life', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', uploadDate: '2024-07-10', userId: '2', userName: 'dr_zhang', status: 'hidden', isPinned: false, likeCount: 45 },
  { id: '104', title: '时尚穿搭', type: 'image', category: 'ecommerce', url: 'https://picsum.photos/400/600?random=3', uploadDate: '2024-07-11', userId: '1', userName: 'admin_beauty', status: 'published', isPinned: false, likeCount: 230 },
  { id: '105', title: '医疗器械', type: 'image', category: 'medical', url: 'https://picsum.photos/400/500?random=4', uploadDate: '2024-07-12', userId: '2', userName: 'dr_zhang', status: 'published', isPinned: false, likeCount: 12 },
];

export const MOCK_ADS: MarketingAd[] = [
  { id: 'ad1', title: '2024春季大促广告', imageUrl: 'https://picsum.photos/800/400?random=50', startDate: '2024-03-01', endDate: '2024-12-31', linkType: 'internal_rich', richContent: '<h1>春季特惠</h1><p>全场积分充值8折起...</p>', isActive: true, siteCategory: 'medical', position: 1, isFullScreen: true },
];

export const MOCK_MANUALS: ManualConfig[] = [
  { id: 'm1', siteCategory: 'medical', title: '医美工作流使用手册', url: 'https://docs.medical.com/guide' },
  { id: 'm2', siteCategory: 'ecommerce', title: '电商工作流使用手册', url: 'https://docs.ecom.com/guide' },
  { id: 'm3', siteCategory: 'life', title: '生活服务工作流使用手册', url: 'https://docs.life.com/guide' },
];

export const MOCK_API_CATEGORIES: ApiCategory[] = [ 
  { 
    id: 'txt2img', 
    name: '文生图 (Text to Image)', 
    icon: 'ImageIcon', 
    description: 'AI图像生成接口', 
    platforms: [ 
        { 
          id: 'flux', 
          name: 'Flux.1 API', 
          apiKey: 'sk-flux-xxxx', 
          isEnabled: true, 
          site: 'medical',
          nodeInfo: '海外节点',
          interfaces: [
            {
              id: 'if1',
              url: 'https://api.flux.ai/v1/generate',
              method: 'POST',
              responseMode: 'JSON',
              headers: [{id: 'h1', key: 'Authorization', value: 'Bearer {apiKey}'}],
              parametersJSON: '{"prompt": "string", "aspect_ratio": "16:9"}',
              paramDocs: [{id: 'pd1', name: 'prompt', type: 'string', example: 'a cat', desc: 'The image description'}]
            }
          ]
        }
    ] 
  },
  { 
    id: 'txt2video', 
    name: '文生视频 (Text to Video)', 
    icon: 'Video', 
    description: 'AI视频生成接口', 
    platforms: [ 
        { 
          id: 'sora', 
          name: 'Sora API', 
          apiKey: 'sk-sora-xxxx', 
          isEnabled: true,
          site: 'medical',
          nodeInfo: '国内直连', 
          interfaces: [
             {
              id: 'if2',
              url: 'https://api.openai.com/v1/sora/generate',
              method: 'POST',
              responseMode: 'Stream',
              headers: [],
              parametersJSON: '{}',
              paramDocs: []
            }
          ]
        }
    ] 
  } 
];

// Standard base menus
export const STANDARD_MENUS: MenuConfig[] = [
  { id: 'vision_analysis', label: '图视分析', code: 'vision_analysis', isVisible: true },
  { id: 'txt2img', label: '文生图', code: 'txt2img', isVisible: true },
  { id: 'txt2video', label: '文生视频', code: 'txt2video', isVisible: true },
  { id: 'img2img', label: '图生图', code: 'img2img', isVisible: true },
  { id: 'img2video', label: '图生视频', code: 'img2video', isVisible: true },
  { id: 'voice_clone', label: '声音克隆', code: 'voice_clone', isVisible: true },
];
