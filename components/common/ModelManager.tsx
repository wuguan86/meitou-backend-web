import React, { useState, useEffect } from 'react';
import { Plus, X, Edit, Trash2, Settings, ArrowLeft, Check } from 'lucide-react';
import { ModelConfig, ModelCostRule } from '../../types';
import FormItem from './FormItem';
import ToggleSwitch from './ToggleSwitch';

export interface ModelManagerProps {
  value: string;
  onChange: (value: string) => void;
}

export const ModelManager: React.FC<ModelManagerProps> = ({ value, onChange }) => {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);

  // Parse value on mount or when it changes externally
  useEffect(() => {
    try {
      if (!value) {
        setModels([]);
        return;
      }
      // Try parsing as JSON
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
        setModels(parsed);
      } else {
        throw new Error('Not a model config array');
      }
    } catch (e) {
      // Fallback: treat as # separated string
      const parts = value.split('#').filter(s => s.trim());
      const converted: ModelConfig[] = parts.map((name, idx) => ({
        id: Date.now().toString() + idx,
        name: name.trim(),
        label: name.trim(),
        type: 'image', // Default to image
        resolutions: [],
        ratios: [],
        durations: [],
        quantities: [],
        costRules: [],
        defaultCost: 0
      }));
      setModels(converted);
    }
  }, []); // Only run on mount to avoid loops, or we need deep comparison

  // Update parent when models change
  const updateParent = (newModels: ModelConfig[]) => {
    setModels(newModels);
    onChange(JSON.stringify(newModels));
  };

  const handleAddModel = () => {
    const newModel: ModelConfig = {
      id: Date.now().toString(),
      name: '',
      label: '',
      type: 'image',
      resolutions: [],
      ratios: [],
      durations: [],
      quantities: [],
      costRules: [],
      defaultCost: 10
    };
    setEditingModel(newModel);
  };

  const handleDeleteModel = (id: string) => {
    const newModels = models.filter(m => m.id !== id);
    updateParent(newModels);
  };

  const handleSaveModel = () => {
    if (!editingModel) return;
    if (!editingModel.name) {
      alert('请输入模型名称');
      return;
    }

    let newModels = [...models];
    const index = newModels.findIndex(m => m.id === editingModel.id);
    if (index >= 0) {
      newModels[index] = editingModel;
    } else {
      newModels.push(editingModel);
    }
    updateParent(newModels);
    setEditingModel(null);
  };

  if (editingModel) {
    return (
      <div className="border rounded-lg p-4 bg-slate-50 space-y-4">
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <button onClick={() => setEditingModel(null)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600">
            <ArrowLeft size={16} /> 返回列表
          </button>
          <span className="font-bold text-slate-700">{editingModel.name ? `编辑 ${editingModel.name}` : '新增模型'}</span>
          <button onClick={handleSaveModel} className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
            <Check size={16} /> 保存
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormItem label="模型ID (Name)" required>
            <input 
              className="w-full p-2 border rounded text-sm" 
              placeholder="例如: flux-1.0"
              value={editingModel.name}
              onChange={e => setEditingModel({...editingModel, name: e.target.value})}
            />
          </FormItem>
          <FormItem label="显示名称 (Label)">
            <input 
              className="w-full p-2 border rounded text-sm" 
              placeholder="例如: Flux Pro"
              value={editingModel.label || ''}
              onChange={e => setEditingModel({...editingModel, label: e.target.value})}
            />
          </FormItem>
        </div>

        <FormItem label="模型类型">
            <select 
                className="w-full p-2 border rounded text-sm"
                value={editingModel.type}
                onChange={e => setEditingModel({...editingModel, type: e.target.value as 'image' | 'video' | 'chat' | 'analysis'})}
            >
                <option value="image">图片模型 (Image)</option>
                <option value="video">视频模型 (Video)</option>
                <option value="chat">对话模型 (Chat)</option>
                <option value="analysis">分析模型 (Analysis)</option>
            </select>
        </FormItem>

        {editingModel.type === 'analysis' && (
             <FormItem label="系统设定chart的对象画像">
                <textarea 
                    className="w-full p-2 border rounded text-sm min-h-[100px]"
                    placeholder="请输入系统设定chart的对象画像..."
                    value={editingModel.chartProfile || ''}
                    onChange={e => setEditingModel({...editingModel, chartProfile: e.target.value})}
                />
            </FormItem>
        )}

        {!['chat', 'analysis'].includes(editingModel.type) && (
          <>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600">支持的分辨率</span>
                    <span className="text-xs text-slate-400">输入后按回车添加</span>
                </div>
                <TagInput 
                    tags={editingModel.resolutions} 
                    onChange={tags => setEditingModel({...editingModel, resolutions: tags})} 
                    placeholder="例如: 1K"
                />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600">支持的比例</span>
                    <span className="text-xs text-slate-400">输入后按回车添加</span>
                </div>
                <TagInput 
                    tags={editingModel.ratios} 
                    onChange={tags => setEditingModel({...editingModel, ratios: tags})} 
                    placeholder="例如: 1:1"
                />
            </div>
          </>
        )}

        {editingModel.type === 'image' && (
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600">支持的数量</span>
                    <span className="text-xs text-slate-400">输入后按回车添加</span>
                </div>
                <TagInput 
                    tags={editingModel.quantities?.map(q => q.toString()) || []} 
                    onChange={tags => setEditingModel({...editingModel, quantities: tags.map(t => parseInt(t) || 0)})} 
                    placeholder="例如: 1"
                />
            </div>
        )}

        {editingModel.type === 'video' && (
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600">支持的时长 (秒)</span>
                </div>
                <TagInput 
                    tags={editingModel.durations?.map(d => d.toString()) || []} 
                    onChange={tags => setEditingModel({...editingModel, durations: tags.map(t => parseInt(t) || 0)})} 
                    placeholder="例如: 5"
                />
            </div>
        )}

        {editingModel.type !== 'chat' && (
            <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2"><Settings size={16}/> 算力消耗配置</h4>
                </div>
                
                <FormItem label="默认消耗">
                    <input 
                      type="number"
                      min="1"
                      className="w-full p-2 border rounded text-sm" 
                      value={editingModel.defaultCost || ''}
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val > 0) {
                            setEditingModel({...editingModel, defaultCost: val});
                        } else if (e.target.value === '') {
                            setEditingModel({...editingModel, defaultCost: 0});
                        }
                      }}
                      onBlur={() => {
                        if (!editingModel.defaultCost || editingModel.defaultCost <= 0) {
                            setEditingModel({...editingModel, defaultCost: 1});
                        }
                      }}
                      placeholder="请输入算力消耗"
                    />
                    <p className="text-xs text-slate-400 mt-1">请输入正整数</p>
                </FormItem>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-3 bg-slate-50/50">
      <div className="space-y-2">
        {models.map(model => (
          <div key={model.id} className="flex items-center justify-between bg-white p-3 border rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded text-white text-xs font-bold ${
                    model.type === 'video' ? 'bg-purple-500' : 
                    model.type === 'chat' ? 'bg-green-500' : 
                    model.type === 'analysis' ? 'bg-orange-500' : 'bg-blue-500'
                }`}>
                    {model.type === 'video' ? 'VIDEO' : 
                     model.type === 'chat' ? 'CHAT' : 
                     model.type === 'analysis' ? 'ANALYSIS' : 'IMG'}
                </div>
                <div>
                    <div className="font-bold text-slate-700 text-sm">{model.name}</div>
                    <div className="text-xs text-slate-400">{model.resolutions.length} 规格 · 默认消耗 {model.defaultCost}</div>
                </div>
            </div>
            <div className="flex gap-1">
                <button onClick={() => setEditingModel(model)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                    <Edit size={14} />
                </button>
                <button onClick={() => handleDeleteModel(model.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={14} />
                </button>
            </div>
          </div>
        ))}
        
        {models.length === 0 && (
            <div className="text-center text-xs text-slate-400 py-4">暂无模型配置</div>
        )}

        <button 
            onClick={handleAddModel}
            className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:border-blue-300 hover:text-blue-600 flex items-center justify-center gap-2 text-sm font-bold transition-colors"
        >
            <Plus size={16} /> 添加模型
        </button>
      </div>
    </div>
  );
};

const TagInput = ({ tags, onChange, placeholder }: { tags: string[], onChange: (tags: string[]) => void, placeholder: string }) => {
    const [input, setInput] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (input.trim()) {
                if (!tags.includes(input.trim())) {
                    onChange([...tags, input.trim()]);
                }
                setInput('');
            }
        }
    };

    const removeTag = (tag: string) => {
        onChange(tags.filter(t => t !== tag));
    };

    return (
        <div className="flex flex-wrap gap-2 p-2 border rounded bg-white min-h-[42px]">
            {tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-slate-100 border rounded text-xs text-slate-700 flex items-center gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={12}/></button>
                </span>
            ))}
            <input 
                className="flex-1 min-w-[100px] outline-none text-sm"
                placeholder={tags.length === 0 ? placeholder : ''}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                    if (input.trim()) {
                        if (!tags.includes(input.trim())) {
                            onChange([...tags, input.trim()]);
                        }
                        setInput('');
                    }
                }}
            />
        </div>
    );
};


