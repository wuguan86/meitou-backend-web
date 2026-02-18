import React, { useState, useEffect } from 'react';
import { Save, Info } from 'lucide-react';
import { message } from 'antd';
import { SITES, SiteId, getSiteName } from '../../constants/sites';
import { getPromptHelperConfig, savePromptHelperConfig, PromptHelperConfig } from '../../api/promptHelper';

const PromptHelperManagement = () => {
  const [activeSiteId, setActiveSiteId] = useState<SiteId>(SITES.MEDICAL);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<PromptHelperConfig>({
    subjectEnhancement: '',
    sceneEnhancement: '',
    cameraComposition: '',
    lightQuality: '',
    detailEnhancement: ''
  });

  // 加载配置
  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        const data = await getPromptHelperConfig(activeSiteId);
        setConfig(data || {
          subjectEnhancement: '',
          sceneEnhancement: '',
          cameraComposition: '',
          lightQuality: '',
          detailEnhancement: ''
        });
      } catch (error) {
        console.error('加载配置失败:', error);
        message.error('加载配置失败');
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, [activeSiteId]);

  // 保存配置
  const handleSave = async () => {
    setSaving(true);
    try {
      await savePromptHelperConfig(activeSiteId, config);
      message.success('保存成功');
    } catch (error) {
      console.error('保存配置失败:', error);
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof PromptHelperConfig, value: string | number | undefined) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* 顶部标题和操作栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">提示词分段配置</h1>
          <p className="text-slate-500 mt-1 text-sm">MASTER PROMPT ENHANCEMENT MODULES</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* 站点切换 */}
          <div className="bg-white p-1 rounded-lg border border-slate-200 inline-flex shadow-sm">
            {Object.values(SITES).map((siteId) => (
              <button
                key={siteId}
                onClick={() => setActiveSiteId(siteId as SiteId)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeSiteId === siteId
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {getSiteName(siteId)}
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium"
          >
            <Save size={18} />
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-slate-500">
          加载中...
        </div>
      ) : (
        <div className="space-y-6">
          {/* 基础配置 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-slate-800 rounded-full"></div>
              <h3 className="font-bold text-slate-800">基础配置 (BASIC CONFIGURATION)</h3>
            </div>
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                算力消耗 (Compute Consumption)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={config.computeConsumption ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    // 允许空字符串以便删除，否则解析为整数
                    handleChange('computeConsumption', val === '' ? undefined : parseInt(val));
                  }}
                  className="w-full p-2.5 pr-12 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-700"
                  placeholder="0"
                />
                <div className="absolute right-3 top-2.5 text-slate-400 text-sm">点数</div>
              </div>
              <p className="mt-2 text-xs text-slate-400">每次使用提示词优化功能消耗的算力点数（正整数）</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 主体强化 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                <h3 className="font-bold text-slate-800">主体强化 (SUBJECT ENHANCEMENT)</h3>
              </div>
              <textarea
                value={config.subjectEnhancement || ''}
                onChange={(e) => handleChange('subjectEnhancement', e.target.value)}
                placeholder="人物形象：美国人，面带微笑，拿着耳机产品，多人关系：沟通中"
                className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-slate-700 placeholder:text-slate-400"
              />
              <p className="mt-2 text-xs text-slate-400">配置角色细节、职业、动作特征等关键词模板</p>
            </div>

            {/* 场景强化 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                <h3 className="font-bold text-slate-800">场景强化 (SCENE ENHANCEMENT)</h3>
              </div>
              <textarea
                value={config.sceneEnhancement || ''}
                onChange={(e) => handleChange('sceneEnhancement', e.target.value)}
                placeholder="场景：耳机售卖的卖场，干净，有耳机，电脑，窗外有绿植"
                className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-slate-700 placeholder:text-slate-400"
              />
              <p className="mt-2 text-xs text-slate-400">配置环境背景、室内装饰、氛围物体等关键词模板</p>
            </div>

            {/* 构图与视角增强 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                <h3 className="font-bold text-slate-800">机位与构图强化 (CAMERA & COMPOSITION)</h3>
              </div>
              <textarea
                value={config.cameraComposition || ''}
                onChange={(e) => handleChange('cameraComposition', e.target.value)}
                placeholder="中景镜头，正面视角，构图：三分法，静态展示"
                className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-slate-700 placeholder:text-slate-400"
              />
              <p className="mt-2 text-xs text-slate-400">配置镜头角度、景深深度、构图法则等关键词模板</p>
            </div>

            {/* 光影与画质增强 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-yellow-500 rounded-full"></div>
                <h3 className="font-bold text-slate-800">光线与画质强化 (LIGHT & QUALITY)</h3>
              </div>
              <textarea
                value={config.lightQuality || ''}
                onChange={(e) => handleChange('lightQuality', e.target.value)}
                placeholder="柔和自然光，工作室画质，真实感，细节丰富"
                className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-slate-700 placeholder:text-slate-400"
              />
              <p className="mt-2 text-xs text-slate-400">配置光影效果、渲染质量、色彩空间等关键词模板</p>
            </div>
          </div>

          {/* 细节与修饰增强 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-pink-500 rounded-full"></div>
              <h3 className="font-bold text-slate-800">细节与部位强化 (DETAIL ENHANCEMENT)</h3>
            </div>
            <textarea
              value={config.detailEnhancement || ''}
              onChange={(e) => handleChange('detailEnhancement', e.target.value)}
              placeholder="皮肤纹理清晰，白大褂褶皱真实，眼神深邃"
              className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-slate-700 placeholder:text-slate-400"
            />
            <p className="mt-2 text-xs text-slate-400">配置微观纹理、生物特征、特定质感等关键词模板</p>
          </div>

          {/* 底部说明 */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-bold mb-1">使用说明</p>
              <p>管理员在此处配置的强化提示词将作为 AI Prompt Master 的底层知识库。当用户在前端点击对应的强化模块时，系统会结合用户输入的初级创意，自动补全高质量、结构化的提示词。确保仅各分类下的深度具备高度的相关性和专业度。</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptHelperManagement;
