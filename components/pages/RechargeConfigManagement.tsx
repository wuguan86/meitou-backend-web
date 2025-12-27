import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { getRechargeConfigs, createRechargeConfig, updateRechargeConfig, deleteRechargeConfig, RechargeConfig, RechargeOption } from '../../api/rechargeConfig';
import Modal from '../common/Modal';
import FormItem from '../common/FormItem';
import CategoryTabs from '../common/CategoryTabs';
import StatusBadge from '../common/StatusBadge';
import ToggleSwitch from '../common/ToggleSwitch';
import { SITES, SiteId } from '../../constants/sites';

const RechargeConfigManagement: React.FC = () => {
  const [activeSiteId, setActiveSiteId] = useState<SiteId>(SITES.MEDICAL);
  const [configs, setConfigs] = useState<RechargeConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState<{ isOpen: boolean; config: RechargeConfig | null }>({ isOpen: false, config: null });
  const [formData, setFormData] = useState<Partial<RechargeConfig>>({});

  // 加载配置列表
  const loadConfigs = async (siteId: SiteId) => {
    setLoading(true);
    try {
      const data = await getRechargeConfigs(siteId);
      setConfigs(data);
    } catch (err: any) {
      alert('加载配置失败: ' + (err.message || '未知错误'));
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  // 当站点ID改变时，重新加载配置
  useEffect(() => {
    loadConfigs(activeSiteId);
  }, [activeSiteId]);

  // 获取当前站点的配置（应该只有一个）
  const currentConfig = configs.length > 0 ? configs[0] : null;

  // 打开编辑弹窗
  const openEditModal = (config?: RechargeConfig) => {
    if (config) {
      // 编辑模式
      setFormData({
        siteId: config.siteId,
        exchangeRate: config.exchangeRate,
        minAmount: config.minAmount,
        optionsJson: config.optionsJson,
        allowCustom: config.allowCustom,
        isEnabled: config.isEnabled,
      });
      setEditModal({ isOpen: true, config });
    } else {
      // 新建模式
      setFormData({
        siteId: activeSiteId,
        exchangeRate: 10,
        minAmount: 5,
        optionsJson: JSON.stringify([
          { points: 300, price: 30 },
          { points: 500, price: 50 },
          { points: 1000, price: 100 },
          { points: 5000, price: 500 },
          { points: 10000, price: 1000 },
        ]),
        allowCustom: true,
        isEnabled: true,
      });
      setEditModal({ isOpen: true, config: null });
    }
  };

  // 解析选项JSON
  const parseOptions = (jsonStr: string): RechargeOption[] => {
    try {
      return JSON.parse(jsonStr || '[]');
    } catch {
      return [];
    }
  };

  // 格式化选项JSON
  const formatOptions = (options: RechargeOption[]): string => {
    return JSON.stringify(options, null, 2);
  };

  // 保存配置
  const handleSave = async () => {
    try {
      // 验证必填字段
      if (!formData.exchangeRate || formData.exchangeRate <= 0) {
        alert('兑换比例必须大于0');
        return;
      }
      if (!formData.minAmount || formData.minAmount <= 0) {
        alert('最低充值金额必须大于0');
        return;
      }

      // 验证选项JSON格式
      try {
        const options = parseOptions(formData.optionsJson || '[]');
        if (options.length === 0) {
          alert('至少需要配置一个充值选项');
          return;
        }
        for (const opt of options) {
          if (!opt.points || opt.points <= 0) {
            alert('算力点数必须大于0');
            return;
          }
          if (!opt.price || opt.price <= 0) {
            alert('价格必须大于0');
            return;
          }
        }
      } catch (e) {
        alert('充值选项JSON格式错误');
        return;
      }

      // 确保formData包含当前站点的siteId
      const finalFormData = {
        ...formData,
        siteId: activeSiteId
      };

      if (editModal.config) {
        // 更新
        await updateRechargeConfig(editModal.config.id, finalFormData);
        alert('更新成功');
      } else {
        // 创建
        await createRechargeConfig(finalFormData);
        alert('创建成功');
      }

      await loadConfigs(activeSiteId);
      setEditModal({ isOpen: false, config: null });
    } catch (err: any) {
      alert('保存失败: ' + (err.message || '未知错误'));
    }
  };

  // 删除配置
  const handleDelete = async (id: string) => {
    if (!window.confirm('确认删除该配置吗？删除后无法恢复！')) {
      return;
    }
    try {
      await deleteRechargeConfig(id, activeSiteId);
      alert('删除成功');
      await loadConfigs(activeSiteId);
    } catch (err: any) {
      alert('删除失败: ' + (err.message || '未知错误'));
    }
  };

  // 切换启用状态
  const toggleEnabled = async (config: RechargeConfig) => {
    try {
      await updateRechargeConfig(config.id, { 
        siteId: config.siteId || activeSiteId, 
        isEnabled: !config.isEnabled 
      });
      await loadConfigs(activeSiteId);
    } catch (err: any) {
      alert('更新失败: ' + (err.message || '未知错误'));
    }
  };

  const options = currentConfig ? parseOptions(currentConfig.optionsJson) : [];

  return (
    <div className="bg-white rounded-xl border card-shadow flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">充值配置管理</h3>
        <button
          onClick={() => openEditModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-blue-700"
        >
          <Plus size={16} /> {currentConfig ? '编辑配置' : '创建配置'}
        </button>
      </div>

      <div className="p-4 border-b bg-slate-50/50">
        <CategoryTabs selected={activeSiteId} onSelect={setActiveSiteId} />
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">加载中...</div>
        ) : currentConfig ? (
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg text-slate-800">基本信息</h4>
                <div className="flex items-center gap-4">
                  <StatusBadge status={currentConfig.isEnabled ? 'active' : 'suspended'} />
                  <ToggleSwitch
                    enabled={currentConfig.isEnabled}
                    onChange={() => toggleEnabled(currentConfig)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">兑换比例</label>
                  <p className="text-lg font-bold text-slate-800">1 元 = {currentConfig.exchangeRate} 算力</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">最低充值金额</label>
                  <p className="text-lg font-bold text-slate-800">¥ {currentConfig.minAmount}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">是否启用自定义金额</label>
                  <p className="text-sm text-slate-700">{currentConfig.allowCustom ? '是' : '否'}</p>
                </div>
              </div>
            </div>

            {/* 充值选项 */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg text-slate-800">充值选项</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {options.map((opt, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-black text-slate-800">{opt.points}</span>
                      <span className="text-xs text-slate-500 uppercase font-bold">PTS</span>
                    </div>
                    <p className="text-lg font-bold text-blue-600">¥ {opt.price}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4">
              <button
                onClick={() => openEditModal(currentConfig)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                <Edit size={16} /> 编辑配置
              </button>
              <button
                onClick={() => handleDelete(currentConfig.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                <Trash2 size={16} /> 删除配置
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <p className="mb-4">该站点暂无充值配置</p>
            <button
              onClick={() => openEditModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
            >
              <Plus size={16} /> 创建配置
            </button>
          </div>
        )}
      </div>

      {/* 编辑弹窗 */}
      {editModal.isOpen && (
        <Modal
          isOpen={true}
          onClose={() => setEditModal({ isOpen: false, config: null })}
          title={editModal.config ? '编辑充值配置' : '创建充值配置'}
          size="lg"
        >
          <div className="space-y-4">
            <FormItem label="站点">
              <select
                className="w-full p-2 border rounded"
                value={formData.siteId || SITES.MEDICAL}
                disabled={!!editModal.config}
                onChange={(e) => setFormData({ ...formData, siteId: parseInt(e.target.value) as SiteId })}
              >
                <option value={SITES.MEDICAL}>医美类</option>
                <option value={SITES.ECOMMERCE}>电商类</option>
                <option value={SITES.LIFE}>生活服务类</option>
              </select>
            </FormItem>

            <div className="grid grid-cols-2 gap-4">
              <FormItem label="兑换比例（1元 = X算力）" required>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={formData.exchangeRate || ''}
                  onChange={(e) => setFormData({ ...formData, exchangeRate: parseInt(e.target.value) || 0 })}
                  min="1"
                />
              </FormItem>
              <FormItem label="最低充值金额（元）" required>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={formData.minAmount || ''}
                  onChange={(e) => setFormData({ ...formData, minAmount: parseInt(e.target.value) || 0 })}
                  min="1"
                />
              </FormItem>
            </div>

            <FormItem label="是否启用自定义金额">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.allowCustom || false}
                  onChange={(e) => setFormData({ ...formData, allowCustom: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-600">允许用户输入自定义充值金额</span>
              </div>
            </FormItem>

            <FormItem label="是否启用">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isEnabled !== false}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-600">启用后用户端将显示此配置</span>
              </div>
            </FormItem>

            <FormItem label="充值选项列表（JSON格式）" required>
              <textarea
                className="w-full p-2 border rounded font-mono text-sm"
                rows={10}
                value={formData.optionsJson || ''}
                onChange={(e) => setFormData({ ...formData, optionsJson: e.target.value })}
                placeholder='[{"points": 300, "price": 30}, {"points": 500, "price": 50}]'
              />
              <p className="text-xs text-slate-500 mt-1">
                格式：JSON数组，每个选项包含 points（算力点数）和 price（价格，元）
              </p>
            </FormItem>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setEditModal({ isOpen: false, config: null })}
                className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
              >
                <Save size={16} /> 保存配置
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RechargeConfigManagement;

