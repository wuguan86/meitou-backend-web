
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Menu as MenuIcon,
  X,
  Image as ImageIcon,
  Pin,
  EyeOff,
  Undo,
  Redo,
  Megaphone,
  Layers,
  CreditCard,
  Layout,
  Key,
  FileClock,
  Ticket,
  Upload,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Link as LinkIcon,
  ShieldAlert,
  Play,
  Music,
  Heart,
  Pencil,
  Server,
  Zap,
  Download,
  Headphones,
  Copy,
  Save,
  RefreshCw
} from 'lucide-react';
import { SIDEBAR_MENU, MOCK_ADS, MOCK_API_CATEGORIES, STANDARD_MENUS, MOCK_ASSETS, API_TYPES } from './constants';
import { User as UserType, UserAsset, MarketingAd, NavSection, GenerationRecord, InvitationCode, MenuConfig, BackendAccount, ApiPlatform, ApiInterface, ApiCategory, Site } from './types';
import { SITES, SiteId } from './constants/sites';
import { message, Modal as AntModal, Pagination } from 'antd';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
// API 服务
import * as authAPI from './api/auth';
import * as assetAPI from './api/asset';
import * as generationAPI from './api/generation';
import * as paymentAPI from './api/payment';
import * as invitationAPI from './api/invitation';
import * as accountAPI from './api/account';
import * as siteAPI from './api/site';
import * as uploadAPI from './api/upload';
import * as marketingAPI from './api/marketing';
import * as customerServiceAPI from './api/customerService';
import * as apiPlatformAPI from './api/apiPlatform';
import * as menuAPI from './api/menu';
import { squareAPI, PublishedContent } from './api/square';

// 导入已提取的通用组件
import Modal from './components/common/Modal';
import ToggleSwitch from './components/common/ToggleSwitch';
import StatusBadge from './components/common/StatusBadge';
import CategoryTabs from './components/common/CategoryTabs';
import FormItem from './components/common/FormItem';
import { ModelManager } from './components/common/ModelManager';
import { SecureImage } from './components/common/SecureImage';

// 导入已提取的页面组件
import Dashboard from './components/pages/Dashboard';
import UserManagement from './components/pages/UserManagement';
import AssetsManagement from './components/pages/AssetsManagement';
import RechargeConfigManagement from './components/pages/RechargeConfigManagement';
import ApiParameterMappingManagement from './components/pages/ApiParameterMappingManagement';

// 导入已提取的布局组件
import Login from './components/layout/Login';
import AdminLayout from './components/layout/AdminLayout';

// 导入自定义 hooks
import { useAuth } from './hooks/useAuth';
import { useAssets } from './hooks/useAssets';
import { useGenerationRecords } from './hooks/useGenerationRecords';
import { useInvitations } from './hooks/useInvitations';
import { useAccounts } from './hooks/useAccounts';

// --- Page Implementations ---
// Dashboard 和 UserManagement 已提取到 components/pages 目录

