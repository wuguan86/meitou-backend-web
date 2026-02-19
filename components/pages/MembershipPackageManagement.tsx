import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, Crown, Save, DollarSign, Calendar, Star, Info } from 'lucide-react';
import { message, Modal as AntModal, Tooltip } from 'antd';
import { getPackages, createPackage, updatePackage, deletePackage, MembershipPackage } from '../../api/membershipPackage';
import Modal from '../common/Modal';
import FormItem from '../common/FormItem';
import CategoryTabs from '../common/CategoryTabs';
import StatusBadge from '../common/StatusBadge';
import ToggleSwitch from '../common/ToggleSwitch';
import { SITES, SiteId } from '../../constants/sites';

const MembershipPackageManagement: React.FC = () => {
  const [activeSiteId, setActiveSiteId] = useState<SiteId>(SITES.MEDICAL);
  const [packages, setPackages] = useState<MembershipPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; pkg: MembershipPackage | null }>({ isOpen: false, pkg: null });
  const [formData, setFormData] = useState<Partial<MembershipPackage>>({});
  const [features, setFeatures] = useState<string[]>([]);

  // 加载套餐列表
  const loadPackages = async (siteId: SiteId) => {
    setLoading(true);
    try {
      const data = await getPackages(siteId);
      setPackages(data);
    } catch (err: any) {
      console.error('加载套餐失败:', err);
      message.error('加载套餐失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages(activeSiteId);
  }, [activeSiteId]);

  // 打开编辑/新建弹窗
  const openModal = (pkg?: MembershipPackage) => {
    if (pkg) {
      setFormData({ ...pkg });
      try {
        setFeatures(JSON.parse(pkg.featuresJson || '[]'));
      } catch {
        setFeatures([]);
      }
      setModal({ isOpen: true, pkg });
    } else {
      setFormData({
        siteId: activeSiteId,
        isActive: true,
        isRecommended: false,
        sortOrder: 0,
        buttonText: '立即订阅',
        buttonType: 'buy',
        levelCode: 'standard',
        monthlyPrice: 0,
        monthlyDiscountPrice: 0,
        yearlyPrice: 0,
        yearlyDiscountPrice: 0,
        pointsReward: 0,
        primaryColor: '',
      });
      setFeatures(['每月 800 积分', '生成高清视频', '快速通道生成']);
      setModal({ isOpen: true, pkg: null });
    }
  };

  // 保存套餐
  const handleSave = async () => {
    try {
      if (!formData.name) {
        message.warning('请输入套餐名称');
        return;
      }
      if (!formData.levelCode) {
        message.warning('请输入等级代码');
        return;
      }

      const dataToSave = {
        ...formData,
        featuresJson: JSON.stringify(features),
        siteId: activeSiteId, // 确保 siteId 正确
      };

      if (modal.pkg) {
        await updatePackage(modal.pkg.id, activeSiteId, dataToSave);
        message.success('更新成功');
      } else {
        await createPackage(activeSiteId, dataToSave);
        message.success('创建成功');
      }
      setModal({ isOpen: false, pkg: null });
      loadPackages(activeSiteId);
    } catch (err: any) {
      console.error('保存失败:', err);
      message.error('保存失败: ' + (err.message || '未知错误'));
    }
  };

  // 删除套餐
  const handleDelete = (pkg: MembershipPackage) => {
    AntModal.confirm({
      title: '确认删除',
      content: `确定要删除套餐 "${pkg.name}" 吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          await deletePackage(pkg.id, activeSiteId);
          message.success('删除成功');
          loadPackages(activeSiteId);
        } catch (err: any) {
          message.error('删除失败: ' + (err.message || '未知错误'));
        }
      },
    });
  };

  // 切换启用状态
  const toggleActive = async (pkg: MembershipPackage) => {
    try {
      await updatePackage(pkg.id, activeSiteId, { isActive: !pkg.isActive });
      // 本地更新，避免重新加载导致的闪烁
      setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, isActive: !p.isActive } : p));
      message.success(pkg.isActive ? '已下架' : '已上架');
    } catch (err: any) {
      message.error('操作失败');
    }
  };

  // 特性列表操作
  const addFeature = () => setFeatures([...features, '']);
  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };
  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    setFeatures(newFeatures);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 card-shadow flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Crown className="text-yellow-500" size={24} />
          会员配置管理
        </h3>
        <button
          onClick={() => openModal()}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-slate-800 transition-colors"
        >
          <Plus size={16} /> 创建新套餐
        </button>
      </div>

      <div className="p-4 border-b bg-slate-50/50">
        <CategoryTabs selected={activeSiteId} onSelect={setActiveSiteId} />
      </div>

      <div className="flex-1 overflow-auto p-6 bg-slate-50">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">加载中...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {packages.map(pkg => (
              <div key={pkg.id} className={`bg-white rounded-xl border-2 transition-all duration-200 overflow-hidden flex flex-col relative group ${pkg.isRecommended ? 'border-purple-500 shadow-md' : 'border-slate-100 hover:border-slate-300 shadow-sm hover:shadow-md'}`}>
                {/* 推荐角标 */}
                {pkg.isRecommended && (
                  <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                    RECOMMENDED
                  </div>
                )}
                
                <div className="p-6 flex-1 flex flex-col">
                  {/* 顶部状态栏和操作按钮 */}
                  <div className="flex justify-between items-start mb-6">
                    <StatusBadge status={pkg.isActive ? 'active' : 'hidden'} />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openModal(pkg)}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200 hover:border-blue-200"
                        title="编辑套餐"
                      >
                        <Edit size={14} />
                      </button>
                      {/* <button 
                        onClick={() => handleDelete(pkg)}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 hover:border-red-200"
                        title="删除套餐"
                      >
                        <Trash2 size={14} />
                      </button> */}
                    </div>
                  </div>

                  {/* 价格和名称信息 */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-bold text-blue-600">￥{pkg.monthlyDiscountPrice}</span>
                      <span className="text-slate-400 text-sm">/月</span>
                    </div>
                    
                    <div className="text-lg font-bold text-slate-800 mb-2">
                      {pkg.name}
                    </div>

                    {pkg.badgeText && (
                      <div className="inline-block text-purple-600 bg-purple-50 text-xs font-bold px-2 py-1 rounded mb-2">
                        {pkg.badgeText}
                      </div>
                    )}
                    
                    <div className="text-sm text-slate-400 italic mt-4 min-h-[20px]">
                      {Number(pkg.monthlyPrice) > Number(pkg.monthlyDiscountPrice) ? (
                        `"下个月续费金额: ￥${pkg.monthlyPrice}"`
                      ) : (
                        <span className="opacity-0">Placeholder</span>
                      )}
                    </div>
                  </div>

                  {/* 特性列表 */}
                  <div className="space-y-3 mb-6 flex-1">
                    {(() => {
                      try {
                        const feats = JSON.parse(pkg.featuresJson || '[]');
                        return feats.map((feat: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                            <Check size={16} className="text-blue-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ));
                      } catch {
                        return <div className="text-red-400 text-xs">JSON格式错误</div>;
                      }
                    })()}
                    
                    {pkg.pointsReward > 0 && (
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        {/* <Check size={16} className="text-blue-500 shrink-0 mt-0.5" />
                        <span>每月 {pkg.pointsReward} 积分</span> */}
                      </div>
                    )}
                  </div>

                  {/* 底部可见性切换 */}
                  <div className="pt-4 mt-auto flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 tracking-[0.2em] uppercase">VISIBILITY</span>
                    <ToggleSwitch enabled={pkg.isActive} onChange={() => toggleActive(pkg)} />
                  </div>
                </div>
              </div>
            ))}
            
            {/* 创建新套餐卡片 */}
            <div 
              onClick={() => openModal()}
              className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer min-h-[400px] group"
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus size={32} className="text-slate-400 group-hover:text-blue-500" />
              </div>
              <h4 className="text-lg font-bold text-slate-600 group-hover:text-blue-600">创建新订阅套餐</h4>
              <p className="text-sm text-slate-400 mt-2">添加新的会员等级和权益配置</p>
            </div>
          </div>
        )}
      </div>

      {/* 编辑弹窗 */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, pkg: null })}
        title={modal.pkg ? '编辑套餐' : '创建套餐'}
        size="lg"
        footer={
          <>
            <button
              onClick={() => setModal({ isOpen: false, pkg: null })}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm shadow-blue-200"
            >
              保存配置
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 border-b pb-2 mb-4">基本信息</h4>
            
            <FormItem label="套餐名称" required>
              <input
                type="text"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="如：标准版"
              />
            </FormItem>
            
            <FormItem label="等级代码 (英文标识)" required>
              <input
                type="text"
                value={formData.levelCode || ''}
                onChange={e => setFormData({ ...formData, levelCode: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="如：standard, pro"
              />
            </FormItem>

            <FormItem label="顶部标签文案">
              <input
                type="text"
                value={formData.badgeText || ''}
                onChange={e => setFormData({ ...formData, badgeText: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="如：首购8.5折"
              />
            </FormItem>

            <FormItem label="主题色">
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.primaryColor || '#000000'}
                  onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-10 h-10 p-1 border rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor || ''}
                  onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="如：#A855F7"
                />
              </div>
            </FormItem>
            
            <div className="flex gap-4">
              <FormItem label="排序权重" className="flex-1">
                <input
                  type="number"
                  value={formData.sortOrder ?? ''}
                  onChange={e => setFormData({ ...formData, sortOrder: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </FormItem>
              <FormItem label="是否推荐" className="flex-1">
                <div className="h-[42px] flex items-center">
                   <ToggleSwitch 
                     enabled={formData.isRecommended || false} 
                     onChange={v => setFormData({ ...formData, isRecommended: v })} 
                   />
                   <span className="ml-2 text-sm text-slate-500">{formData.isRecommended ? '是' : '否'}</span>
                </div>
              </FormItem>
            </div>
            
            <div className="flex gap-4">
              <FormItem label="按钮文字" className="flex-1">
                <input
                  type="text"
                  value={formData.buttonText || '立即订阅'}
                  onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </FormItem>
              <FormItem label="按钮类型" className="flex-1">
                <select
                  value={formData.buttonType || 'buy'}
                  onChange={e => setFormData({ ...formData, buttonType: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="buy">直接支付</option>
                  <option value="contact">咨询客服</option>
                </select>
              </FormItem>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 border-b pb-2 mb-4">价格与权益</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <FormItem label="月付原价">
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400">￥</span>
                  <input
                    type="number"
                    value={formData.monthlyPrice ?? ''}
                    onChange={e => setFormData({ ...formData, monthlyPrice: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                    className="w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </FormItem>
              <FormItem label="月付优惠价">
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400">￥</span>
                  <input
                    type="number"
                    value={formData.monthlyDiscountPrice ?? ''}
                    onChange={e => setFormData({ ...formData, monthlyDiscountPrice: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                    className="w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600"
                  />
                </div>
              </FormItem>
              <FormItem label="年付原价">
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400">￥</span>
                  <input
                    type="number"
                    value={formData.yearlyPrice ?? ''}
                    onChange={e => setFormData({ ...formData, yearlyPrice: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                    className="w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </FormItem>
              <FormItem label="年付优惠价">
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400">￥</span>
                  <input
                    type="number"
                    value={formData.yearlyDiscountPrice ?? ''}
                    onChange={e => setFormData({ ...formData, yearlyDiscountPrice: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                    className="w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600"
                  />
                </div>
              </FormItem>
            </div>

            <FormItem label="赠送算力值 (每月)">
              <div className="relative">
                <Star size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="number"
                  value={formData.pointsReward ?? ''}
                  onChange={e => setFormData({ ...formData, pointsReward: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </FormItem>

            <FormItem label="权益列表">
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={feat}
                      onChange={e => updateFeature(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="输入权益描述"
                    />
                    <button
                      onClick={() => removeFeature(idx)}
                      className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addFeature}
                  className="w-full py-1.5 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> 添加权益
                </button>
              </div>
            </FormItem>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MembershipPackageManagement;
