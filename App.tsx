
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
  Copy
} from 'lucide-react';
import { SIDEBAR_MENU, MOCK_ADS, MOCK_API_CATEGORIES, STANDARD_MENUS, MOCK_MANUALS, MOCK_ASSETS } from './constants';
import { User as UserType, UserAsset, MarketingAd, NavSection, GenerationRecord, InvitationCode, MenuConfig, ManualConfig, BackendAccount, ApiPlatform, ApiInterface } from './types';
// API 服务
import * as authAPI from './api/auth';
import * as assetAPI from './api/asset';
import * as generationAPI from './api/generation';
import * as invitationAPI from './api/invitation';
import * as accountAPI from './api/account';
import * as uploadAPI from './api/upload';
import * as marketingAPI from './api/marketing';

// 导入已提取的通用组件
import Modal from './components/common/Modal';
import ToggleSwitch from './components/common/ToggleSwitch';
import StatusBadge from './components/common/StatusBadge';
import CategoryTabs from './components/common/CategoryTabs';
import FormItem from './components/common/FormItem';

// 导入已提取的页面组件
import Dashboard from './components/pages/Dashboard';
import UserManagement from './components/pages/UserManagement';

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
  const [activeCategory, setActiveCategory] = useState('medical');
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video'>('all');
  const [assets, setAssets] = useState<UserAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editingLike, setEditingLike] = useState<{id: string, count: number} | null>(null);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await assetAPI.getAssets(activeCategory, activeTab === 'all' ? undefined : activeTab, search || undefined);
      setAssets(data);
    } catch (err: any) {
      alert('加载内容失败: ' + (err.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadAssets();
  }, [activeCategory, activeTab, search]);
  
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
          <CategoryTabs selected={activeCategory} onSelect={setActiveCategory} />
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
  const [activeCategory, setActiveCategory] = useState('medical');
  const [activeType, setActiveType] = useState('all');
  const [assets, setAssets] = useState<UserAsset[]>(MOCK_ASSETS);
  const [editAsset, setEditAsset] = useState<UserAsset|null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredAssets = assets.filter(a => {
      const catMatch = a.category === activeCategory;
      const typeMatch = activeType === 'all' || a.type === activeType;
      const userMatch = searchQuery ? a.userName.includes(searchQuery) : true;
      return catMatch && typeMatch && userMatch;
  });

  const handleDelete = (id: string) => { if(window.confirm('确认删除该资产吗？\n一旦删除无法找回！')) setAssets(assets.filter(a => a.id !== id)); };

  return (
    <div className="bg-white rounded-xl border card-shadow h-[calc(100vh-140px)] flex flex-col animate-fade-in">
      <div className="p-6 border-b"><h3 className="text-xl font-bold text-slate-800">资产管理</h3></div>
      <div className="p-4 bg-slate-50/50 border-b flex flex-col sm:flex-row gap-4 justify-between items-center">
          <CategoryTabs selected={activeCategory} onSelect={setActiveCategory} />
          
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
              <FormItem label="分类 (不可修改)">
                  <select disabled defaultValue={editAsset.category} className="w-full p-2 border rounded bg-slate-100 text-slate-500 cursor-not-allowed">
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
  const [activeCategory, setActiveCategory] = useState('medical');
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
      const data = await marketingAPI.getAds(activeCategory);
      setAds(data);
    } catch (error) {
      console.error('加载广告列表失败:', error);
      // 如果API调用失败，使用Mock数据
      setAds(MOCK_ADS);
    }
  };

  // 当分类改变时重新加载广告
  useEffect(() => {
    loadAds();
  }, [activeCategory]);

  const filteredAds = ads.filter(ad => ad.siteCategory === activeCategory);

  // Helper to get manual URL for a category
  const getUrl = (cat: string) => manuals.find(m => m.siteCategory === cat)?.url || '';
  const updateUrl = (cat: string, val: string) => {
    setManuals(prev => {
       const existing = prev.find(p => p.siteCategory === cat);
       if(existing) return prev.map(p => p.siteCategory === cat ? {...p, url: val} : p);
       return [...prev, { id: Date.now().toString(), siteCategory: cat as any, title: cat, url: val }];
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">营销管理</h2>
        <div className="flex gap-4">
          <button onClick={() => setCsModal(true)} className="px-4 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700"><Headphones size={16}/> 客服配置</button>
          <button onClick={() => setManualModal(true)} className="px-4 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700"><BookOpen size={16}/> 手册配置</button>
          <button onClick={() => setEditAd({ siteCategory: activeCategory as any })} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-sm"><Plus size={16}/> 新增广告</button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border card-shadow h-[calc(100vh-140px)] flex flex-col">
          <div className="p-4 border-b"><CategoryTabs selected={activeCategory} onSelect={setActiveCategory} /></div>
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
          {['medical', 'ecommerce', 'life'].map(cat => (
            <div key={cat} className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">{cat === 'medical' ? '医美类' : cat === 'ecommerce' ? '电商类' : '生活类'} 手册链接</label>
              <input className="w-full p-2 border rounded" value={getUrl(cat)} onChange={e => updateUrl(cat, e.target.value)} placeholder={`请输入${cat}站点手册URL...`} />
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

  // 保存广告
  const handleSave = async () => {
    // 验证必填字段
    if (!formData.title) {
      alert('请输入广告标题');
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
      if (ad.id) {
        // 更新广告
        await marketingAPI.updateAd(ad.id.toString(), finalData);
        alert('广告更新成功');
      } else {
        // 创建广告
        await marketingAPI.createAd(finalData);
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
              <FormItem label="所属站点"><input disabled value={formData.siteCategory === 'medical' ? '医美类' : formData.siteCategory === 'ecommerce' ? '电商类' : '生活类'} className="w-full p-2.5 border rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed" /></FormItem>
              <FormItem label="广告位顺序">
                  <select className="w-full p-2.5 border rounded-lg bg-white outline-none" value={formData.position} onChange={e => setFormData({...formData, position: parseInt(e.target.value)})}>
                      <option value={1}>广告位 1 (首位)</option>
                      <option value={2}>广告位 2</option>
                      <option value={3}>广告位 3</option>
                  </select>
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
  const [activeSite, setActiveSite] = useState('medical');
  const [siteMenus, setSiteMenus] = useState<Record<string, MenuConfig[]>>({
    medical: JSON.parse(JSON.stringify(STANDARD_MENUS)),
    ecommerce: JSON.parse(JSON.stringify(STANDARD_MENUS)),
    life: JSON.parse(JSON.stringify(STANDARD_MENUS)),
  });
  const [editMenu, setEditMenu] = useState<{site: string, id: string, label: string} | null>(null);

  const toggleMenu = (site: string, id: string) => {
    setSiteMenus(prev => ({
      ...prev,
      [site]: prev[site].map(m => m.id === id ? { ...m, isVisible: !m.isVisible } : m)
    }));
  };

  const updateMenuName = () => {
      if(editMenu) {
          setSiteMenus(prev => ({
              ...prev,
              [editMenu.site]: prev[editMenu.site].map(m => m.id === editMenu.id ? {...m, label: editMenu.label} : m)
          }));
          setEditMenu(null);
      }
  };

  return (
    <div className="bg-white rounded-xl border card-shadow flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      <div className="p-6 border-b"><h3 className="text-xl font-bold text-slate-800">菜单管理</h3></div>
      <div className="p-4 border-b bg-slate-50/50"><CategoryTabs selected={activeSite} onSelect={setActiveSite} /></div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {siteMenus[activeSite].map(menu => (
          <div key={menu.id} className="p-4 border rounded-xl bg-white flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Layout size={18}/></div>
              <span className="font-bold text-slate-700">{menu.label}</span>
              <button onClick={() => setEditMenu({site: activeSite, id: menu.id, label: menu.label})} className="text-slate-400 hover:text-blue-600 p-1"><Pencil size={14}/></button>
            </div>
            <ToggleSwitch enabled={menu.isVisible} onChange={() => toggleMenu(activeSite, menu.id)} />
          </div>
        ))}
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
  const [activeSite, setActiveSite] = useState('medical');
  const [categories, setCategories] = useState(MOCK_API_CATEGORIES);
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, platform: ApiPlatform | null}>({isOpen: false, platform: null});

  return (
    <div className="bg-white rounded-xl border card-shadow flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">API接口管理</h3>
          <button onClick={() => setModalConfig({isOpen: true, platform: null})} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-blue-700"><Plus size={16}/> 新增接口</button>
      </div>
      <div className="p-4 border-b bg-slate-50/50"><CategoryTabs selected={activeSite} onSelect={setActiveSite} /></div>
      <div className="flex-1 overflow-auto p-6 space-y-8">
        {categories.map(cat => (
           <div key={cat.id} className="border rounded-xl overflow-hidden">
             <div className="bg-slate-50 p-3 border-b font-bold text-slate-700 flex items-center gap-2">
               <Layers size={16}/> {cat.name}
             </div>
             <div className="p-4 space-y-4">
                {cat.platforms.filter(p => !p.site || p.site === activeSite).map(plat => (
                  <div key={plat.id} className="flex flex-col border rounded-lg bg-white overflow-hidden">
                     <div className="flex items-center justify-between p-4 bg-slate-50/30 border-b">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-800">{plat.name}</span>
                            {plat.nodeInfo && <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{plat.nodeInfo}</span>}
                        </div>
                        <div className="flex items-center gap-4">
                            <StatusBadge status={plat.isEnabled ? 'active' : 'suspended'} />
                            <button onClick={() => setModalConfig({isOpen: true, platform: plat})} className="text-blue-600 text-sm font-medium hover:underline">配置</button>
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
                {cat.platforms.filter(p => !p.site || p.site === activeSite).length === 0 && <div className="text-center text-slate-400 py-4 text-sm">该分类下暂无此站点的接口配置</div>}
             </div>
           </div>
        ))}
      </div>
      {modalConfig.isOpen && <ApiConfigModal platform={modalConfig.platform} onClose={() => setModalConfig({isOpen: false, platform: null})} />}
    </div>
  );
};

const ApiConfigModal = ({ platform, onClose }: { platform: ApiPlatform | null, onClose: () => void }) => {
    // Basic Info State
    const [basicInfo, setBasicInfo] = useState({ 
        name: platform?.name || '', 
        alias: platform?.alias || '', 
        site: platform?.site || 'medical', 
        node: platform?.nodeInfo || 'overseas' 
    });
    
    // Helper to generate unique ID
    const genId = () => Date.now() + Math.random().toString();

    // Helper: Create default KV or Text item
    const createItem = (type: 'text' | 'param') => ({ id: genId(), type, key: '', value: '' });

    // State for interfaces (Gen and Result)
    // We try to pre-fill from existing platform interfaces if available, otherwise default
    const existingGen = platform?.interfaces?.find(i => i.responseMode !== 'Result'); // Simplified assumption
    const existingRes = platform?.interfaces?.find(i => i.responseMode === 'Result'); // Simplified assumption

    const [genInterface, setGenInterface] = useState({ 
        url: existingGen?.url || '', 
        method: existingGen?.method || 'POST', 
        responseType: existingGen?.responseMode || 'JSON', 
        // Mock items for demo (parsing existing params would go here in real app)
        items: [createItem('param')] 
    });
    
    const [resultInterface, setResultInterface] = useState({ 
        url: existingRes?.url || '', 
        method: existingRes?.method || 'GET', 
        responseType: existingRes?.responseMode || 'JSON',
        items: [createItem('param')] 
    });

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
                            <select className="w-full p-2 border rounded" value={basicInfo.site} onChange={e => setBasicInfo({...basicInfo, site: e.target.value})}>
                                <option value="medical">医美类</option><option value="ecommerce">电商类</option><option value="life">生活服务类</option>
                            </select>
                        </FormItem>
                        <FormItem label="节点信息">
                            <select className="w-full p-2 border rounded" value={basicInfo.node} onChange={e => setBasicInfo({...basicInfo, node: e.target.value})}>
                                <option value="overseas">海外节点</option><option value="domestic">国内直连</option><option value="host">Host + 接口</option>
                            </select>
                        </FormItem>
                    </div>
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
                    <ConfigList items={resultInterface.items} setItems={(i: any) => setResultInterface({...resultInterface, items: i})} title="查询配置 (文本 / 参数)" />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium">取消</button>
                    <button className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">保存全部配置</button>
                </div>
            </div>
        </Modal>
    );
};

const PaymentManagement = () => {
  const [modal, setModal] = useState<{ isOpen: boolean, channel: string | null }>({ isOpen: false, channel: null });
  // Mock state for enabled channels
  const [enabledChannels, setEnabledChannels] = useState<Record<string, boolean>>({'微信支付': true, '支付宝支付': true, '对公转账': false});

  const toggleChannel = (ch: string) => {
      setEnabledChannels(prev => ({...prev, [ch]: !prev[ch]}));
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <h2 className="text-xl font-bold">支付管理</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['微信支付', '支付宝支付', '对公转账'].map(ch => (
          <div key={ch} className="bg-white p-6 rounded-xl border card-shadow transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-lg">{ch}</h4>
                <ToggleSwitch enabled={enabledChannels[ch]} onChange={() => toggleChannel(ch)} />
            </div>
            <p className="text-xs text-slate-400 mt-2 min-h-[40px]">配置{ch}的相关商户参数及密钥证书，支持文本直接输入。</p>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <StatusBadge status={enabledChannels[ch] ? 'active' : 'suspended'} />
                <button onClick={() => setModal({ isOpen: true, channel: ch })} className="text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100">配置参数</button>
            </div>
          </div>
        ))}
      </div>
      {modal.isOpen && (
        <Modal isOpen={true} onClose={() => setModal({ isOpen: false, channel: null })} title={`配置${modal.channel}`}>
            <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-4 border border-blue-100">请直接粘贴证书内容或密钥字符串，无需上传文件。</div>
            {modal.channel === '微信支付' && <>
                <FormItem label="普通商户号"><input className="w-full p-2 border rounded" /></FormItem>
                <FormItem label="V2微信支付秘钥"><input className="w-full p-2 border rounded" type="password" /></FormItem>
                <FormItem label="商户付款证书内容 (PEM)"><textarea className="w-full p-2 border rounded h-24 font-mono text-xs" placeholder="-----BEGIN CERTIFICATE-----..." /></FormItem>
                <FormItem label="商户付款私钥内容 (PEM)"><textarea className="w-full p-2 border rounded h-24 font-mono text-xs" placeholder="-----BEGIN PRIVATE KEY-----..." /></FormItem>
            </>}
            {modal.channel === '支付宝支付' && <>
                <FormItem label="AppID"><input className="w-full p-2 border rounded" /></FormItem>
                <FormItem label="支付宝公钥"><textarea className="w-full p-2 border rounded h-24 font-mono text-xs" /></FormItem>
                <FormItem label="应用私钥"><textarea className="w-full p-2 border rounded h-24 font-mono text-xs" /></FormItem>
            </>}
            {modal.channel === '对公转账' && <>
                <FormItem label="开户银行"><input className="w-full p-2 border rounded" /></FormItem>
                <FormItem label="银行账号"><input className="w-full p-2 border rounded" /></FormItem>
                <FormItem label="账户名称"><input className="w-full p-2 border rounded" /></FormItem>
            </>}
            <div className="pt-2">
                <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow hover:bg-blue-700 transition-colors" onClick={() => setModal({ isOpen: false, channel: null })}>保存配置</button>
            </div>
            </div>
        </Modal>
      )}
    </div>
  );
};

const GenerationRecords = () => {
  const [records, setRecords] = useState<GenerationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewRecord, setViewRecord] = useState<GenerationRecord | null>(null);
  
  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true);
      try {
        const data = await generationAPI.getGenerationRecords();
        setRecords(data);
      } catch (err: any) {
        alert('加载记录失败: ' + (err.message || '未知错误'));
      } finally {
        setLoading(false);
      }
    };
    loadRecords();
  }, []);
  
  return (
    <div className="bg-white rounded-xl border card-shadow h-[calc(100vh-140px)] flex flex-col animate-fade-in">
      <div className="p-6 border-b flex justify-between items-center"><h3 className="font-bold text-xl">用户生成记录</h3></div>
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
  const [activeCategory, setActiveCategory] = useState('medical');
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
      const data = await invitationAPI.getInvitations(activeCategory);
      setCodes(data);
    } catch (err: any) {
      alert('加载邀请码失败: ' + (err.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCodes(); }, [activeCategory]);
  
  const filteredCodes = codes;

  const generateCodes = async () => {
     try {
        await invitationAPI.generateInvitations({
          count: form.count,
          points: form.points,
          maxUses: form.maxUses,
          siteCategory: activeCategory,
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
      <div className="p-4 bg-slate-50/50 border-b"><CategoryTabs selected={activeCategory} onSelect={setActiveCategory} /></div>
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
      GenerationRecords={GenerationRecords}
      InvitationManagement={InvitationManagement}
      AccountManagement={AccountManagement}
    />
  ) : (
    <Login onLogin={handleLogin} />
  );
}

export default App;
