
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
  BookOpen,
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
  Save
} from 'lucide-react';
import { SIDEBAR_MENU, MOCK_ADS, MOCK_API_CATEGORIES, STANDARD_MENUS, MOCK_MANUALS, MOCK_ASSETS, API_TYPES } from './constants';
import { User as UserType, UserAsset, MarketingAd, NavSection, GenerationRecord, InvitationCode, MenuConfig, ManualConfig, BackendAccount, ApiPlatform, ApiInterface, ApiCategory, Site } from './types';
import { SITES, SiteId } from './constants/sites';
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
import * as apiPlatformAPI from './api/apiPlatform';
import * as menuAPI from './api/menu';

// 导入已提取的通用组件
import Modal from './components/common/Modal';
import ToggleSwitch from './components/common/ToggleSwitch';
import StatusBadge from './components/common/StatusBadge';
import CategoryTabs from './components/common/CategoryTabs';
import FormItem from './components/common/FormItem';

// 导入已提取的页面组件
import Dashboard from './components/pages/Dashboard';
import UserManagement from './components/pages/UserManagement';
import RechargeConfigManagement from './components/pages/RechargeConfigManagement';

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
  const [assets, setAssets] = useState<UserAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editingLike, setEditingLike] = useState<{id: string, count: number} | null>(null);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await assetAPI.getAssets(activeSiteId, activeTab === 'all' ? undefined : activeTab, search || undefined);
      setAssets(data);
    } catch (err: any) {
      alert('加载内容失败: ' + (err.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadAssets();
  }, [activeSiteId, activeTab, search]);
  
  const filteredAssets = assets;
  
  const togglePin = async (id:string) => {
    try {
      await assetAPI.togglePin(id);
      await loadAssets();
    } catch (err: any) {
      alert('操作失败: ' + (err.message || '未知错误'));
    }
  };
  const toggleStatus = async (id:string) => {
    try {
      const asset = assets.find(a => a.id === id);
      if (!asset) return;
      const newStatus = asset.status === 'published' ? 'hidden' : 'published';
      await assetAPI.updateAssetStatus(id, newStatus);
      await loadAssets();
    } catch (err: any) {
      alert('操作失败: ' + (err.message || '未知错误'));
    }
  };
  const handleDelete = async (id:string) => { 
    if(window.confirm("确认要删除此内容吗？\n一旦删除无法找回！")) {
      try {
        await assetAPI.deleteAsset(id);
        await loadAssets();
      } catch (err: any) {
        alert('删除失败: ' + (err.message || '未知错误'));
      }
    }
  };
  
  const saveLikeCount = async () => {
      if(editingLike) {
          try {
            await assetAPI.updateLikeCount(editingLike.id, editingLike.count);
            await loadAssets();
          } catch (err: any) {
            alert('更新失败: ' + (err.message || '未知错误'));
          }
          setEditingLike(null);
      }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 card-shadow flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">广场管理</h3>
          <div className="relative w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="搜索作品名或作者名..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-slate-50" />
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
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">加载中...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400">暂无数据</div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {filteredAssets.map(asset => (
            <div key={asset.id} className="break-inside-avoid group relative border rounded-xl shadow-sm hover:shadow-lg transition-all bg-white overflow-hidden mb-6">
                {asset.isPinned && <div className="absolute top-2 left-2 bg-yellow-400 text-white p-1 rounded-md shadow-sm z-10"><Pin size={12} fill="currentColor"/></div>}
                <div className="bg-slate-100 relative">
                    <img src={asset.thumbnail || asset.url} className="w-full h-auto object-cover block" />
                    {asset.type === 'video' && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><Play className="text-white drop-shadow-md" fill="currentColor"/></div>}
                    {asset.type === 'audio' && <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80"><Music className="text-white"/></div>}
                </div>
                <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-sm truncate flex-1 mr-2">{asset.title}</p>
                        <StatusBadge status={asset.status}/>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 border-t pt-2 mt-2">
                        <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">{asset.userName.substring(0,1).toUpperCase()}</div>
                             <span className="truncate max-w-[80px]">{asset.userName}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-full cursor-pointer hover:bg-slate-100" onClick={() => setEditingLike({id: asset.id, count: asset.likeCount || 0})}>
                             <Heart size={12} className="text-red-500" fill="#ef4444" />
                             <span className="font-medium text-slate-600">{asset.likeCount || 0}</span>
                             <Pencil size={10} className="text-slate-400 ml-1 opacity-0 group-hover:opacity-100" />
                        </div>
                    </div>
                </div>
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                    <button onClick={() => togglePin(asset.id)} className="p-3 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30" title="置顶"><Pin size={18} className={asset.isPinned ? "fill-current" : ""} /></button>
                    <button onClick={() => toggleStatus(asset.id)} className="p-3 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30" title={asset.status === 'published' ? '下架' : '上架'}>{asset.status === 'published' ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                    <button onClick={() => handleDelete(asset.id)} className="p-3 bg-red-500/80 backdrop-blur rounded-full text-white hover:bg-red-500" title="删除"><Trash2 size={18} /></button>
                </div>
            </div>
            ))}
          </div>
        )}
      </div>
      
      {editingLike && (
          <Modal isOpen={true} onClose={() => setEditingLike(null)} title="修改点赞数" size="md">
              <div className="space-y-4">
                  <FormItem label="当前点赞数">
                      <input type="number" value={editingLike.count} onChange={e => setEditingLike({...editingLike, count: parseInt(e.target.value)})} className="w-full p-2 border rounded" />
                  </FormItem>
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingLike(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">取消</button>
                      <button onClick={saveLikeCount} className="px-4 py-2 bg-blue-600 text-white rounded">保存</button>
                  </div>
              </div>
          </Modal>
      )}
    </div>
  );
};

const AssetsManagement = () => {
  const [activeSiteId, setActiveSiteId] = useState<SiteId>(SITES.MEDICAL); // 默认医美类（siteId=1）
  const [activeType, setActiveType] = useState('all');
  const [assets, setAssets] = useState<UserAsset[]>(MOCK_ASSETS);
  const [editAsset, setEditAsset] = useState<UserAsset|null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredAssets = assets.filter(a => {
      const catMatch = a.siteId === activeSiteId;
      const typeMatch = activeType === 'all' || a.type === activeType;
      const userMatch = searchQuery ? a.userName.includes(searchQuery) : true;
      return catMatch && typeMatch && userMatch;
  });

  const handleDelete = (id: string) => { if(window.confirm('确认删除该资产吗？\n一旦删除无法找回！')) setAssets(assets.filter(a => a.id !== id)); };

  return (
    <div className="bg-white rounded-xl border card-shadow h-[calc(100vh-140px)] flex flex-col animate-fade-in">
      <div className="p-6 border-b"><h3 className="text-xl font-bold text-slate-800">资产管理</h3></div>
      <div className="p-4 bg-slate-50/50 border-b flex flex-col sm:flex-row gap-4 justify-between items-center">
          <CategoryTabs selected={activeSiteId} onSelect={setActiveSiteId} />
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="搜索用户名..." 
                    className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex bg-white rounded-lg p-1 border shrink-0">
                {['all', 'image', 'video', 'audio'].map(t => (
                    <button key={t} onClick={() => setActiveType(t)} className={`px-4 py-1.5 text-xs font-medium rounded capitalize ${activeType === t ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                        {t === 'all' ? '全部' : t === 'image' ? '图片' : t === 'video' ? '视频' : '音频'}
                    </button>
                ))}
            </div>
          </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredAssets.map(asset => (
            <div key={asset.id} className="border rounded-xl group overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-square bg-slate-100 relative">
                    <img src={asset.thumbnail || asset.url} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/50 rounded text-[10px] text-white uppercase">{asset.type}</div>
                </div>
                <div className="p-3">
                <p className="font-bold text-sm truncate" title={asset.title}>{asset.title}</p>
                <p className="text-xs text-slate-400 mt-1 truncate">@{asset.userName}</p>
                <div className="flex justify-between mt-3 pt-2 border-t border-slate-100">
                    <button onClick={() => setEditAsset(asset)} className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"><Edit size={12}/> 修改</button>
                    <button onClick={() => handleDelete(asset.id)} className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-1"><Trash2 size={12}/> 删除</button>
                </div>
                </div>
            </div>
            ))}
        </div>
      </div>
      {editAsset && <Modal isOpen={true} onClose={() => setEditAsset(null)} title="修改资产">
          <div className="space-y-4">
              <FormItem label="资产标题"><input defaultValue={editAsset.title} className="w-full p-2 border rounded" /></FormItem>
              <FormItem label="站点 (不可修改)">
                  <select disabled defaultValue={editAsset.siteId} className="w-full p-2 border rounded bg-slate-100 text-slate-500 cursor-not-allowed">
                      <option value="medical">医美类</option>
                      <option value="ecommerce">电商类</option>
                      <option value="life">生活服务类</option>
                  </select>
              </FormItem>
              <button className="mt-4 w-full p-2 bg-blue-600 text-white rounded font-bold" onClick={() => setEditAsset(null)}>保存修改</button>
          </div>
      </Modal>}
    </div>
  );
};

const MarketingManagement = () => {
  const [activeSiteId, setActiveSiteId] = useState<SiteId>(SITES.MEDICAL); // 默认医美类（siteId=1）
  const [ads, setAds] = useState<MarketingAd[]>(MOCK_ADS);
  const [manualModal, setManualModal] = useState(false);
  const [csModal, setCsModal] = useState(false);
  const [manuals, setManuals] = useState<ManualConfig[]>(MOCK_MANUALS);
  const [editAd, setEditAd] = useState<Partial<MarketingAd> | null>(null);
  const [csConfig, setCsConfig] = useState({ image: '', text: '' });
  const [csUploading, setCsUploading] = useState(false); // 客服图片上传状态

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

  // 当站点ID改变时重新加载广告
  useEffect(() => {
    loadAds();
  }, [activeSiteId]);

  const filteredAds = ads.filter(ad => ad.siteId === activeSiteId);

  // Helper to get manual URL for a site
  const getUrl = (siteId: SiteId) => manuals.find(m => m.siteId === siteId)?.url || '';
  const updateUrl = (siteId: SiteId, val: string) => {
    setManuals(prev => {
       const existing = prev.find(p => p.siteId === siteId);
       if(existing) return prev.map(p => p.siteId === siteId ? {...p, url: val} : p);
       return [...prev, { id: Date.now().toString(), siteId: siteId, title: '', url: val }];
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">营销管理</h2>
        <div className="flex gap-4">
          <button onClick={() => setCsModal(true)} className="px-4 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700"><Headphones size={16}/> 客服配置</button>
          <button onClick={() => setManualModal(true)} className="px-4 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700"><BookOpen size={16}/> 手册配置</button>
          <button onClick={() => setEditAd({ siteId: activeSiteId, position: 1 })} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-sm"><Plus size={16}/> 新增广告</button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border card-shadow h-[calc(100vh-140px)] flex flex-col">
          <div className="p-4 border-b"><CategoryTabs selected={activeSiteId} onSelect={setActiveSiteId} /></div>
          <div className="flex-1 overflow-auto p-6 space-y-4">
            {filteredAds.map(ad => (
                <div key={ad.id} className="border rounded-lg p-4 flex items-center gap-6 hover:bg-slate-50 transition-colors">
                <div className="w-32 h-16 bg-slate-100 rounded-md overflow-hidden shrink-0"><img src={ad.imageUrl} className="w-full h-full object-cover"/></div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800">{ad.title}</h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">广告位 {ad.position}</span>
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

       <Modal isOpen={manualModal} onClose={() => setManualModal(false)} title="站点使用手册配置">
        <div className="space-y-4">
          {[SITES.MEDICAL, SITES.ECOMMERCE, SITES.LIFE].map(siteId => (
            <div key={siteId} className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">{siteId === SITES.MEDICAL ? '医美类' : siteId === SITES.ECOMMERCE ? '电商类' : '生活类'} 手册链接</label>
              <input className="w-full p-2 border rounded" value={getUrl(siteId)} onChange={e => updateUrl(siteId, e.target.value)} placeholder={`请输入${siteId === SITES.MEDICAL ? '医美类' : siteId === SITES.ECOMMERCE ? '电商类' : '生活类'}站点手册URL...`} />
            </div>
          ))}
          <button className="w-full py-2 bg-blue-600 text-white rounded-lg mt-2 font-medium">保存配置</button>
        </div>
      </Modal>

      <Modal isOpen={csModal} onClose={() => setCsModal(false)} title="客服信息配置">
          <div className="space-y-5">
              <FormItem label="客服二维码图片">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer flex flex-col items-center justify-center text-slate-400 relative overflow-hidden group h-48">
                      {csConfig.image ? (
                          <>
                            <img src={csConfig.image} className="h-full object-contain" />
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
                              alert('图片大小不能超过 5MB');
                              return;
                            }
                            // 检查文件类型
                            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                            if (!validTypes.includes(file.type)) {
                              alert('只支持 JPG、PNG、WEBP 格式的图片');
                              return;
                            }
                            
                            // 先创建预览 URL
                            const previewUrl = URL.createObjectURL(file);
                            setCsConfig({...csConfig, image: previewUrl});
                            
                            // 开始上传
                            setCsUploading(true);
                            try {
                              // 调用后端上传接口，上传到 images/ 文件夹
                              const uploadedUrl = await uploadAPI.uploadImage(file, 'images/');
                              // 使用服务器返回的URL替换预览URL
                              setCsConfig({...csConfig, image: uploadedUrl});
                              // 释放预览URL
                              URL.revokeObjectURL(previewUrl);
                            } catch (error) {
                              // 上传失败，恢复原状态
                              console.error('图片上传失败:', error);
                              alert('图片上传失败：' + (error instanceof Error ? error.message : '未知错误'));
                              setCsConfig({...csConfig, image: ''});
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
                    value={csConfig.text}
                    onChange={e => setCsConfig({...csConfig, text: e.target.value})}
                  />
              </FormItem>
              <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 transition-colors" onClick={() => setCsModal(false)}>保存客服配置</button>
          </div>
      </Modal>

      {editAd && <AdEditorModal ad={editAd} onClose={() => setEditAd(null)} onSave={loadAds} />}
    </div>
  );
};

const AdEditorModal = ({ ad, onClose, onSave }: { ad: Partial<MarketingAd>; onClose: () => void; onSave?: () => void }) => {
  const [formData, setFormData] = useState(ad);
  const [activeTab, setActiveTab] = useState(ad.linkType || 'external');
  const fileInputRef = useRef<HTMLInputElement>(null); // 文件输入引用
  const [uploading, setUploading] = useState(false); // 上传状态
  const [saving, setSaving] = useState(false); // 保存状态
  
  // 当ad对象变化时，同步更新formData（避免状态不同步导致的闪退）
  // 使用关键字段作为依赖，避免对象引用变化导致的频繁更新
  useEffect(() => {
    setFormData(ad);
    setActiveTab(ad.linkType || 'external');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad?.id, ad?.title, ad?.imageUrl, ad?.linkType, ad?.siteId, ad?.position]); // 只在关键字段变化时更新

  // 保存广告
  const handleSave = async () => {
    // 验证必填字段
    if (!formData.title) {
      alert('请输入广告标题');
      return;
    }
    if (!formData.siteId) {
      alert('请选择所属站点');
      return;
    }
    if (!formData.position || formData.position < 1) {
      alert('请输入有效的广告位顺序（正整数，数字越小排序越靠前）');
      return;
    }
    if (!formData.imageUrl) {
      alert('请上传广告图片');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      alert('请选择开始时间和结束时间');
      return;
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
        alert('广告更新成功');
      } else {
        // 创建广告
        await marketingAPI.createAd(siteId, finalData);
        alert('广告创建成功');
      }
      // 刷新列表
      if (onSave) {
        onSave();
      }
      // 关闭弹窗
      onClose();
    } catch (error) {
      console.error('保存广告失败:', error);
      alert('保存失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={ad.id ? "编辑全屏广告" : "新增全屏广告"} size="full">
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
                      alert('图片大小不能超过 5MB');
                      return;
                    }
                    // 检查文件类型
                    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                    if (!validTypes.includes(file.type)) {
                      alert('只支持 JPG、PNG、WEBP 格式的图片');
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
                  <img src={formData.imageUrl} alt="广告图片预览" className="max-w-full max-h-64 object-contain mb-2" />
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
          {/* Mock Toolbar */}
          <div className="border-b bg-white p-2 flex flex-wrap gap-1 sticky top-0 z-10">
            <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><Undo size={16}/></button><button className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><Redo size={16}/></button><div className="w-px h-5 bg-slate-200 mx-1 self-center" />
            <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><Bold size={16}/></button><button className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><Italic size={16}/></button><button className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><Underline size={16}/></button><div className="w-px h-5 bg-slate-200 mx-1 self-center" />
            <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><AlignLeft size={16}/></button><button className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><AlignCenter size={16}/></button><button className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><AlignRight size={16}/></button><div className="w-px h-5 bg-slate-200 mx-1 self-center" />
            <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><LinkIcon size={16}/></button><button className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><ImageIcon size={16}/></button><button className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><Code size={16}/></button>
          </div>
          <div className="flex-1 p-6 bg-white relative">
             {activeTab === 'external' && <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[1px] z-10 flex items-center justify-center text-slate-400 font-medium">外部跳转模式下无需编辑详情</div>}
             <textarea className="w-full h-full resize-none outline-none text-slate-700 leading-relaxed" placeholder="在此输入富文本内容..." value={formData.richContent} onChange={e => setFormData({...formData, richContent: e.target.value})} />
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
      alert('更新菜单失败，请重试');
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
      alert('更新菜单名称失败，请重试');
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
          <Modal isOpen={true} onClose={() => setEditMenu(null)} title="修改菜单名称" size="md">
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
    // 确认删除
    if (!window.confirm('确认删除该API平台吗？删除后无法恢复！')) return;
    try {
      // 调用删除API，传递当前选中的siteId
      await apiPlatformAPI.deletePlatform(Number(id), activeSiteId);
      // 重新加载列表
      await loadPlatforms();
    } catch (err: any) {
      alert('删除失败: ' + (err.message || '未知错误'));
    }
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
                const platformDetail = await apiPlatformAPI.getPlatform(parseInt(platformId));
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
            apiPlatformAPI.getPlatform(parseInt(platform.id)).then(platformDetail => {
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
            alert('请输入平台名称');
            return;
        }
        if (!basicInfo.type) {
            alert('请选择接口类型');
            return;
        }
        if (!basicInfo.siteId) {
            alert('请选择所属站点');
            return;
        }
        if (!genInterface.url.trim()) {
            alert('请输入图片/视频生成接口URL');
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
                alert('生成接口的请求头JSON格式错误，将使用空对象');
            }
            
            let resultHeadersJson = '{}';
            try {
                JSON.parse(resultInterface.headers); // 验证JSON格式
                resultHeadersJson = resultInterface.headers;
            } catch (e) {
                alert('结果接口的请求头JSON格式错误，将使用空对象');
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
                await apiPlatformAPI.updatePlatform(parseInt(platform.id), request);
                alert('更新成功');
            } else {
                // 创建
                await apiPlatformAPI.createPlatform(request);
                alert('创建成功');
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
            alert('保存失败：' + (err.message || '未知错误'));
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
        <Modal isOpen={true} onClose={onClose} title={platform ? "编辑 API 接口配置" : "新增 API 接口平台"} size="lg">
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
                            <select className="w-full p-2 border rounded" value={basicInfo.siteId} onChange={e => setBasicInfo({...basicInfo, siteId: parseInt(e.target.value) as SiteId})}>
                                <option value={SITES.MEDICAL}>医美类</option><option value={SITES.ECOMMERCE}>电商类</option><option value={SITES.LIFE}>生活服务类</option>
                            </select>
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
                        <input 
                            className="w-full p-2 border rounded" 
                            placeholder="例如: flux-1.0#flux-2.0#flux-3.0"
                            value={basicInfo.supportedModels}
                            onChange={e => setBasicInfo({...basicInfo, supportedModels: e.target.value})}
                        />
                        <p className="text-xs text-slate-500 mt-1">输入模型列表，多个模型以#号分割，例如：flux-1.0#flux-2.0</p>
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
      alert('无效的支付方式');
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
      alert('更新支付配置失败，请重试');
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
      alert('无效的支付方式');
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
      
      alert('保存成功');
      onSave();
    } catch (error) {
      console.error('保存支付配置失败:', error);
      alert('保存失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setSaving(false);
    }
  };
  
  if (!channel) return null;
  
  return (
    <Modal isOpen={true} onClose={onClose} title={`配置${channel}`}>
      <div className="space-y-4">
        <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-4 border border-blue-100">请直接粘贴证书内容或密钥字符串，无需上传文件。</div>
        {channel === '微信支付' && <>
          <FormItem label="普通商户号">
            <input 
              className="w-full p-2 border rounded" 
              value={formData.mchId || ''}
              onChange={e => setFormData({...formData, mchId: e.target.value})}
            />
          </FormItem>
          <FormItem label="V2微信支付秘钥">
            <input 
              className="w-full p-2 border rounded" 
              type="password" 
              value={formData.apiKey || ''}
              onChange={e => setFormData({...formData, apiKey: e.target.value})}
            />
          </FormItem>
          <FormItem label="商户付款证书内容 (PEM)">
            <textarea 
              className="w-full p-2 border rounded h-24 font-mono text-xs" 
              placeholder="-----BEGIN CERTIFICATE-----..."
              value={formData.certificate || ''}
              onChange={e => setFormData({...formData, certificate: e.target.value})}
            />
          </FormItem>
          <FormItem label="商户付款私钥内容 (PEM)">
            <textarea 
              className="w-full p-2 border rounded h-24 font-mono text-xs" 
              placeholder="-----BEGIN PRIVATE KEY-----..."
              value={formData.privateKey || ''}
              onChange={e => setFormData({...formData, privateKey: e.target.value})}
            />
          </FormItem>
        </>}
        {channel === '支付宝支付' && <>
          <FormItem label="AppID">
            <input 
              className="w-full p-2 border rounded" 
              value={formData.appId || ''}
              onChange={e => setFormData({...formData, appId: e.target.value})}
            />
          </FormItem>
          <FormItem label="支付宝公钥">
            <textarea 
              className="w-full p-2 border rounded h-24 font-mono text-xs"
              value={formData.publicKey || ''}
              onChange={e => setFormData({...formData, publicKey: e.target.value})}
            />
          </FormItem>
          <FormItem label="应用私钥">
            <textarea 
              className="w-full p-2 border rounded h-24 font-mono text-xs"
              value={formData.privateKey || ''}
              onChange={e => setFormData({...formData, privateKey: e.target.value})}
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
      alert('加载记录失败: ' + (err.message || '未知错误'));
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
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ 
      count: 1, 
      points: 100, 
      maxUses: 1, 
      validStartDate: new Date().toISOString().split('T')[0], 
      validEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      channel: ''
  });
  
  const loadCodes = async () => {
    setLoading(true);
    try {
      const data = await invitationAPI.getInvitations(activeSiteId);
      setCodes(data);
    } catch (err: any) {
      alert('加载邀请码失败: ' + (err.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCodes(); }, [activeSiteId]);
  
  const filteredCodes = codes;

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
        await loadCodes();
        setModal(false);
     } catch (err: any) {
        alert('生成失败: ' + (err.message || '未知错误'));
     }
  };

  return (
    <div className="bg-white rounded-xl border card-shadow h-[calc(100vh-140px)] flex flex-col animate-fade-in">
      <div className="p-6 border-b flex justify-between items-center"><h3 className="font-bold text-xl">邀请码管理</h3><button onClick={() => setModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Plus size={16}/> 生成邀请码</button></div>
      <div className="p-4 bg-slate-50/50 border-b"><CategoryTabs selected={activeSiteId} onSelect={setActiveSiteId} /></div>
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">加载中...</div>
        ) : filteredCodes.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400">暂无数据</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b"><tr><th className="px-6 py-3">邀请码</th><th className="px-6 py-3">渠道</th><th className="px-6 py-3">赠送积分</th><th className="px-6 py-3">已用/上限</th><th className="px-6 py-3">有效期</th><th className="px-6 py-3">状态</th><th className="px-6 py-3">创建时间</th></tr></thead>
            <tbody>{filteredCodes.map(c => <tr key={c.id} className="border-b hover:bg-slate-50">
               <td className="px-6 py-4 font-mono font-bold text-slate-700">{c.code} <button className="ml-2 text-slate-400 hover:text-blue-600"><Copy size={12}/></button></td>
               <td className="px-6 py-4 text-xs text-slate-600">{c.channel || '-'}</td>
               <td className="px-6 py-4 font-bold text-orange-500">{c.points}</td>
               <td className="px-6 py-4">{c.usedCount}/{c.maxUses}</td>
               <td className="px-6 py-4 text-xs text-slate-500">{c.validStartDate} ~ {c.validEndDate}</td>
               <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
               <td className="px-6 py-4 text-slate-500">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td>
            </tr>)}</tbody>
          </table>
        )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="生成邀请码">
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
    </div>
  );
};

const SiteManagement = () => {
  const [sites, setSites] = useState<Site[]>([]); // 站点列表
  const [loading, setLoading] = useState(false); // 加载状态
  const [editModal, setEditModal] = useState<{isOpen: boolean, site: Site | null}>({isOpen: false, site: null}); // 编辑弹窗状态
  const [domain, setDomain] = useState(''); // 域名输入
  
  // 加载站点列表
  const loadSites = async () => {
    setLoading(true);
    try {
      const data = await siteAPI.getSites();
      setSites(data);
    } catch (err: any) {
      alert('加载站点列表失败: ' + (err.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { loadSites(); }, []);
  
  // 打开编辑弹窗
  const openEditModal = (site: Site) => {
    setEditModal({isOpen: true, site});
    setDomain(site.domain);
  };
  
  // 保存域名修改
  const handleSave = async () => {
    if (!editModal.site) return;
    
    if (!domain || domain.trim() === '') {
      alert('请输入域名');
      return;
    }
    
    try {
      await siteAPI.updateSiteDomain(editModal.site.id.toString(), domain.trim());
      alert('域名更新成功');
      await loadSites();
      setEditModal({isOpen: false, site: null});
      setDomain('');
    } catch (err: any) {
      alert('更新域名失败: ' + (err.message || '未知错误'));
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
                  <td className="px-6 py-4">
                    <StatusBadge status={site.status === 'active' ? 'active' : 'suspended'} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openEditModal(site)} 
                      className="text-blue-600 p-2 hover:bg-blue-50 rounded"
                      title="修改域名"
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
      
      {/* 编辑域名弹窗 */}
      <Modal 
        isOpen={editModal.isOpen} 
        onClose={() => {
          setEditModal({isOpen: false, site: null});
          setDomain('');
        }} 
        title="修改域名"
      >
        <div className="space-y-4">
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
          <FormItem label="域名" required>
            <input 
              type="text" 
              className="w-full p-2 border rounded" 
              placeholder="请输入域名，如：medical.example.com"
              value={domain} 
              onChange={e => setDomain(e.target.value)} 
            />
            <p className="text-xs text-slate-500 mt-1">只能修改域名，其他信息不可修改</p>
          </FormItem>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => {
                setEditModal({isOpen: false, site: null});
                setDomain('');
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
      alert('加载账号列表失败: ' + (err.message || '未知错误'));
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
        alert('保存失败: ' + (err.message || '未知错误'));
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
      <Modal isOpen={modal.isOpen} onClose={() => setModal({isOpen: false, acc: null})} title={modal.acc?.id ? '编辑账号' : '新增账号'}>
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