const SquareManagement = () => {
  const [activeSiteId, setActiveSiteId] = useState<SiteId>(SITES.MEDICAL); // 默认医美类（siteId=1）
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video'>('all');
  const [contents, setContents] = useState<PublishedContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editingLikeId, setEditingLikeId] = useState<string | null>(null);
  const [editLikeValue, setEditLikeValue] = useState<string>('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [previewItem, setPreviewItem] = useState<PublishedContent | null>(null);
  
  const loadContents = async (page = 1, size = 20, append = false) => {
    // Prevent multiple loads
    if (loading && append) return; 
    setLoading(true);
    try {
      const result = await squareAPI.getList(page, size, activeSiteId, activeTab === 'all' ? undefined : activeTab, search || undefined);
      if (append) {
        setContents(prev => [...prev, ...result.records]);
      } else {
        setContents(result.records);
      }
      setPagination({
        current: result.current,
        pageSize: result.size,
        total: result.total
      });
    } catch (err: any) {
      console.error('加载内容失败:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadContents(1, pagination.pageSize, false);
  }, [activeSiteId, activeTab]);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 50 && !loading && contents.length < pagination.total) {
       loadContents(pagination.current + 1, pagination.pageSize, true);
    }
  };
  
  const togglePin = async (id:string) => {
    try {
      await squareAPI.togglePin(id, activeSiteId);
      // Optimistic update
      setContents(prev => prev.map(item => item.id === id ? { ...item, isPinned: !item.isPinned } : item));
      message.success('操作成功');
    } catch (err: any) {
      message.error('操作失败: ' + (err.message || '未知错误'));
    }
  };

  const toggleStatus = async (id:string) => {
    try {
      await squareAPI.toggleStatus(id, activeSiteId);
      // Optimistic update
      setContents(prev => prev.map(item => 
          item.id === id ? { ...item, status: item.status === 'published' ? 'hidden' : 'published' } : item
      ));
      message.success('操作成功');
    } catch (err: any) {
      message.error('操作失败: ' + (err.message || '未知错误'));
    }
  };

  const handleDelete = async (id:string) => { 
    AntModal.confirm({
      title: '确认删除',
      content: '确认要删除此内容吗？\n一旦删除无法找回！',
      onOk: async () => {
        try {
          await squareAPI.deleteContent(id, activeSiteId);
          setContents(prev => prev.filter(item => item.id !== id));
          setPagination(prev => ({ ...prev, total: prev.total - 1 }));
          message.success('删除成功');
        } catch (err: any) {
          message.error('删除失败: ' + (err.message || '未知错误'));
        }
      }
    });
  };

  const handleDownload = (item: PublishedContent) => {
    const link = document.createElement('a');
    link.href = item.contentUrl;
    link.download = item.title || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startEditLike = (item: PublishedContent) => {
    setEditingLikeId(item.id);
    setEditLikeValue(item.likeCount?.toString() || '0');
  };

  const saveLike = async () => {
    if (!editingLikeId) return;
    try {
      const count = parseInt(editLikeValue) || 0;
      await squareAPI.updateLikeCount(editingLikeId, count, activeSiteId);
      setContents(prev => prev.map(item => item.id === editingLikeId ? { ...item, likeCount: count } : item));
      setEditingLikeId(null);
      message.success('更新点赞数成功');
    } catch (err: any) {
      message.error('更新失败: ' + (err.message || '未知错误'));
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 card-shadow flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">广场管理</h3>
          <div className="flex gap-2">
            <div className="relative w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="搜索作品名或作者名..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && loadContents(1, pagination.pageSize)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-slate-50" 
                />
            </div>
            <button 
              onClick={() => loadContents(1, pagination.pageSize)}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              查询
            </button>
          </div>
      </div>
      <div className="p-4 bg-slate-50/50 border-b flex flex-col sm:flex-row gap-4 justify-between">
          <CategoryTabs selected={activeSiteId} onSelect={setActiveSiteId} />
          <div className="flex bg-white rounded-lg p-1 border border-slate-200">
              {['all', 'image', 'video'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t as any)} className={`px-4 py-1.5 text-xs font-medium rounded capitalize ${activeTab === t ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                      {t === 'all' ? '全部' : t === 'image' ? '图片' : '视频'}
                  </button>
              ))}
          </div>
      </div>
      <div className="flex-1 overflow-auto p-6 flex flex-col" onScroll={handleScroll}>
        {loading && contents.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400">加载中...</div>
        ) : contents.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400">暂无数据</div>
        ) : (
          <>
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 mb-6">
            {contents.map(item => (
            <div key={item.id} className="break-inside-avoid group relative border rounded-xl shadow-sm hover:shadow-lg transition-all bg-white overflow-hidden mb-6">
                {item.isPinned && <div className="absolute top-2 left-2 bg-yellow-400 text-white p-1 rounded-md shadow-sm z-10"><Pin size={12} fill="currentColor"/></div>}
                <div className="bg-slate-100 relative cursor-pointer" onClick={() => setPreviewItem(item)}>
                    <SecureImage src={item.thumbnail || item.contentUrl} className="w-full h-auto object-cover block" />
                    {item.type === 'video' && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><Play className="text-white drop-shadow-md" fill="currentColor"/></div>}
                </div>
                <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-sm truncate flex-1 mr-2">{item.title}</p>
                        <StatusBadge status={item.status}/>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 border-t pt-2 mt-2">
                        <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">{item.userName?.substring(0,1).toUpperCase() || 'U'}</div>
                             <span className="truncate max-w-[80px]">{item.userName || 'Unknown'}</span>
                        </div>
                        {editingLikeId === item.id ? (
                          <div className="flex items-center gap-1 bg-slate-50 px-1 py-0.5 rounded-full border border-blue-200">
                             <input 
                               type="number" 
                               className="w-12 h-5 text-xs bg-transparent outline-none text-center"
                               value={editLikeValue}
                               onChange={(e) => setEditLikeValue(e.target.value)}
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter') saveLike();
                                 if (e.key === 'Escape') setEditingLikeId(null);
                               }}
                               autoFocus
                               onBlur={saveLike}
                             />
                          </div>
                        ) : (
                          <div 
                            className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-full cursor-pointer hover:bg-slate-100 transition-colors group/like"
                            onClick={() => startEditLike(item)}
                            title="点击修改点赞数"
                          >
                               <Heart size={12} className="text-red-500" fill="#ef4444" />
                               <span className="font-medium text-slate-600 group-hover/like:text-blue-600 transition-colors">{item.likeCount || 0}</span>
                          </div>
                        )}
                    </div>
                </div>
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20 pointer-events-none">
                    <div className="flex gap-2 pointer-events-auto">
                        <button onClick={() => togglePin(item.id)} className="p-3 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30" title="置顶"><Pin size={18} className={item.isPinned ? "fill-current" : ""} /></button>
                        <button onClick={() => toggleStatus(item.id)} className="p-3 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30" title={item.status === 'published' ? '下架' : '上架'}>{item.status === 'published' ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                        <button onClick={() => handleDownload(item)} className="p-3 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30" title="下载"><Download size={18} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-500/80 backdrop-blur rounded-full text-white hover:bg-red-500" title="删除"><Trash2 size={18} /></button>
                    </div>
                </div>
            </div>
            ))}
          </div>
          {loading && contents.length > 0 && (
             <div className="flex justify-center py-4 text-slate-400 text-sm">加载中...</div>
          )}
          {!loading && contents.length >= pagination.total && contents.length > 0 && (
             <div className="flex justify-center py-4 text-slate-300 text-xs">没有更多数据了</div>
          )}
          </>
        )}
      </div>
      
      <AntModal
        open={!!previewItem}
        footer={null}
        onCancel={() => setPreviewItem(null)}
        width={800}
        centered
        className="p-0 bg-transparent"
        styles={{ content: { padding: 0, background: 'transparent', boxShadow: 'none' } }}
      >
         {previewItem && (
             <div className="relative bg-black rounded-lg overflow-hidden flex justify-center items-center max-h-[80vh]">
                 {previewItem.type === 'video' ? (
                     <video src={previewItem.contentUrl} controls className="max-w-full max-h-[80vh]" autoPlay />
                 ) : (
                     <SecureImage src={previewItem.contentUrl} className="max-w-full max-h-[80vh] object-contain" />
                 )}
                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                    <h3 className="font-bold text-lg">{previewItem.title}</h3>
                    {previewItem.description && <p className="text-sm opacity-80 mt-1">{previewItem.description}</p>}
                 </div>
             </div>
         )}
      </AntModal>
    </div>
  );
};



const MarketingManagement = () => {
  const [activeSiteId, setActiveSiteId] = useState<SiteId>(SITES.MEDICAL); // 默认医美类（siteId=1）
  const [ads, setAds] = useState<MarketingAd[]>(MOCK_ADS);
  const [csModal, setCsModal] = useState(false);
  const [editAd, setEditAd] = useState<Partial<MarketingAd> | null>(null);
  const [csConfig, setCsConfig] = useState<customerServiceAPI.CustomerServiceConfig>({ siteId: activeSiteId, qrCodeUrl: '', contactText: '' });
  const [csUploading, setCsUploading] = useState(false); // 客服图片上传状态
  const [csSaving, setCsSaving] = useState(false);

  // 加载广告列表
  const loadAds = async () => {
    try {
      const data = await marketingAPI.getAds(activeSiteId);
      setAds(data);
    } catch (error) {
      console.error('加载广告列表失败:', error);
      // 如果API调用失败，使用Mock数据
      setAds(MOCK_ADS);
    }
  };

  // 加载客服配置
  const loadCsConfig = async () => {
    try {
      const config = await customerServiceAPI.getConfig(activeSiteId);
      if (config) {
        setCsConfig(config);
      } else {
        setCsConfig({ siteId: activeSiteId, qrCodeUrl: '', contactText: '' });
      }
    } catch (error) {
      console.error('加载客服配置失败:', error);
      setCsConfig({ siteId: activeSiteId, qrCodeUrl: '', contactText: '' });
    }
  };

  // 保存客服配置
  const saveCsConfig = async () => {
    if (!csConfig.qrCodeUrl) {
      message.warning('请上传客服二维码图片');
      return;
    }
    setCsSaving(true);
    try {
      await customerServiceAPI.saveConfig(activeSiteId, csConfig);
      message.success('客服配置保存成功');
      setCsModal(false);
    } catch (error) {
      console.error('保存客服配置失败:', error);
      message.error('保存失败');
    } finally {
      setCsSaving(false);
    }
  };

  // 当站点ID改变时重新加载广告和配置
  useEffect(() => {
    loadAds();
    loadCsConfig();
  }, [activeSiteId]);

  const filteredAds = ads.filter(ad => ad.siteId === activeSiteId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">营销管理</h2>
        <div className="flex gap-4">
          <button onClick={() => setCsModal(true)} className="px-4 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700"><Headphones size={16}/> 客服配置</button>
          <button onClick={() => setEditAd({ siteId: activeSiteId, position: 1 })} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-sm"><Plus size={16}/> 新增广告</button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border card-shadow h-[calc(100vh-140px)] flex flex-col">
          <div className="p-4 border-b"><CategoryTabs selected={activeSiteId} onSelect={setActiveSiteId} /></div>
          <div className="flex-1 overflow-auto p-6 space-y-4">
            {filteredAds.map(ad => (
                <div key={ad.id} className="border rounded-lg p-4 flex items-center gap-6 hover:bg-slate-50 transition-colors">
                <div className="w-32 h-16 bg-slate-100 rounded-md overflow-hidden shrink-0"><SecureImage src={ad.imageUrl} className="w-full h-full object-cover"/></div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800">{ad.title}</h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">广告位 {ad.position}</span>
                        {new Date(ad.endDate) < new Date() && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">过期</span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ad.summary || '暂无描述'}</p>
                </div>
                <div className="text-xs text-slate-500 text-right w-48">
                    <p className="font-medium text-slate-700">有效时间</p>
                    <p>{ad.startDate} ~ {ad.endDate}</p>
                </div>
                <button onClick={() => setEditAd(ad)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit size={16}/></button>
                </div>
            ))}
            {filteredAds.length === 0 && <div className="text-center py-20 text-slate-400">该站点暂无广告，请点击右上角新增</div>}
          </div>
      </div>

      <Modal isOpen={csModal} onClose={() => setCsModal(false)} title="客服信息配置" maskClosable={false}>
          <div className="space-y-5">
              <FormItem label="客服二维码图片">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer flex flex-col items-center justify-center text-slate-400 relative overflow-hidden group h-48">
                      {csConfig.qrCodeUrl ? (
                          <>
                            <SecureImage src={csConfig.qrCodeUrl} className="h-full object-contain" />
                            <p className="text-xs text-blue-600 mt-2">
                              {csUploading ? '上传中...' : '点击重新上传'}
                            </p>
                          </>
                      ) : (
                          <>
                            <Upload size={32} className="mb-2"/>
                            <span className="text-xs">{csUploading ? '上传中...' : '点击上传二维码图片'}</span>
                          </>
                      )}
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/webp"
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        disabled={csUploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // 检查文件大小（5MB）
                            if (file.size > 5 * 1024 * 1024) {
                              message.warning('图片大小不能超过 5MB');
                              return;
                            }
                            // 检查文件类型
                            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                            if (!validTypes.includes(file.type)) {
                              message.warning('只支持 JPG、PNG、WEBP 格式的图片');
                              return;
                            }
                            
                            // 先创建预览 URL
                            const previewUrl = URL.createObjectURL(file);
                            setCsConfig({...csConfig, qrCodeUrl: previewUrl});
                            
                            // 开始上传
                            setCsUploading(true);
                            try {
                              // 调用后端上传接口，上传到 images/ 文件夹
                              const uploadedUrl = await uploadAPI.uploadImage(file, 'images/');
                              // 使用服务器返回的URL替换预览URL
                              setCsConfig(prev => ({...prev, qrCodeUrl: uploadedUrl}));
                              // 释放预览URL
                              URL.revokeObjectURL(previewUrl);
                            } catch (error) {
                              // 上传失败，恢复原状态
                              console.error('图片上传失败:', error);
                              message.error('图片上传失败：' + (error instanceof Error ? error.message : '未知错误'));
                              setCsConfig(prev => ({...prev, qrCodeUrl: ''}));
                              // 释放预览URL
                              URL.revokeObjectURL(previewUrl);
                            } finally {
                              setCsUploading(false);
                            }
                          }
                        }}
                      />
                  </div>
              </FormItem>
              <FormItem label="联系方式文本">
                  <textarea 
                    className="w-full p-3 border rounded-lg h-24 resize-none outline-none focus:border-blue-500" 
                    placeholder="请输入联系方式文本说明..." 
                    value={csConfig.contactText || ''}
                    onChange={e => setCsConfig({...csConfig, contactText: e.target.value})}
                  />
              </FormItem>
              <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 transition-colors" disabled={csSaving} onClick={saveCsConfig}>{csSaving ? '保存中...' : '保存客服配置'}</button>
          </div>
      </Modal>

      {editAd && <AdEditorModal ad={editAd} existingAds={ads} onClose={() => setEditAd(null)} onSave={loadAds} />}
    </div>
  );
};

const AdEditorModal = ({ ad, existingAds = [], onClose, onSave }: { ad: Partial<MarketingAd>; existingAds?: MarketingAd[]; onClose: () => void; onSave?: () => void }) => {
  const [formData, setFormData] = useState(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    return {
      ...ad,
      startDate: ad.startDate || formatDate(today),
      endDate: ad.endDate || formatDate(nextWeek)
    };
  });
  const [activeTab, setActiveTab] = useState(ad.linkType || 'external');
  const fileInputRef = useRef<HTMLInputElement>(null); // 文件输入引用
  const [uploading, setUploading] = useState(false); // 上传状态
  const [saving, setSaving] = useState(false); // 保存状态
  
  // 当ad对象变化时，同步更新formData（避免状态不同步导致的闪退）
  // 使用关键字段作为依赖，避免对象引用变化导致的频繁更新
  useEffect(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    setFormData({
      ...ad,
      startDate: ad.startDate || formatDate(today),
      endDate: ad.endDate || formatDate(nextWeek)
    });
    setActiveTab(ad.linkType || 'external');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad?.id, ad?.title, ad?.imageUrl, ad?.linkType, ad?.siteId, ad?.position, ad?.startDate, ad?.endDate]); // 只在关键字段变化时更新

  // 保存广告
  const handleSave = async () => {
    // 验证必填字段
    if (!formData.title) {
      message.warning('请输入广告标题');
      return;
    }
    if (!formData.siteId) {
      message.warning('请选择所属站点');
      return;
    }
    if (!formData.position || formData.position < 1) {
      message.warning('请输入有效的广告位顺序（正整数，数字越小排序越靠前）');
      return;
    }
    if (!formData.imageUrl) {
      message.warning('请上传广告图片');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      message.warning('请选择开始时间和结束时间');
      return;
    }

    // 检查广告位是否重复
    const targetSiteId = formData.siteId || SITES.MEDICAL;
    // 只有当现有广告列表中包含目标站点的广告时，我们才能在前端进行有效验证
    // 如果列表为空或者包含的是其他站点的广告，则无法在前端验证（交由后端验证）
    const adsInSite = existingAds.filter(a => a.siteId === targetSiteId);
    if (adsInSite.length > 0) {
      const conflict = adsInSite.find(a => a.position === formData.position && a.id !== formData.id);
      if (conflict) {
        message.warning(`该站点广告位 ${formData.position} 已被占用，请修改`);
        return;
      }
    }

    // 同步activeTab到formData.linkType
    const finalData = {
      ...formData,
      linkType: activeTab,
      isFullScreen: true, // 全屏广告
      isActive: formData.isActive !== undefined ? formData.isActive : true, // 默认激活
    };

    setSaving(true);
    try {
      // 确保siteId存在
      const siteId = finalData.siteId || SITES.MEDICAL;
      if (ad.id) {
        // 更新广告
        await marketingAPI.updateAd(ad.id.toString(), siteId, finalData);
        message.success('广告更新成功');
      } else {
        // 创建广告
        await marketingAPI.createAd(siteId, finalData);
        message.success('广告创建成功');
      }
      // 刷新列表
      if (onSave) {
        onSave();
      }
      // 关闭弹窗
      onClose();
    } catch (error) {
      console.error('保存广告失败:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={ad.id ? "编辑全屏广告" : "新增全屏广告"} size="full" maskClosable={false}>
      <div className="flex flex-col lg:flex-row gap-8 h-full">
        {/* Left Panel: Config */}
        <div className="w-full lg:w-1/3 flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar">
          <FormItem label="广告标题" required><input type="text" className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-500 transition-colors" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></FormItem>
          
          <div className="grid grid-cols-2 gap-4">
              <FormItem label="所属站点" required>
                  <select 
                      className="w-full p-2.5 border rounded-lg bg-white outline-none focus:border-blue-500 transition-colors" 
                      value={formData.siteId || SITES.MEDICAL} 
                      onChange={e => setFormData({...formData, siteId: parseInt(e.target.value) as SiteId})}
                  >
                      <option value={SITES.MEDICAL}>医美类</option>
                      <option value={SITES.ECOMMERCE}>电商类</option>
                      <option value={SITES.LIFE}>生活服务类</option>
                  </select>
              </FormItem>
              <FormItem label="广告位顺序" required>
                  <input 
                      type="number" 
                      min="1" 
                      step="1"
                      className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-500 transition-colors" 
                      value={formData.position || 1} 
                      onChange={e => {
                          const value = parseInt(e.target.value);
                          // 只允许正整数
                          if (!isNaN(value) && value > 0) {
                              setFormData({...formData, position: value});
                          } else if (e.target.value === '') {
                              // 允许清空输入
                              setFormData({...formData, position: undefined});
                          }
                      }}
                      placeholder="数字越小排序越靠前"
                  />
                  <p className="text-xs text-slate-400 mt-1">数字越小排序越靠前（正整数）</p>
              </FormItem>
          </div>

          <FormItem label="广告图片 (全屏展示)">
            <div 
              className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center flex flex-col items-center justify-center text-sm text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all group relative overflow-hidden"
              onClick={() => fileInputRef.current?.click()} // 点击触发文件选择
            >
              {/* 隐藏的文件输入 */}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/jpeg,image/png,image/webp" 
                className="hidden" 
                disabled={uploading} // 上传中禁用
                onChange={async (e) => {
                  // 处理文件选择
                  const file = e.target.files?.[0];
                  if (file) {
                    // 检查文件大小（5MB = 5 * 1024 * 1024 字节）
                    if (file.size > 5 * 1024 * 1024) {
                      message.warning('图片大小不能超过 5MB');
                      return;
                    }
                    // 检查文件类型
                    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                    if (!validTypes.includes(file.type)) {
                      message.warning('只支持 JPG、PNG、WEBP 格式的图片');
                      return;
                    }
                    
                    // 先创建预览 URL（用于立即显示预览）
                    const previewUrl = URL.createObjectURL(file);
                    setFormData({...formData, imageUrl: previewUrl});
                    
                    // 开始上传
                    setUploading(true);
                    try {
                      // 调用后端上传接口，上传到 images/ 文件夹
                      const uploadedUrl = await uploadAPI.uploadImage(file, 'images/');
                      // 使用服务器返回的URL替换预览URL
                      setFormData({...formData, imageUrl: uploadedUrl});
                      // 释放预览URL
                      URL.revokeObjectURL(previewUrl);
                    } catch (error) {
                      // 上传失败，恢复原状态
                      console.error('图片上传失败:', error);
                      alert('图片上传失败：' + (error instanceof Error ? error.message : '未知错误'));
                      setFormData({...formData, imageUrl: ad.imageUrl || ''});
                      // 释放预览URL
                      URL.revokeObjectURL(previewUrl);
                    } finally {
                      setUploading(false);
                    }
                  }
                }}
              />
              {/* 如果已有图片，显示预览 */}
              {formData.imageUrl ? (
                <>
                  <SecureImage src={formData.imageUrl} alt="广告图片预览" className="max-w-full max-h-64 object-contain mb-2" />
                  <p className="text-xs text-blue-600 mt-2">
                    {uploading ? '上传中...' : '点击重新上传'}
                  </p>
                </>
              ) : (
                <>
                  <Upload size={32} className="mb-3 text-slate-300 group-hover:text-blue-500" />
                  <p>{uploading ? '上传中...' : '点击上传本地图片'}</p>
                  <p className="text-xs text-slate-400 mt-1">支持 JPG, PNG, WEBP (Max 5MB)</p>
                </>
              )}
            </div>
          </FormItem>

          <div className="grid grid-cols-2 gap-4">
            <FormItem label="开始时间"><input type="date" className="w-full p-2.5 border rounded-lg" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} /></FormItem>
            <FormItem label="结束时间"><input type="date" className="w-full p-2.5 border rounded-lg" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} /></FormItem>
          </div>

          <FormItem label="摘要描述"><textarea className="w-full p-2.5 border rounded-lg h-24 resize-none outline-none focus:border-blue-500" placeholder="请输入广告简要描述..." value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} /></FormItem>
          
          <FormItem label="跳转类型">
            <div className="flex bg-slate-100 p-1.5 rounded-lg">
              <button 
                onClick={() => {
                  setActiveTab('external');
                  setFormData({...formData, linkType: 'external'});
                }} 
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'external' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                外部网页
              </button>
              <button 
                onClick={() => {
                  setActiveTab('internal_rich');
                  setFormData({...formData, linkType: 'internal_rich'});
                }} 
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'internal_rich' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                富文本详情
              </button>
            </div>
          </FormItem>

          {activeTab === 'external' && <FormItem label="跳转链接"><input type="url" placeholder="https://" className="w-full p-2.5 border rounded-lg" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} /></FormItem>}
        </div>

        {/* Right Panel: Rich Text Editor */}
        <div className="w-full lg:w-2/3 border border-slate-200 rounded-xl flex flex-col overflow-hidden bg-white shadow-sm">
          <div className="px-5 py-3 border-b bg-slate-50/50"><label className="font-bold text-slate-700 text-sm flex items-center gap-2"><div className="w-1 h-4 bg-blue-600 rounded-full"></div> 文章详情内容</label></div>
          <div className="flex-1 bg-white relative flex flex-col overflow-hidden">
             {activeTab === 'external' && <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[1px] z-10 flex items-center justify-center text-slate-400 font-medium">外部跳转模式下无需编辑详情</div>}
             <ReactQuill 
                theme="snow"
                value={formData.richContent || ''} 
                onChange={(content) => setFormData({...formData, richContent: content})}
                className="h-full flex flex-col [&>.ql-container]:flex-1 [&>.ql-container]:overflow-auto"
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{'align': []}],
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                    ['link', 'image', 'code-block'],
                    ['clean']
                  ],
                }}
             />
          </div>
          <div className="p-4 border-t bg-white">
            <label className="text-xs font-bold text-slate-500 mb-2 block">关联标签</label>
            <div className="flex items-center gap-2 p-2 border rounded-lg focus-within:ring-2 ring-blue-100 transition-all">
                <div className="flex gap-1 flex-wrap">
                    {formData.tags?.map(t => <span key={t} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs flex items-center gap-1">{t} <X size={10} className="cursor-pointer hover:text-blue-800" onClick={() => setFormData({...formData, tags: formData.tags?.filter(tag => tag !== t)})} /></span>)}
                </div>
                <input 
                    type="text" 
                    className="flex-1 text-sm outline-none min-w-[100px]" 
                    placeholder="输入标签后按回车添加..." 
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.currentTarget.value.trim();
                            if (val && !formData.tags?.includes(val)) {
                                setFormData({ ...formData, tags: [...(formData.tags || []), val] });
                                e.currentTarget.value = '';
                            }
                        }
                    }}
                />
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t flex justify-end gap-4">
            <button 
              className="px-6 py-2 rounded-lg hover:bg-slate-200 text-slate-600 font-medium" 
              onClick={onClose}
              disabled={saving}
            >
              取消
            </button>
            <button 
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '保存中...' : '保存广告配置'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const MenuManagement = () => {
  const [activeSiteId, setActiveSiteId] = useState<SiteId>(SITES.MEDICAL); // 默认显示医美类（siteId=1）
  const [siteMenus, setSiteMenus] = useState<Record<number, MenuConfig[]>>({
    [SITES.MEDICAL]: [],
    [SITES.ECOMMERCE]: [],
    [SITES.LIFE]: [],
  });
  const [editMenu, setEditMenu] = useState<{siteId: SiteId, id: string, label: string, menuId: string} | null>(null);
  const [loading, setLoading] = useState(false);

  // 加载菜单列表
  const loadMenus = async (siteId: SiteId) => {
    try {
      setLoading(true);
      const menus = await menuAPI.getMenus(siteId);
      setSiteMenus(prev => ({
        ...prev,
        [siteId]: menus
      }));
    } catch (error) {
      console.error('加载菜单失败:', error);
      // 如果加载失败，使用默认菜单
      setSiteMenus(prev => ({
        ...prev,
        [siteId]: JSON.parse(JSON.stringify(STANDARD_MENUS))
      }));
    } finally {
      setLoading(false);
    }
  };

  // 当站点ID改变时加载菜单
  useEffect(() => {
    if (!siteMenus[activeSiteId] || siteMenus[activeSiteId].length === 0) {
      loadMenus(activeSiteId);
    }
  }, [activeSiteId]);

  const toggleMenu = async (siteId: SiteId, menu: MenuConfig) => {
    try {
      const updatedMenu = await menuAPI.updateMenu(menu.id.toString(), {
        isVisible: !menu.isVisible
      }, siteId);
      
      setSiteMenus(prev => ({
        ...prev,
        [siteId]: prev[siteId].map(m => m.id === menu.id ? { ...m, isVisible: updatedMenu.isVisible } : m)
      }));
    } catch (error) {
      console.error('更新菜单失败:', error);
      message.error('更新菜单失败，请重试');
    }
  };

  const updateMenuName = async () => {
    if (!editMenu) return;
    
    try {
      const updatedMenu = await menuAPI.updateMenu(editMenu.menuId, {
        label: editMenu.label
      }, editMenu.siteId);
      
      setSiteMenus(prev => ({
        ...prev,
        [editMenu.siteId]: prev[editMenu.siteId].map(m => m.id === editMenu.id ? {...m, label: updatedMenu.label} : m)
      }));
      setEditMenu(null);
    } catch (error) {
      console.error('更新菜单名称失败:', error);
      message.error('更新菜单名称失败，请重试');
    }
  };

  return (
    <div className="bg-white rounded-xl border card-shadow flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      <div className="p-6 border-b"><h3 className="text-xl font-bold text-slate-800">菜单管理</h3></div>
      <div className="p-4 border-b bg-slate-50/50"><CategoryTabs selected={activeSiteId} onSelect={setActiveSiteId} /></div>
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500">加载中...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(siteMenus[activeSiteId] || []).map(menu => (
              <div key={menu.id} className="p-4 border rounded-xl bg-white flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Layout size={18}/></div>
                  <span className="font-bold text-slate-700">{menu.label}</span>
                  <button onClick={() => setEditMenu({siteId: activeSiteId, id: menu.id, label: menu.label, menuId: menu.id.toString()})} className="text-slate-400 hover:text-blue-600 p-1"><Pencil size={14}/></button>
                </div>
                <ToggleSwitch enabled={menu.isVisible} onChange={() => toggleMenu(activeSiteId, menu)} />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {editMenu && (
          <Modal isOpen={true} onClose={() => setEditMenu(null)} title="修改菜单名称" size="md" maskClosable={false}>
              <div className="space-y-4">
                  <FormItem label="菜单名称">
                      <input className="w-full p-2 border rounded" value={editMenu.label} onChange={e => setEditMenu({...editMenu, label: e.target.value})} />
                  </FormItem>
                  <button onClick={updateMenuName} className="w-full py-2 bg-blue-600 text-white rounded font-bold">保存修改</button>
              </div>
          </Modal>
      )}
    </div>
  );
};

const ApiManagement = () => {
  const [activeSiteId, setActiveSiteId] = useState<SiteId>(SITES.MEDICAL); // 默认医美类（siteId=1）
  // 初始状态：显示所有7个分类（即使为空）
  const [categories, setCategories] = useState<ApiCategory[]>(() => 
    API_TYPES.map(type => ({
      id: type.id,
      name: type.name,
      icon: type.icon,
      description: type.description,
      platforms: []
    }))
  );
  const [loading, setLoading] = useState(false); // 加载状态
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, platform: ApiPlatform | null}>({isOpen: false, platform: null});

  // 加载API平台列表
  const loadPlatforms = async () => {
    setLoading(true);
    try {
      // 从后端获取平台列表（包含接口）
      const platforms = await apiPlatformAPI.getPlatforms(activeSiteId);
      
      // 转换为前端格式
      if (!platforms || !Array.isArray(platforms)) {
        console.warn('API返回的数据格式不正确:', platforms);
        const emptyCategoriesList: ApiCategory[] = API_TYPES.map(type => ({
          id: type.id,
          name: type.name,
          icon: type.icon,
          description: type.description,
          platforms: []
        }));
        setCategories(emptyCategoriesList);
        return;
      }
      
      const platformsWithInterfaces: ApiPlatform[] = platforms.map((platform) => {
        // 转换接口列表
        const interfaces: ApiInterface[] = (platform.interfaces || []).map((iface) => {
          // 解析headers和paramDocs
          let headers: {id: string, key: string, value: string}[] = [];
          let paramDocs: any[] = [];
          
          try {
            if (iface.headers) {
              const headersObj = JSON.parse(iface.headers);
              headers = Object.keys(headersObj).map((key, idx) => ({
                id: `h${idx}`,
                key: key,
                value: headersObj[key]
              }));
            }
          } catch (e) {
            console.warn('解析headers失败:', e);
          }
          
          try {
            if (iface.paramDocs) {
              paramDocs = JSON.parse(iface.paramDocs);
            }
          } catch (e) {
            console.warn('解析paramDocs失败:', e);
          }
          
          return {
            id: iface.id.toString(),
            url: iface.url,
            method: iface.method as 'GET' | 'POST',
            responseMode: iface.responseMode || 'JSON',
            headers: headers,
            parametersJSON: iface.parametersJson || '{}',
            paramDocs: paramDocs
          };
        });
        
        return {
          id: platform.id.toString(),
          name: platform.name,
          alias: platform.alias,
          apiKey: platform.apiKey || '',
          isEnabled: platform.isEnabled,
          description: platform.description,
          siteId: (() => {
            // 优先使用 siteId（数字类型）
            if (platform.siteId && typeof platform.siteId === 'number') {
              const id = platform.siteId;
              // 确保 siteId 是有效的值（1, 2, 3）
              if (id === SITES.MEDICAL || id === SITES.ECOMMERCE || id === SITES.LIFE) {
                return id as SiteId;
              }
            }
            // 向后兼容：从 site 字符串转换
            if (platform.site) {
              if (platform.site === 'medical') return SITES.MEDICAL;
              if (platform.site === 'ecommerce') return SITES.ECOMMERCE;
              if (platform.site === 'life') return SITES.LIFE;
            }
            return undefined;
          })(),
          nodeInfo: platform.nodeInfo,
          supportedModels: platform.supportedModels, // 支持的模型
          type: platform.type, // API类型
          interfaces: interfaces
        };
      });
      
      // 将平台按分类组织 - 按照API_TYPES的顺序
      // 根据platform.type字段进行分类，如果没有type字段则根据接口类型推断
      const categoryMap: Record<string, ApiPlatform[]> = {};
      
      // 初始化所有分类
      API_TYPES.forEach(type => {
        categoryMap[type.id] = [];
      });
      
      platformsWithInterfaces.forEach(platform => {
        // 优先使用platform.type字段
        let categoryId = platform.type;
        
        // 如果没有type字段，根据接口类型推断（向后兼容）
        if (!categoryId) {
          const genInterfaces = platform.interfaces.filter(i => i.responseMode !== 'Result');
          if (genInterfaces.length > 0) {
            const hasStream = genInterfaces.some(i => i.responseMode === 'Stream');
            // 根据接口特征推断类型（这里简化处理，实际应该根据接口URL或参数判断）
            categoryId = hasStream ? 'txt2video' : 'txt2img';
          } else {
            categoryId = 'txt2img'; // 默认
          }
        }
        
        // 如果分类存在，添加到对应分类
        if (categoryMap[categoryId]) {
          categoryMap[categoryId].push(platform);
        } else {
          // 如果类型不存在，默认放到文生图
          categoryMap['txt2img'].push(platform);
        }
      });
      
      // 按照API_TYPES的顺序构建分类列表
      const categoriesList: ApiCategory[] = API_TYPES.map(type => ({
        id: type.id,
        name: type.name,
        icon: type.icon,
        description: type.description,
        platforms: categoryMap[type.id] || []
      }));
      
      // 更新分类数据
      setCategories(categoriesList);
    } catch (error) {
      console.error('加载API平台列表失败:', error);
      // 如果API调用失败，仍然显示所有分类（空分类）
      const emptyCategoriesList: ApiCategory[] = API_TYPES.map(type => ({
        id: type.id,
        name: type.name,
        icon: type.icon,
        description: type.description,
        platforms: []
      }));
      setCategories(emptyCategoriesList);
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时和站点切换时重新加载
  useEffect(() => {
    loadPlatforms();
  }, [activeSiteId]);

  // 保存成功后的回调
  const handleSaveSuccess = () => {
    loadPlatforms(); // 重新加载列表
    setModalConfig({isOpen: false, platform: null}); // 关闭弹窗
  };

  // 删除平台
  const handleDelete = async (id: string) => {
    AntModal.confirm({
      title: '确认删除',
      content: '确认删除该API平台吗？删除后无法恢复！',
      onOk: async () => {
        try {
          // 调用删除API，传递当前选中的siteId
          await apiPlatformAPI.deletePlatform(Number(id), activeSiteId);
          message.success('删除成功');
          // 重新加载列表
          await loadPlatforms();
        } catch (err: any) {
          message.error('删除失败: ' + (err.message || '未知错误'));
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border card-shadow flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">API接口管理</h3>
          <button onClick={() => setModalConfig({isOpen: true, platform: null})} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-blue-700"><Plus size={16}/> 新增接口</button>
      </div>
      <div className="p-4 border-b bg-slate-50/50"><CategoryTabs selected={activeSiteId} onSelect={setActiveSiteId} /></div>
      <div className="flex-1 overflow-auto p-6 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">加载中...</div>
        ) : categories && categories.length > 0 ? (
          categories.map(cat => (
           <div key={cat.id} className="border rounded-xl overflow-hidden">
             <div className="bg-slate-50 p-3 border-b font-bold text-slate-700 flex items-center gap-2">
               <Layers size={16}/> {cat.name}
             </div>
             <div className="p-4 space-y-4">
                {cat.platforms.filter(p => !p.siteId || p.siteId === activeSiteId).map(plat => (
                  <div key={plat.id} className="flex flex-col border rounded-lg bg-white overflow-hidden">
                     <div className="flex items-center justify-between p-4 bg-slate-50/30 border-b">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-800">{plat.name}</span>
                            {plat.nodeInfo && <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{plat.nodeInfo}</span>}
                        </div>
                        <div className="flex items-center gap-4">
                            <StatusBadge status={plat.isEnabled ? 'active' : 'suspended'} />
                            <button onClick={() => setModalConfig({isOpen: true, platform: plat})} className="text-blue-600 text-sm font-medium hover:underline">配置</button>
                            <button onClick={() => handleDelete(plat.id)} className="text-red-600 text-sm font-medium hover:underline flex items-center gap-1">
                              <Trash2 size={14}/> 删除
                            </button>
                        </div>
                     </div>
                     <div className="p-0">
                        {plat.interfaces?.map((iface, idx) => (
                            <div key={iface.id} className={`p-3 flex items-center gap-3 text-sm ${idx !== 0 ? 'border-t border-slate-100' : ''}`}>
                                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${iface.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{iface.method}</span>
                                <span className="font-mono text-slate-600 truncate flex-1">{iface.url}</span>
                                <span className="text-xs text-slate-400">{iface.responseMode}</span>
                            </div>
                        ))}
                     </div>
                  </div>
                ))}
                {cat.platforms.filter(p => !p.siteId || p.siteId === activeSiteId).length === 0 && <div className="text-center text-slate-400 py-4 text-sm">该分类下暂无此站点的接口配置</div>}
             </div>
           </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-64 text-slate-400">暂无数据</div>
        )}
      </div>
      {modalConfig.isOpen && <ApiConfigModal platform={modalConfig.platform} activeSiteId={activeSiteId} onClose={() => setModalConfig({isOpen: false, platform: null})} onSave={handleSaveSuccess} />}
    </div>
  );
};

const ApiConfigModal = ({ platform, activeSiteId, onClose, onSave }: { platform: ApiPlatform | null, activeSiteId: SiteId, onClose: () => void, onSave?: () => void }) => {
    // 保存状态
    const [saving, setSaving] = useState(false); // 保存中状态
    
    // Basic Info State
    const [basicInfo, setBasicInfo] = useState({ 
        name: platform?.name || '', 
        alias: platform?.alias || '', 
        siteId: platform?.siteId || activeSiteId, // 编辑时使用platform的siteId，新增时使用当前选中的activeSiteId
        node: platform?.nodeInfo || 'overseas',
        apiKey: platform?.apiKey || '', // API密钥
        supportedModels: platform?.supportedModels || '', // 支持的模型（以#号分割的字符串）
        type: platform?.type || 'txt2img' // API类型，默认文生图
    });
    
    // Helper to generate unique ID
    const genId = () => Date.now() + Math.random().toString();

    // Helper: Create default KV or Text item
    const createItem = (type: 'text' | 'param') => ({ id: genId(), type, key: '', value: '' });

    // State for interfaces (Gen and Result)
    // We try to pre-fill from existing platform interfaces if available, otherwise default
    const existingGen = platform?.interfaces?.find(i => i.responseMode !== 'Result'); // Simplified assumption
    const existingRes = platform?.interfaces?.find(i => i.responseMode === 'Result'); // Simplified assumption

    // 从后端原始数据中获取headers JSON字符串
    // 注意：platform.interfaces中的headers已经被转换为数组，我们需要从API响应中获取原始数据
    // 但由于我们在loadPlatforms中已经转换了，所以需要重新从后端获取或者存储原始数据
    // 这里我们使用一个辅助函数来从platform的原始响应中获取
    const getHeadersJson = async (platformId?: string, interfaceId?: string): Promise<string> => {
        // 如果有平台ID，从后端获取原始数据
        if (platformId && interfaceId) {
            try {
                // 使用 activeSiteId 作为 fallback，因为在这里我们可能拿不到 platform 的 siteId
                // 但通常编辑时 activeSiteId 应该是一致的，或者我们需要从 props 传入 platformSiteId
                // 由于 getHeadersJson 是在内部调用的，我们可以访问 basicInfo.siteId
                const platformDetail = await apiPlatformAPI.getPlatform(parseInt(platformId), basicInfo.siteId || activeSiteId);
                const iface = platformDetail.interfaces?.find(i => i.id?.toString() === interfaceId);
                if (iface?.headers && typeof iface.headers === 'string') {
                    try {
                        const parsed = JSON.parse(iface.headers);
                        return JSON.stringify(parsed, null, 2);
                    } catch {
                        return iface.headers;
                    }
                }
            } catch (e) {
                console.warn('获取headers失败:', e);
            }
        }
        return '{}';
    };
    
    // 解析headers（JSON字符串格式化）
    const parseHeadersToJson = (headersJson?: string): string => {
        if (!headersJson) return '{}';
        if (typeof headersJson !== 'string') return '{}';
        try {
            const parsed = JSON.parse(headersJson);
            return JSON.stringify(parsed, null, 2); // 格式化JSON
        } catch {
            return headersJson; // 如果解析失败，返回原字符串
        }
    };
    
    // 从接口数组中获取headers JSON字符串（需要从原始响应中获取，这里先用空对象）
    // 实际应用中，应该在loadPlatforms时保留原始headers字符串，或者在这里重新获取
    const genHeadersJson = (() => {
        // 尝试从platform中获取原始headers
        // 由于loadPlatforms已经转换，我们需要重新获取或使用空对象
        // 在编辑模式下，应该重新从后端获取完整数据
        return '{}';
    })();
    
    const resHeadersJson = (() => {
        return '{}';
    })();
    
    const [genInterface, setGenInterface] = useState({ 
        url: existingGen?.url || '', 
        method: existingGen?.method || 'POST', 
        responseType: existingGen?.responseMode || 'JSON',
        headers: genHeadersJson, // 请求头JSON字符串，编辑时从后端获取
        // Mock items for demo (parsing existing params would go here in real app)
        items: [createItem('param')] 
    });
    
    const [resultInterface, setResultInterface] = useState({ 
        url: existingRes?.url || '', 
        method: existingRes?.method || 'GET', 
        responseType: existingRes?.responseMode || 'JSON',
        headers: resHeadersJson, // 请求头JSON字符串，编辑时从后端获取
        items: [createItem('param')] 
    });
    
    // 组件加载时，如果有platform ID，获取完整的headers和supportedModels数据
    useEffect(() => {
        if (platform?.id) {
            apiPlatformAPI.getPlatform(parseInt(String(platform.id)), platform.siteId || activeSiteId).then(platformDetail => {
                const genIf = platformDetail.interfaces?.find(i => i.responseMode !== 'Result');
                const resIf = platformDetail.interfaces?.find(i => i.responseMode === 'Result');
                
                // 加载请求头
                if (genIf?.headers && typeof genIf.headers === 'string') {
                    setGenInterface(prev => ({ ...prev, headers: parseHeadersToJson(genIf.headers) }));
                }
                if (resIf?.headers && typeof resIf.headers === 'string') {
                    setResultInterface(prev => ({ ...prev, headers: parseHeadersToJson(resIf.headers) }));
                }
                
                // 加载支持的模型、API密钥和类型
                // 如果apiKey是占位符，则设置为空字符串（前端显示为空，用户需要重新输入）
                const apiKeyValue = platformDetail.apiKey && platformDetail.apiKey !== '***已设置***' 
                    ? platformDetail.apiKey 
                    : '';
                setBasicInfo(prev => ({ 
                    ...prev, 
                    supportedModels: platformDetail.supportedModels || '',
                    apiKey: apiKeyValue,
                    type: platformDetail.type || 'txt2img',
                    siteId: platformDetail.siteId || activeSiteId // 确保siteId有值
                }));
            }).catch(e => {
                console.warn('获取平台详情失败:', e);
            });
        }
    }, [platform?.id]); // 只在platform?.id变化时重新加载数据
    
    // 保存配置
    const handleSave = async () => {
        // 验证必填字段
        if (!basicInfo.name.trim()) {
            message.warning('请输入平台名称');
            return;
        }
        if (!basicInfo.type) {
            message.warning('请选择接口类型');
            return;
        }
        if (!basicInfo.siteId) {
            message.warning('请选择所属站点');
            return;
        }
        if (!genInterface.url.trim()) {
            message.warning('请输入图片/视频生成接口URL');
            return;
        }
        
        setSaving(true);
        try {
            // 将items转换为参数配置JSON
            const genParams: Record<string, any> = {};
            const genTexts: string[] = [];
            genInterface.items.forEach(item => {
                if (item.type === 'param' && item.key) {
                    genParams[item.key] = item.value || '';
                } else if (item.type === 'text' && item.key) {
                    genTexts.push(item.key);
                }
            });
            
            const resultParams: Record<string, any> = {};
            const resultTexts: string[] = [];
            resultInterface.items.forEach(item => {
                if (item.type === 'param' && item.key) {
                    resultParams[item.key] = item.value || '';
                } else if (item.type === 'text' && item.key) {
                    resultTexts.push(item.key);
                }
            });
            
            // 构建接口列表
            const interfaces: apiPlatformAPI.ApiInterfaceRequest[] = [];
            
            // 解析请求头JSON
            let genHeadersJson = '{}';
            try {
                JSON.parse(genInterface.headers); // 验证JSON格式
                genHeadersJson = genInterface.headers;
            } catch (e) {
                message.warning('生成接口的请求头JSON格式错误，将使用空对象');
            }
            
            let resultHeadersJson = '{}';
            try {
                JSON.parse(resultInterface.headers); // 验证JSON格式
                resultHeadersJson = resultInterface.headers;
            } catch (e) {
                message.warning('结果接口的请求头JSON格式错误，将使用空对象');
            }
            
            // 生成接口
            if (genInterface.url.trim()) {
                interfaces.push({
                    url: genInterface.url.trim(),
                    method: genInterface.method,
                    responseMode: genInterface.responseType,
                    parametersJson: JSON.stringify(genParams),
                    headers: genHeadersJson, // 使用配置的请求头
                    paramDocs: JSON.stringify(genTexts)
                });
            }
            
            // 结果接口
            if (resultInterface.url.trim()) {
                interfaces.push({
                    url: resultInterface.url.trim(),
                    method: resultInterface.method,
                    responseMode: resultInterface.responseType === 'Result' ? 'Result' : 'JSON',
                    parametersJson: JSON.stringify(resultParams),
                    headers: resultHeadersJson, // 使用配置的请求头
                    paramDocs: JSON.stringify(resultTexts)
                });
            }
            
            // 构建请求数据
            // 如果apiKey为空或未修改，则不发送apiKey字段（保持原有值）
            const request: apiPlatformAPI.ApiPlatformRequest = {
                name: basicInfo.name.trim(),
                alias: basicInfo.alias.trim() || undefined,
                siteId: basicInfo.siteId,
                nodeInfo: basicInfo.node,
                isEnabled: true,
                // 只有当前端输入了新的apiKey时才发送（空字符串不发送，保持原有值）
                apiKey: basicInfo.apiKey.trim() || undefined, // API密钥
                supportedModels: basicInfo.supportedModels.trim() || undefined, // 支持的模型（以#号分割的字符串）
                type: basicInfo.type, // API类型
                interfaces: interfaces
            };
            
            // 调用API
            if (platform?.id) {
                // 更新
                // 注意：这里必须传入原始的siteId (platform.siteId) 用于定位资源，
                // 而 request 中包含的是可能修改后的新 siteId
                const originalSiteId = platform.siteId || activeSiteId;
                await apiPlatformAPI.updatePlatform(parseInt(String(platform.id)), request, originalSiteId);
                message.success('更新成功');
            } else {
                // 创建
                await apiPlatformAPI.createPlatform(request);
                message.success('创建成功');
            }
            
            // 调用保存成功回调（会刷新列表并关闭弹窗）
            if (onSave) {
                onSave();
            } else {
                // 如果没有回调，只关闭弹窗
                onClose();
            }
        } catch (err: any) {
            console.error('保存失败:', err);
            // message.error已在api/index.ts中处理，此处不再重复显示
        } finally {
            setSaving(false);
        }
    };

    // Helper component for configurable list
    const ConfigList = ({ items, setItems, title }: { items: any[], setItems: any, title: string }) => (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase">{title}</span>
                <div className="flex gap-2">
                    <button onClick={() => setItems([...items, createItem('text')])} className="text-xs px-2 py-1 bg-white border rounded text-slate-600 hover:text-blue-600 flex items-center gap-1"><Plus size={12}/> 添加文本</button>
                    <button onClick={() => setItems([...items, createItem('param')])} className="text-xs px-2 py-1 bg-white border rounded text-slate-600 hover:text-blue-600 flex items-center gap-1"><Plus size={12}/> 添加参数</button>
                </div>
            </div>
            {items.length === 0 && <div className="text-center text-xs text-slate-400 py-2">暂无配置项</div>}
            <div className="space-y-2">
                {items.map((item, idx) => (
                    <div key={item.id} className="flex gap-2 items-center">
                        <div className={`px-2 py-1 text-[10px] rounded font-bold w-12 text-center shrink-0 ${item.type === 'text' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                            {item.type === 'text' ? 'TEXT' : 'PARAM'}
                        </div>
                        {item.type === 'text' ? (
                             <input className="flex-1 p-1.5 border rounded text-xs" placeholder="文本内容 / 描述" value={item.key} onChange={e => { const n = [...items]; n[idx].key = e.target.value; setItems(n); }} />
                        ) : (
                            <>
                                <input className="w-1/3 p-1.5 border rounded text-xs" placeholder="Key (参数名)" value={item.key} onChange={e => { const n = [...items]; n[idx].key = e.target.value; setItems(n); }} />
                                <input className="flex-1 p-1.5 border rounded text-xs" placeholder="Value (默认值)" value={item.value} onChange={e => { const n = [...items]; n[idx].value = e.target.value; setItems(n); }} />
                            </>
                        )}
                        <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 p-1"><X size={14}/></button>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <Modal isOpen={true} onClose={onClose} title={platform ? "编辑 API 接口配置" : "新增 API 接口平台"} size="lg" maskClosable={false}>
            <div className="space-y-8">
                {/* Section 1: Basic Info */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="bg-blue-100 text-blue-600 p-1.5 rounded"><Server size={16}/></div>
                        <h4 className="font-bold text-slate-700">1. 基础信息配置</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormItem label="平台名称" required><input className="w-full p-2 border rounded" placeholder="例如: Midjourney" value={basicInfo.name} onChange={e => setBasicInfo({...basicInfo, name: e.target.value})} /></FormItem>
                        <FormItem label="别名 (Alias)"><input className="w-full p-2 border rounded" placeholder="例如: MJ-V6" value={basicInfo.alias} onChange={e => setBasicInfo({...basicInfo, alias: e.target.value})} /></FormItem>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormItem label="所属站点">
                            <select 
                                className="w-full p-2 border rounded disabled:bg-slate-100 disabled:text-slate-500" 
                                value={basicInfo.siteId} 
                                onChange={e => setBasicInfo({...basicInfo, siteId: parseInt(e.target.value) as SiteId})}
                                disabled={!!platform}
                            >
                                <option value={SITES.MEDICAL}>医美类</option><option value={SITES.ECOMMERCE}>电商类</option><option value={SITES.LIFE}>生活服务类</option>
                            </select>
                            {!!platform && <p className="text-xs text-amber-500 mt-1">所属站点不可修改，如需变更请删除后重新创建</p>}
                        </FormItem>
                        <FormItem label="节点信息">
                            <select className="w-full p-2 border rounded" value={basicInfo.node} onChange={e => setBasicInfo({...basicInfo, node: e.target.value})}>
                                <option value="overseas">海外节点</option><option value="domestic">国内直连</option><option value="host">Host + 接口</option>
                            </select>
                        </FormItem>
                    </div>
                    <FormItem label="接口类型" required>
                        <select className="w-full p-2 border rounded" value={basicInfo.type} onChange={e => setBasicInfo({...basicInfo, type: e.target.value})}>
                            {API_TYPES.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">选择该接口的类型，用于分类管理</p>
                    </FormItem>
                    <FormItem label="API密钥">
                        <input 
                            className="w-full p-2 border rounded" 
                            placeholder={platform?.apiKey === '***已设置***' || (platform?.apiKey && platform.apiKey !== '') ? '已设置，留空则不修改，输入新值则更新' : '例如: sk-xxxx-xxxx-xxxx'}
                            value={basicInfo.apiKey}
                            onChange={e => setBasicInfo({...basicInfo, apiKey: e.target.value})}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            {platform?.apiKey === '***已设置***' || (platform?.apiKey && platform.apiKey !== '') 
                                ? 'API密钥已设置，留空则不修改，输入新值则更新' 
                                : '输入API密钥，用于接口认证'}
                        </p>
                    </FormItem>
                    <FormItem label="支持的模型">
                        <ModelManager 
                            value={basicInfo.supportedModels}
                            onChange={val => setBasicInfo({...basicInfo, supportedModels: val})}
                        />
                        <p className="text-xs text-slate-500 mt-1">配置模型列表及其支持的分辨率、算力消耗等信息</p>
                    </FormItem>
                </div>

                {/* Section 2: Generation Interface */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="bg-purple-100 text-purple-600 p-1.5 rounded"><Zap size={16}/></div>
                        <h4 className="font-bold text-slate-700">2. 图片/视频生成接口</h4>
                    </div>
                    <div className="flex gap-2">
                        <select className="w-24 p-2 border rounded bg-white font-mono text-sm" value={genInterface.method} onChange={e => setGenInterface({...genInterface, method: e.target.value})}><option>POST</option><option>GET</option></select>
                        <input className="flex-1 p-2 border rounded font-mono text-sm" placeholder="https://api.example.com/v1/generate" value={genInterface.url} onChange={e => setGenInterface({...genInterface, url: e.target.value})} />
                    </div>
                    <FormItem label="请求头配置（JSON格式）">
                        <textarea 
                            className="w-full p-2 border rounded font-mono text-sm" 
                            placeholder='例如: {"Authorization": "Bearer {apiKey}", "Content-Type": "application/json"}'
                            rows={4}
                            value={genInterface.headers}
                            onChange={e => setGenInterface({...genInterface, headers: e.target.value})}
                        />
                        <p className="text-xs text-slate-500 mt-1">输入JSON格式的请求头，可使用{'{apiKey}'}占位符</p>
                    </FormItem>
                    <ConfigList items={genInterface.items} setItems={(i: any) => setGenInterface({...genInterface, items: i})} title="请求配置 (文本 / 参数)" />
                </div>

                {/* Section 3: Result Interface */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="bg-green-100 text-green-600 p-1.5 rounded"><Download size={16}/></div>
                        <h4 className="font-bold text-slate-700">3. 获取结果接口 (Query/Webhook)</h4>
                    </div>
                    <div className="flex gap-2">
                        <select className="w-24 p-2 border rounded bg-white font-mono text-sm" value={resultInterface.method} onChange={e => setResultInterface({...resultInterface, method: e.target.value})}><option>GET</option><option>POST</option></select>
                        <input className="flex-1 p-2 border rounded font-mono text-sm" placeholder="https://api.example.com/v1/tasks/{id}" value={resultInterface.url} onChange={e => setResultInterface({...resultInterface, url: e.target.value})} />
                    </div>
                    <FormItem label="请求头配置（JSON格式）">
                        <textarea 
                            className="w-full p-2 border rounded font-mono text-sm" 
                            placeholder='例如: {"Authorization": "Bearer {apiKey}"}'
                            rows={4}
                            value={resultInterface.headers}
                            onChange={e => setResultInterface({...resultInterface, headers: e.target.value})}
                        />
                        <p className="text-xs text-slate-500 mt-1">输入JSON格式的请求头，可使用{'{apiKey}'}占位符</p>
                    </FormItem>
                    <ConfigList items={resultInterface.items} setItems={(i: any) => setResultInterface({...resultInterface, items: i})} title="查询配置 (文本 / 参数)" />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                    <button onClick={onClose} disabled={saving} className="px-6 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed">取消</button>
                    <button onClick={handleSave} disabled={saving} className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {saving ? '保存中...' : '保存全部配置'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const PaymentManagement = () => {
  const [activeSiteId, setActiveSiteId] = useState<SiteId>(SITES.MEDICAL); // 默认医美类（siteId=1）
  const [modal, setModal] = useState<{ isOpen: boolean, channel: string | null }>({ isOpen: false, channel: null });
  const [paymentConfigs, setPaymentConfigs] = useState<Record<string, paymentAPI.PaymentConfig>>({});
  const [loading, setLoading] = useState(false);

  // 支付类型映射
  const paymentTypeMap: Record<string, string> = {
    '微信支付': 'wechat',
    '支付宝支付': 'alipay',
    '对公转账': 'bank_transfer'
  };

  const paymentTypeReverseMap: Record<string, string> = {
    'wechat': '微信支付',
    'alipay': '支付宝支付',
    'bank_transfer': '对公转账'
  };

  // 加载支付配置
  const loadPaymentConfigs = async (siteId: SiteId) => {
    try {
      setLoading(true);
      const configs = await paymentAPI.getPaymentConfigs(siteId);
      // 转换为以paymentType为key的对象
      const configMap: Record<string, paymentAPI.PaymentConfig> = {};
      configs.forEach(config => {
        configMap[config.paymentType] = config;
      });
      setPaymentConfigs(configMap);
    } catch (error) {
      console.error('加载支付配置失败:', error);
      // 初始化空的配置映射
      setPaymentConfigs({});
    } finally {
      setLoading(false);
    }
  };

  // 当站点ID改变时加载支付配置
  useEffect(() => {
    loadPaymentConfigs(activeSiteId);
  }, [activeSiteId]);

  // 切换支付方式的启用状态
  const toggleChannel = async (ch: string) => {
    const paymentType = paymentTypeMap[ch];
    if (!paymentType) {
      message.error('无效的支付方式');
      return;
    }

    const currentConfig = paymentConfigs[paymentType];
    const newEnabled = !currentConfig?.isEnabled;

    try {
      const updated = await paymentAPI.updatePaymentConfigStatus(paymentType, activeSiteId, newEnabled);
      // 更新本地状态
      setPaymentConfigs(prev => ({
        ...prev,
        [paymentType]: updated
      }));
    } catch (error) {
      console.error('更新支付配置失败:', error);
      message.error('更新支付配置失败，请重试');
    }
  };

  // 获取支付方式的启用状态
  const getChannelEnabled = (ch: string): boolean => {
    const paymentType = paymentTypeMap[ch];
    return paymentConfigs[paymentType]?.isEnabled || false;
  };

  return (
    <div className="bg-white rounded-xl border card-shadow flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">支付管理</h2>
      </div>
      <div className="p-4 border-b bg-slate-50/50">
        <CategoryTabs selected={activeSiteId} onSelect={setActiveSiteId} />
      </div>
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">加载中...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['微信支付', '支付宝支付', '对公转账'].map(ch => (
              <div key={ch} className="bg-white p-6 rounded-xl border card-shadow transition-shadow hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-lg">{ch}</h4>
                    <ToggleSwitch enabled={getChannelEnabled(ch)} onChange={() => toggleChannel(ch)} />
                </div>
                <p className="text-xs text-slate-400 mt-2 min-h-[40px]">配置{ch}的相关商户参数及密钥证书，支持文本直接输入。</p>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <StatusBadge status={getChannelEnabled(ch) ? 'active' : 'suspended'} />
                    <button onClick={() => setModal({ isOpen: true, channel: ch })} className="text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100">配置参数</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {modal.isOpen && (
        <PaymentConfigModal 
          channel={modal.channel} 
          activeSiteId={activeSiteId}
          paymentConfigs={paymentConfigs}
          onClose={() => setModal({ isOpen: false, channel: null })} 
          onSave={() => {
            loadPaymentConfigs(activeSiteId);
            setModal({ isOpen: false, channel: null });
          }} 
        />
      )}
    </div>
  );
};

// 支付配置弹窗组件
const PaymentConfigModal = ({ 
  channel, 
  activeSiteId, 
  paymentConfigs,
  onClose, 
  onSave 
}: { 
  channel: string | null; 
  activeSiteId: SiteId;
  paymentConfigs: Record<string, paymentAPI.PaymentConfig>;
  onClose: () => void; 
  onSave: () => void;
}) => {
  const [saving, setSaving] = useState(false);
  
  // 支付类型映射
  const paymentTypeMap: Record<string, string> = {
    '微信支付': 'wechat',
    '支付宝支付': 'alipay',
    '对公转账': 'bank_transfer'
  };
  
  // 获取当前配置
  const paymentType = channel ? paymentTypeMap[channel] : '';
  const currentConfig = paymentType ? paymentConfigs[paymentType] : null;
  
  // 表单状态
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  // 初始化表单数据
  useEffect(() => {
    if (currentConfig?.configJson) {
      try {
        const config = JSON.parse(currentConfig.configJson);
        setFormData(config);
      } catch (e) {
        setFormData({});
      }
    } else {
      setFormData({});
    }
  }, [currentConfig]);
  
  // 保存配置
  const handleSave = async () => {
    if (!paymentType || !channel) {
      message.error('无效的支付方式');
      return;
    }
    
    setSaving(true);
    try {
      // 将表单数据序列化为JSON
      const configJson = JSON.stringify(formData);
      
      // 调用API保存配置（创建或更新）
      await paymentAPI.createOrUpdatePaymentConfig(paymentType, activeSiteId, {
        configJson: configJson,
        isEnabled: currentConfig?.isEnabled || false
      });
      
      message.success('保存成功');
      onSave();
    } catch (error) {
      console.error('保存支付配置失败:', error);
      message.error('保存失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setSaving(false);
    }
  };
  
  if (!channel) return null;
  
  return (
    <Modal isOpen={true} onClose={onClose} title={`配置${channel}`} maskClosable={false}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-4 border border-blue-100">请直接粘贴证书内容或密钥字符串，无需上传文件。</div>
        {channel === '微信支付' && <>
          <div className="grid grid-cols-2 gap-4">
            <FormItem label="APPID">
              <input 
                className="w-full p-2 border rounded" 
                value={formData.appId || ''}
                onChange={e => setFormData({...formData, appId: e.target.value})}
              />
            </FormItem>
            <FormItem label="商户号 (mchId)">
              <input 
                className="w-full p-2 border rounded" 
                value={formData.mchId || ''}
                onChange={e => setFormData({...formData, mchId: e.target.value})}
              />
            </FormItem>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormItem label="API V3密钥">
              <input 
                className="w-full p-2 border rounded" 
                type="password"
                placeholder="已加密，如需修改请直接输入"
                value={formData.apiV3Key || ''}
                onChange={e => setFormData({...formData, apiV3Key: e.target.value})}
              />
            </FormItem>
            <FormItem label="证书序列号">
              <input 
                className="w-full p-2 border rounded" 
                value={formData.certSerialNo || ''}
                onChange={e => setFormData({...formData, certSerialNo: e.target.value})}
              />
            </FormItem>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormItem label="平台公钥ID">
              <input 
                className="w-full p-2 border rounded" 
                value={formData.wechatPayPublicKeyId || ''}
                onChange={e => setFormData({...formData, wechatPayPublicKeyId: e.target.value})}
              />
            </FormItem>
            <FormItem label="平台公钥 (PEM)">
              <textarea 
                className="w-full p-2 border rounded h-24 font-mono text-xs" 
                placeholder="已加密，如需修改请直接输入"
                value={formData.wechatPayPublicKey || ''}
                onChange={e => setFormData({...formData, wechatPayPublicKey: e.target.value})}
              />
            </FormItem>
          </div>
          <FormItem label="回调地址 (Notify URL)">
             <input 
               className="w-full p-2 border rounded" 
               placeholder="例如：http://your-domain.com/api/app/recharge/callback/wechat"
               value={formData.notifyUrl || ''}
               onChange={e => setFormData({...formData, notifyUrl: e.target.value})}
             />
             <p className="text-xs text-slate-400 mt-1">接收微信支付结果通知的完整URL</p>
          </FormItem>
          <FormItem label="API证书内容 (PEM)">
            <textarea 
              className="w-full p-2 border rounded h-24 font-mono text-xs" 
              placeholder="-----BEGIN CERTIFICATE-----..."
              value={formData.certContent || ''}
              onChange={e => setFormData({...formData, certContent: e.target.value})}
            />
          </FormItem>
          <FormItem label="API私钥内容 (PEM)">
            <textarea 
              className="w-full p-2 border rounded h-24 font-mono text-xs" 
              placeholder="-----BEGIN PRIVATE KEY-----..."
              value={formData.privateKey || ''}
              onChange={e => setFormData({...formData, privateKey: e.target.value})}
            />
          </FormItem>
        </>}
        {channel === '支付宝支付' && <>
          <div className="grid grid-cols-2 gap-4">
            <FormItem label="应用APPID">
              <input 
                className="w-full p-2 border rounded" 
                value={formData.appId || ''}
                onChange={e => setFormData({...formData, appId: e.target.value})}
              />
            </FormItem>
            <FormItem label="签名类型">
              <input 
                className="w-full p-2 border rounded" 
                placeholder="RSA2"
                value={formData.signType || ''}
                onChange={e => setFormData({...formData, signType: e.target.value})}
              />
            </FormItem>
          </div>
          <FormItem label="网关地址">
             <input 
                className="w-full p-2 border rounded" 
                placeholder="https://openapi.alipay.com/gateway.do"
                value={formData.gatewayUrl || ''}
                onChange={e => setFormData({...formData, gatewayUrl: e.target.value})}
              />
          </FormItem>
          <FormItem label="回调地址 (Notify URL)">
             <input 
               className="w-full p-2 border rounded" 
               placeholder="例如：http://your-domain.com/api/app/recharge/callback/alipay"
               value={formData.notifyUrl || ''}
               onChange={e => setFormData({...formData, notifyUrl: e.target.value})}
             />
             <p className="text-xs text-slate-400 mt-1">接收支付宝支付结果通知的完整URL</p>
          </FormItem>
          <FormItem label="应用私钥">
            <textarea 
              className="w-full p-2 border rounded h-24 font-mono text-xs"
              placeholder="已加密，如需修改请直接输入"
              value={formData.privateKey || ''}
              onChange={e => setFormData({...formData, privateKey: e.target.value})}
            />
          </FormItem>
          <FormItem label="支付宝公钥">
            <textarea 
              className="w-full p-2 border rounded h-24 font-mono text-xs"
              placeholder="已加密，如需修改请直接输入"
              value={formData.alipayPublicKey || ''}
              onChange={e => setFormData({...formData, alipayPublicKey: e.target.value})}
            />
          </FormItem>
          <FormItem label="应用公钥证书">
            <textarea 
              className="w-full p-2 border rounded h-24 font-mono text-xs"
              placeholder="-----BEGIN CERTIFICATE-----..."
              value={formData.appCertContent || ''}
              onChange={e => setFormData({...formData, appCertContent: e.target.value})}
            />
          </FormItem>
          <FormItem label="支付宝根证书">
            <textarea 
              className="w-full p-2 border rounded h-24 font-mono text-xs"
              placeholder="-----BEGIN CERTIFICATE-----..."
              value={formData.alipayRootCertContent || ''}
              onChange={e => setFormData({...formData, alipayRootCertContent: e.target.value})}
            />
          </FormItem>
          <FormItem label="支付宝证书">
            <textarea 
              className="w-full p-2 border rounded h-24 font-mono text-xs"
              placeholder="-----BEGIN CERTIFICATE-----..."
              value={formData.alipayCertContent || ''}
              onChange={e => setFormData({...formData, alipayCertContent: e.target.value})}
            />
          </FormItem>
        </>}
        {channel === '对公转账' && <>
          <FormItem label="开户银行">
            <input 
              className="w-full p-2 border rounded" 
              value={formData.bankName || ''}
              onChange={e => setFormData({...formData, bankName: e.target.value})}
            />
          </FormItem>
          <FormItem label="银行账号">
            <input 
              className="w-full p-2 border rounded" 
              value={formData.bankAccount || ''}
              onChange={e => setFormData({...formData, bankAccount: e.target.value})}
            />
          </FormItem>
          <FormItem label="账户名称">
            <input 
              className="w-full p-2 border rounded" 
              value={formData.accountName || ''}
              onChange={e => setFormData({...formData, accountName: e.target.value})}
            />
          </FormItem>
        </>}
        <div className="pt-2">
          <button 
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const GenerationRecords = () => {
  const [activeSiteId, setActiveSiteId] = useState<SiteId>(SITES.MEDICAL); // 默认显示医美类（siteId=1）
  const [records, setRecords] = useState<GenerationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewRecord, setViewRecord] = useState<GenerationRecord | null>(null);
  
  // 加载生成记录
  const loadRecords = async (siteId: SiteId) => {
    setLoading(true);
    try {
      const data = await generationAPI.getGenerationRecords(siteId);
      setRecords(data);
    } catch (err: any) {
      console.error('加载记录失败:', err);
      message.error('加载记录失败: ' + (err.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };
  
  // 当站点ID改变时加载记录
  useEffect(() => {
    loadRecords(activeSiteId);
  }, [activeSiteId]);
  
  return (
    <div className="bg-white rounded-xl border card-shadow h-[calc(100vh-140px)] flex flex-col animate-fade-in">
      <div className="p-6 border-b flex justify-between items-center"><h3 className="font-bold text-xl">用户生成记录</h3></div>
      <div className="p-4 border-b bg-slate-50/50"><CategoryTabs selected={activeSiteId} onSelect={setActiveSiteId} /></div>
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">加载中...</div>
        ) : records.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400">暂无数据</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b"><tr><th className="px-6 py-3">时间</th><th className="px-6 py-3">用户</th><th className="px-6 py-3">类型</th><th className="px-6 py-3">模型</th><th className="px-6 py-3">状态</th><th className="px-6 py-3 text-right">操作</th></tr></thead>
            <tbody>{records.map(r => <tr key={r.id} className="border-b hover:bg-slate-50">
               <td className="px-6 py-4">{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
               <td className="px-6 py-4">{r.username}</td>
               <td className="px-6 py-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">{r.type}</span></td>
               <td className="px-6 py-4">{r.model}</td>
               <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
               <td className="px-6 py-4 text-right"><button onClick={() => setViewRecord(r)} className="text-blue-600 font-medium text-xs border border-blue-200 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100">查看内容</button></td>
            </tr>)}</tbody>
          </table>
        )}
      </div>
      <Modal isOpen={!!viewRecord} onClose={() => setViewRecord(null)} title="查看生成内容">
        <div className="space-y-4">
          <div className="bg-black rounded-xl overflow-hidden flex items-center justify-center min-h-[300px]">
             {viewRecord?.type.includes('video') ? <video src={viewRecord?.contentUrl} controls className="max-w-full max-h-[60vh]" /> : 
              viewRecord?.type.includes('voice') ? <audio src={viewRecord?.contentUrl} controls className="w-full p-10" /> :
              <img src={viewRecord?.contentUrl} className="max-w-full max-h-[60vh]" />}
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
             <div className="text-xs font-bold text-slate-400 uppercase mb-1">提示词</div>
             <p className="text-sm text-slate-700">{viewRecord?.prompt}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const InvitationManagement = () => {
  const [activeSiteId, setActiveSiteId] = useState<SiteId>(SITES.MEDICAL); // 默认医美类（siteId=1）
  const [codes, setCodes] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  
  // 筛选条件
  const [filters, setFilters] = useState({
    code: '',
    channel: '',
    status: ''
  });

  const [generateModal, setGenerateModal] = useState(false);
  const [editModal, setEditModal] = useState<{isOpen: boolean, code: InvitationCode | null}>({isOpen: false, code: null});
  
  const [form, setForm] = useState({ 
      count: 1, 
      points: 100, 
      maxUses: 1, 
      validStartDate: new Date().toISOString().split('T')[0], 
      validEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      channel: ''
  });

  const loadCodes = async (
    page = pagination.current, 
    size = pagination.pageSize,
    overrideFilters?: typeof filters
  ) => {
    setLoading(true);
    const currentFilters = overrideFilters || filters;
    try {
      // 使用 any 类型接收数据，以兼容旧接口（数组）和新接口（分页对象）
      const data: any = await invitationAPI.getInvitations(
        page, 
        size, 
        activeSiteId,
        currentFilters.code,
        currentFilters.channel,
        currentFilters.status
      );
      
      // 兼容处理
      if (Array.isArray(data)) {
        setCodes(data);
        setTotal(data.length);
      } else if (data && data.records) {
        setCodes(data.records);
        setTotal(data.total);
      } else {
        setCodes([]);
        setTotal(0);
      }
      
      setPagination({ current: page, pageSize: size });
    } catch (err: any) {
      console.error('加载邀请码失败:', err);
      message.error('加载邀请码失败: ' + (err.message || '未知错误'));
      setCodes([]); // 出错时置空，防止页面崩溃
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadCodes(1, pagination.pageSize); 
  }, [activeSiteId]); // siteId 变化时重置到第一页

  const handleSearch = () => {
    loadCodes(1, pagination.pageSize);
  };

  const handleReset = () => {
    const emptyFilters = { code: '', channel: '', status: '' };
    setFilters(emptyFilters);
    loadCodes(1, pagination.pageSize, emptyFilters);
  };

  const generateCodes = async () => {
     try {
        await invitationAPI.generateInvitations({
          count: form.count,
          points: form.points,
          maxUses: form.maxUses,
          siteId: activeSiteId,
          channel: form.channel || undefined,
          validStartDate: form.validStartDate,
          validEndDate: form.validEndDate
        });
        message.success('生成成功');
        loadCodes(1, pagination.pageSize);
        setGenerateModal(false);
     } catch (err: any) {
        console.error('生成失败:', err);
     }
  };
  
  const handleUpdate = async () => {
    if (!editModal.code) return;
    try {
      await invitationAPI.updateInvitation(editModal.code.id, {
        channel: editModal.code.channel,
        status: editModal.code.status,
        points: editModal.code.points,
        maxUses: editModal.code.maxUses,
        validStartDate: editModal.code.validStartDate, // Note: backend expects LocalDate string
        validEndDate: editModal.code.validEndDate
      } as any);
      message.success('更新成功');
      loadCodes(pagination.current, pagination.pageSize);
      setEditModal({isOpen: false, code: null});
    } catch (err: any) {
      message.error('更新失败: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个邀请码吗？')) return;
    try {
      await invitationAPI.deleteInvitation(id);
      message.success('删除成功');
      loadCodes(pagination.current, pagination.pageSize);
    } catch (err: any) {
      message.error('删除失败: ' + err.message);
    }
  };

  const handleCopy = (text: string) => {
    // 降级复制方案
    const fallbackCopy = (content: string) => {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = content;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          message.success('复制成功');
        } else {
          message.error('复制失败');
        }
      } catch (err) {
        console.error('Fallback copy failed:', err);
        message.error('复制失败');
      }
    };

    // 优先使用 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        message.success('复制成功');
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  };

  return (
    <div className="bg-white rounded-xl border card-shadow h-[calc(100vh-140px)] flex flex-col animate-fade-in">
      <div className="p-6 border-b flex justify-between items-center"><h3 className="font-bold text-xl">邀请码管理</h3><button onClick={() => setGenerateModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Plus size={16}/> 生成邀请码</button></div>
      <div className="p-4 bg-slate-50/50 border-b space-y-4">
        <CategoryTabs selected={activeSiteId} onSelect={setActiveSiteId} />
        
        {/* 搜索表单 */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 font-medium">邀请码</label>
            <input 
              type="text" 
              className="px-3 py-2 border rounded-lg text-sm w-40" 
              placeholder="输入邀请码"
              value={filters.code}
              onChange={e => setFilters({...filters, code: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 font-medium">渠道</label>
            <input 
              type="text" 
              className="px-3 py-2 border rounded-lg text-sm w-40" 
              placeholder="输入渠道"
              value={filters.channel}
              onChange={e => setFilters({...filters, channel: e.target.value})}
            />
          </div>
          <div className="flex gap-2 pb-0.5">
            <button 
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2"
            >
              <Search size={14} /> 查询
            </button>
            <button 
              onClick={handleReset}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300 flex items-center gap-2"
            >
              <RefreshCw size={14} /> 重置
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">加载中...</div>
        ) : codes.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400">暂无数据</div>
        ) : (
          <>
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b"><tr><th className="px-6 py-3">邀请码</th><th className="px-6 py-3">渠道</th><th className="px-6 py-3">赠送积分</th><th className="px-6 py-3">已用/上限</th><th className="px-6 py-3">有效期</th><th className="px-6 py-3">创建时间</th><th className="px-6 py-3 text-right">操作</th></tr></thead>
              <tbody>{codes.map(c => <tr key={c.id} className="border-b hover:bg-slate-50">
                 <td className="px-6 py-4 font-mono font-bold text-slate-700">{c.code} <button onClick={() => handleCopy(c.code)} className="ml-2 text-slate-400 hover:text-blue-600" title="复制邀请码"><Copy size={12}/></button></td>
                 <td className="px-6 py-4 text-xs text-slate-600">{c.channel || '-'}</td>
                 <td className="px-6 py-4 font-bold text-orange-500">{c.points}</td>
                 <td className="px-6 py-4">{c.usedCount}/{c.maxUses}</td>
                 <td className="px-6 py-4 text-xs text-slate-500">
                   <div>起: {c.validStartDate || '-'}</div>
                   <div>止: {c.validEndDate || '-'}</div>
                 </td>
                 <td className="px-6 py-4 text-slate-500">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td>
                 <td className="px-6 py-4 text-right flex justify-end gap-2">
                   <button onClick={() => setEditModal({isOpen: true, code: {...c}})} className="text-blue-600 p-1 hover:bg-blue-50 rounded" title="编辑"><Edit size={16}/></button>
                   <button onClick={() => handleDelete(c.id)} className="text-red-600 p-1 hover:bg-red-50 rounded" title="删除"><Trash2 size={16}/></button>
                 </td>
              </tr>)}</tbody>
            </table>
            
            {/* 分页控件 */}
            <div className="p-4 border-t flex justify-between items-center bg-white">
              <div className="text-sm text-slate-500">
                共 {total} 条记录，当前第 {pagination.current}/{Math.ceil(total / pagination.pageSize)} 页
              </div>
              <div className="flex gap-2">
                <button 
                  disabled={pagination.current === 1}
                  onClick={() => loadCodes(pagination.current - 1, pagination.pageSize)}
                  className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button 
                  disabled={pagination.current >= Math.ceil(total / pagination.pageSize)}
                  onClick={() => loadCodes(pagination.current + 1, pagination.pageSize)}
                  className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* 生成邀请码弹窗 */}
      <Modal isOpen={generateModal} onClose={() => setGenerateModal(false)} title="生成邀请码" maskClosable={false}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <FormItem label="生成数量 (个)"><input type="number" className="w-full p-2 border rounded" value={form.count} onChange={e => setForm({...form, count: parseInt(e.target.value)})} /></FormItem>
             <FormItem label="单个赠送积分"><input type="number" className="w-full p-2 border rounded" value={form.points} onChange={e => setForm({...form, points: parseInt(e.target.value)})} /></FormItem>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <FormItem label="使用次数限制"><input type="number" className="w-full p-2 border rounded" value={form.maxUses} onChange={e => setForm({...form, maxUses: parseInt(e.target.value)})} /></FormItem>
             <FormItem label="使用渠道"><input type="text" className="w-full p-2 border rounded" placeholder="例如：线下推广" value={form.channel} onChange={e => setForm({...form, channel: e.target.value})} /></FormItem>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <FormItem label="开始时间"><input type="date" className="w-full p-2 border rounded" value={form.validStartDate} onChange={e => setForm({...form, validStartDate: e.target.value})} /></FormItem>
             <FormItem label="结束时间"><input type="date" className="w-full p-2 border rounded" value={form.validEndDate} onChange={e => setForm({...form, validEndDate: e.target.value})} /></FormItem>
          </div>
          <button onClick={generateCodes} className="w-full py-2 bg-blue-600 text-white rounded font-bold mt-2">确认生成</button>
        </div>
      </Modal>

      {/* 编辑邀请码弹窗 */}
      <Modal isOpen={editModal.isOpen} onClose={() => setEditModal({isOpen: false, code: null})} title="编辑邀请码" maskClosable={false}>
        {editModal.code && (
          <div className="space-y-4">
            <FormItem label="邀请码"><input type="text" className="w-full p-2 border rounded bg-slate-100 text-slate-500" value={editModal.code.code} disabled /></FormItem>
            <div className="grid grid-cols-2 gap-4">
               <FormItem label="赠送积分"><input type="number" className="w-full p-2 border rounded" value={editModal.code.points} onChange={e => setEditModal({isOpen: true, code: {...editModal.code!, points: parseInt(e.target.value)}})} /></FormItem>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <FormItem label="使用次数限制"><input type="number" className="w-full p-2 border rounded" value={editModal.code.maxUses} onChange={e => setEditModal({isOpen: true, code: {...editModal.code!, maxUses: parseInt(e.target.value)}})} /></FormItem>
               <FormItem label="使用渠道"><input type="text" className="w-full p-2 border rounded" value={editModal.code.channel || ''} onChange={e => setEditModal({isOpen: true, code: {...editModal.code!, channel: e.target.value}})} /></FormItem>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <FormItem label="开始时间"><input type="date" className="w-full p-2 border rounded" value={editModal.code.validStartDate} onChange={e => setEditModal({isOpen: true, code: {...editModal.code!, validStartDate: e.target.value}})} /></FormItem>
               <FormItem label="结束时间"><input type="date" className="w-full p-2 border rounded" value={editModal.code.validEndDate} onChange={e => setEditModal({isOpen: true, code: {...editModal.code!, validEndDate: e.target.value}})} /></FormItem>
            </div>
            <button onClick={handleUpdate} className="w-full py-2 bg-blue-600 text-white rounded font-bold mt-2">保存修改</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

const SiteManagement = () => {
  const [sites, setSites] = useState<Site[]>([]); // 站点列表
  const [loading, setLoading] = useState(false); // 加载状态
  const [editModal, setEditModal] = useState<{isOpen: boolean, site: Site | null}>({isOpen: false, site: null}); // 编辑弹窗状态
  const [domain, setDomain] = useState(''); // 域名输入
  const [manual, setManual] = useState(''); // 使用手册输入
  const [userAgreement, setUserAgreement] = useState(''); // 用户协议
  const [privacyPolicy, setPrivacyPolicy] = useState(''); // 隐私政策
  const [copyright, setCopyright] = useState(''); // 版权信息
  const [footerCopyright, setFooterCopyright] = useState(''); // 底部版权信息
  const [logo, setLogo] = useState(''); // Logo
  const [websiteName, setWebsiteName] = useState(''); // 网站名称
  const [loginSubtext, setLoginSubtext] = useState(''); // 登录框小文字
  const [websiteTitle, setWebsiteTitle] = useState(''); // 网站Title
  const [favicon, setFavicon] = useState(''); // Favicon

  const handleImageUpload = async (file: File, type: 'logo' | 'favicon') => {
    try {
      const url = await uploadAPI.uploadImage(file, 'site-assets/');
      if (type === 'logo') setLogo(url);
      else setFavicon(url);
      message.success('上传成功');
    } catch (err: any) {
      message.error('上传失败: ' + err.message);
    }
  };
  
  // 加载站点列表
  const loadSites = async () => {
    setLoading(true);
    try {
      const data = await siteAPI.getSites();
      setSites(data);
    } catch (err: any) {
      console.error('加载站点列表失败:', err);
      message.error('加载站点列表失败: ' + (err.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { loadSites(); }, []);
  
  // 打开编辑弹窗
  const openEditModal = (site: Site) => {
    setEditModal({isOpen: true, site});
    setDomain(site.domain);
    setManual(site.manual || '');
    setUserAgreement(site.userAgreement || '');
    setPrivacyPolicy(site.privacyPolicy || '');
    setCopyright(site.copyright || '');
    setFooterCopyright(site.footerCopyright || '');
    setLogo(site.logo || '');
    setWebsiteName(site.websiteName || '');
    setLoginSubtext(site.loginSubtext || '');
    setWebsiteTitle(site.websiteTitle || '');
    setFavicon(site.favicon || '');
  };
  
  // 保存修改
  const handleSave = async () => {
    if (!editModal.site) return;
    
    if (!domain || domain.trim() === '') {
      alert('请输入域名');
      return;
    }
    
    try {
      await siteAPI.updateSite(editModal.site.id.toString(), {
        domain: domain.trim(),
        manual: manual,
        userAgreement: userAgreement,
        privacyPolicy: privacyPolicy,
        copyright: copyright,
        footerCopyright: footerCopyright,
        logo: logo,
        websiteName: websiteName,
        loginSubtext: loginSubtext,
        websiteTitle: websiteTitle,
        favicon: favicon
      });
      message.success('站点信息更新成功');
      await loadSites();
      setEditModal({isOpen: false, site: null});
      setDomain('');
      setManual('');
      setUserAgreement('');
      setPrivacyPolicy('');
      setCopyright('');
      setFooterCopyright('');
      setLogo('');
      setWebsiteName('');
      setLoginSubtext('');
      setWebsiteTitle('');
      setFavicon('');
    } catch (err: any) {
      message.error('更新站点失败: ' + (err.message || '未知错误'));
    }
  };

  return (
    <div className="bg-white rounded-xl border card-shadow h-[calc(100vh-140px)] flex flex-col animate-fade-in">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="font-bold text-xl">站点管理</h3>
      </div>
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">加载中...</div>
        ) : sites.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400">暂无数据</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3">站点ID</th>
                <th className="px-6 py-3">站点名称</th>
                <th className="px-6 py-3">站点代码</th>
                <th className="px-6 py-3">域名</th>
                <th className="px-6 py-3">版权信息</th>
                <th className="px-6 py-3">使用手册</th>
                <th className="px-6 py-3">状态</th>
                <th className="px-6 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {sites.map(site => (
                <tr key={site.id} className="border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium">{site.id}</td>
                  <td className="px-6 py-4">{site.name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-mono">
                      {site.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-blue-600">{site.domain}</td>
                  <td className="px-6 py-4 text-slate-500 max-w-[150px] truncate" title={site.copyright}>
                    {site.copyright || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate" title={site.manual}>
                    {site.manual || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={site.status === 'active' ? 'active' : 'suspended'} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openEditModal(site)} 
                      className="text-blue-600 p-2 hover:bg-blue-50 rounded"
                      title="编辑"
                    >
                      <Edit size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* 编辑站点弹窗 */}
      <Modal 
        isOpen={editModal.isOpen} 
        onClose={() => {
          setEditModal({isOpen: false, site: null});
          setDomain('');
          setManual('');
          setUserAgreement('');
          setPrivacyPolicy('');
          setCopyright('');
          setFooterCopyright('');
          setLogo('');
          setWebsiteName('');
          setLoginSubtext('');
          setWebsiteTitle('');
          setFavicon('');
        }} 
        title="编辑站点信息"
        size="xl"
        maskClosable={false}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormItem label="站点名称">
              <input 
                type="text" 
                className="w-full p-2 border rounded bg-slate-100 text-slate-500 cursor-not-allowed" 
                value={editModal.site?.name || ''} 
                disabled
              />
            </FormItem>
            <FormItem label="站点代码">
              <input 
                type="text" 
                className="w-full p-2 border rounded bg-slate-100 text-slate-500 cursor-not-allowed font-mono" 
                value={editModal.site?.code || ''} 
                disabled
              />
            </FormItem>
          </div>
          <FormItem label="域名" required>
            <input 
              type="text" 
              className="w-full p-2 border rounded" 
              placeholder="请输入域名，如：medical.example.com"
              value={domain} 
              onChange={e => setDomain(e.target.value)} 
            />
          </FormItem>
          <div className="grid grid-cols-2 gap-4">
            <FormItem label="顶部标识/版本号">
              <input 
                type="text" 
                className="w-full p-2 border rounded" 
                placeholder="请输入顶部显示的版本号或标识"
                value={copyright} 
                onChange={e => setCopyright(e.target.value)} 
              />
            </FormItem>
            <FormItem label="底部版权信息">
              <input 
                type="text" 
                className="w-full p-2 border rounded" 
                placeholder="请输入页面底部的版权声明"
                value={footerCopyright} 
                onChange={e => setFooterCopyright(e.target.value)} 
              />
            </FormItem>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <FormItem label="网站名称">
              <input 
                type="text" 
                className="w-full p-2 border rounded" 
                placeholder="请输入网站名称"
                value={websiteName} 
                onChange={e => setWebsiteName(e.target.value)} 
              />
            </FormItem>
             <FormItem label="网站Title">
              <input 
                type="text" 
                className="w-full p-2 border rounded" 
                placeholder="请输入浏览器标题栏信息"
                value={websiteTitle} 
                onChange={e => setWebsiteTitle(e.target.value)} 
              />
            </FormItem>
          </div>
          <FormItem label="登录框Slogan">
            <input 
              type="text" 
              className="w-full p-2 border rounded" 
              placeholder="请输入登录框下方的文字"
              value={loginSubtext} 
              onChange={e => setLoginSubtext(e.target.value)} 
            />
          </FormItem>
          <div className="grid grid-cols-2 gap-4">
             <FormItem label="Logo">
               <div className="flex flex-col gap-2">
                  {logo && <img src={logo} className="h-10 object-contain border rounded bg-slate-50" />}
                  <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
               </div>
            </FormItem>
             <FormItem label="Favicon">
                <div className="flex flex-col gap-2">
                  {favicon && <img src={favicon} className="h-8 w-8 object-contain border rounded bg-slate-50" />}
                  <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'favicon')} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
               </div>
            </FormItem>
          </div>

          <FormItem label="使用手册">
            <textarea 
              className="w-full p-2 border rounded min-h-[80px]" 
              placeholder="请输入使用手册内容..."
              value={manual} 
              onChange={e => setManual(e.target.value)} 
            />
          </FormItem>
          
          <div className="grid grid-cols-2 gap-6">
            <FormItem label="用户协议">
              <div className="h-64 mb-12">
                <ReactQuill 
                  theme="snow" 
                  value={userAgreement} 
                  onChange={setUserAgreement}
                  className="h-48"
                />
              </div>
            </FormItem>
            <FormItem label="隐私政策">
              <div className="h-64 mb-12">
                <ReactQuill 
                  theme="snow" 
                  value={privacyPolicy} 
                  onChange={setPrivacyPolicy}
                  className="h-48"
                />
              </div>
            </FormItem>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => {
                setEditModal({isOpen: false, site: null});
                setDomain('');
                setManual('');
                setUserAgreement('');
                setPrivacyPolicy('');
                setCopyright('');
              }}
              className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={16} /> 保存
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const AccountManagement = () => {
  const [accounts, setAccounts] = useState<BackendAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{isOpen: boolean, acc: Partial<BackendAccount> | null}>({isOpen: false, acc: null});
  
  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await accountAPI.getAccounts();
      setAccounts(data);
    } catch (err: any) {
      message.error('加载账号列表失败: ' + (err.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { loadAccounts(); }, []);
  
  const handleSave = async () => {
     try {
        if(modal.acc?.id) {
           await accountAPI.updateAccount(modal.acc.id.toString(), modal.acc);
        } else {
           await accountAPI.createAccount(modal.acc || {});
        }
        await loadAccounts();
        setModal({isOpen: false, acc: null});
     } catch (err: any) {
        console.error('保存失败:', err);
        message.error('保存失败: ' + (err.message || '未知错误'));
     }
  };

  return (
    <div className="bg-white rounded-xl border card-shadow h-[calc(100vh-140px)] flex flex-col animate-fade-in">
      <div className="p-6 border-b flex justify-between items-center"><h3 className="font-bold text-xl">后台账号管理</h3><button onClick={() => setModal({isOpen: true, acc: {role: 'operator'}})} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Plus size={16}/> 新增账号</button></div>
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">加载中...</div>
        ) : accounts.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400">暂无数据</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b"><tr><th className="px-6 py-3">邮箱账号</th><th className="px-6 py-3">角色权限</th><th className="px-6 py-3">状态</th><th className="px-6 py-3">最后登录</th><th className="px-6 py-3 text-right">操作</th></tr></thead>
            <tbody>{accounts.map(a => <tr key={a.id} className="border-b hover:bg-slate-50">
               <td className="px-6 py-4 font-medium">{a.email}</td>
               <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100 uppercase font-bold">{a.role}</span></td>
               <td className="px-6 py-4"><StatusBadge status={a.status as any} /></td>
               <td className="px-6 py-4 text-slate-500">{a.lastLogin ? new Date(a.lastLogin).toLocaleString() : '-'}</td>
               <td className="px-6 py-4 text-right"><button onClick={() => setModal({isOpen: true, acc: a})} className="text-blue-600 p-2 hover:bg-blue-50 rounded"><Edit size={16}/></button></td>
            </tr>)}</tbody>
          </table>
        )}
      </div>
      <Modal isOpen={modal.isOpen} onClose={() => setModal({isOpen: false, acc: null})} title={modal.acc?.id ? '编辑账号' : '新增账号'} maskClosable={false}>
        <div className="space-y-4">
          <FormItem label="登录邮箱" required>
            <input 
              type="email" 
              className="w-full p-2 border rounded" 
              value={modal.acc?.email || ''} 
              onChange={e => setModal({isOpen: true, acc: {...modal.acc, email: e.target.value}})} 
            />
          </FormItem>
          <FormItem label="登录密码" required={!modal.acc?.id}>
            <input 
              type="password" 
              placeholder={modal.acc?.id ? "留空则不修改" : "请输入密码"} 
              className="w-full p-2 border rounded" 
              value={modal.acc?.password || ''} 
              onChange={e => setModal({isOpen: true, acc: {...modal.acc, password: e.target.value}})} 
            />
          </FormItem>
          <FormItem label="角色权限">
             <select 
               className="w-full p-2 border rounded bg-white" 
               value={modal.acc?.role || 'operator'} 
               onChange={e => setModal({isOpen: true, acc: {...modal.acc, role: e.target.value as any}})}
             >
                <option value="admin">超级管理员 (Admin)</option>
                <option value="operator">运营人员 (Operator)</option>
                <option value="viewer">访客 (Viewer)</option>
             </select>
          </FormItem>
          <button onClick={handleSave} className="w-full py-2 bg-blue-600 text-white rounded font-bold mt-2">保存账号</button>
        </div>
      </Modal>
    </div>
  );
};

const ModulePlaceholder = ({ title }: { title: string }) => <div className="p-6 bg-white rounded-xl">Module: {title}</div>;

// Login 和 AdminLayout 已提取到 components/layout 目录

// --- Root Component ---
function App() {
  // 使用自定义 hook 管理登录状态
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  
  // 处理登录
  const handleLogin = () => { 
    setIsLoggedIn(true); 
  };
  
  // 处理登出
  const handleLogout = async () => { 
    try { 
      await authAPI.logout(); 
    } catch (err) { 
      console.error('登出失败:', err); 
    }
    setIsLoggedIn(false); 
  };
  
  return isLoggedIn ? (
    <AdminLayout 
      onLogout={handleLogout}
      SquareManagement={SquareManagement}
      AssetsManagement={AssetsManagement}
      MarketingManagement={MarketingManagement}
      MenuManagement={MenuManagement}
      ApiManagement={ApiManagement}
      ApiParameterMappingManagement={ApiParameterMappingManagement}
      PaymentManagement={PaymentManagement}
      RechargeConfigManagement={RechargeConfigManagement}
      GenerationRecords={GenerationRecords}
      InvitationManagement={InvitationManagement}
      SiteManagement={SiteManagement}
      AccountManagement={AccountManagement}
    />
  ) : (
    <Login onLogin={handleLogin} />
  );
}

export default App;
