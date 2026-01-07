import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter,
  RefreshCw,
  ArrowRight,
  CheckCircle,
  XCircle,
  GitBranch
} from 'lucide-react';
import { message, Modal as AntModal, Table, Tag, Tooltip, Select } from 'antd';
import CategoryTabs from '../common/CategoryTabs';
import Modal from '../common/Modal';
import FormItem from '../common/FormItem';
import ToggleSwitch from '../common/ToggleSwitch';
import { SITES, SiteId, SITE_NAMES, SITE_IDS } from '../../constants/sites';
import { ApiParameterMapping, ApiPlatform } from '../../types';
import * as apiParameterMappingAPI from '../../api/apiParameterMapping';
import * as apiPlatformAPI from '../../api/apiPlatform';

const ApiParameterMappingManagement: React.FC = () => {
  const [activeSiteId, setActiveSiteId] = useState<SiteId>(SITES.MEDICAL);
  const [loading, setLoading] = useState(false);
  const [mappings, setMappings] = useState<ApiParameterMapping[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  
  // Filters
  const [platforms, setPlatforms] = useState<ApiPlatform[]>([]);
  const [filterPlatformId, setFilterPlatformId] = useState<string>('');
  const [filterModelName, setFilterModelName] = useState<string>('');

  // Edit/Create Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<ApiParameterMapping | null>(null);
  const [formData, setFormData] = useState<apiParameterMappingAPI.ApiParameterMappingRequest>({
    platformId: '',
    modelName: '',
    internalParam: '',
    targetParam: '',
    fixedValue: '',
    defaultValue: '',
    description: '',
    mappingType: 1,
    isRequired: false,
    paramLocation: 'body',
    paramType: 'string',
    siteId: SITES.MEDICAL
  });

  // Modal platforms (depends on selected site in modal)
  const [modalPlatforms, setModalPlatforms] = useState<ApiPlatform[]>([]);

  useEffect(() => {
    if (modalOpen) {
      if (formData.siteId === activeSiteId) {
        setModalPlatforms(platforms);
      } else {
        apiPlatformAPI.getPlatforms(formData.siteId).then(list => {
          setModalPlatforms(list || []);
        });
      }
    }
  }, [formData.siteId, modalOpen, activeSiteId, platforms]);

  const loadPlatforms = async () => {
    try {
      const list = await apiPlatformAPI.getPlatforms(activeSiteId);
      setPlatforms(list || []);
    } catch (err) {
      console.error('Failed to load platforms', err);
    }
  };

  const loadData = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const result = await apiParameterMappingAPI.getList(
        page, 
        size, 
        activeSiteId,
        filterPlatformId || undefined, 
        filterModelName || undefined
      );
      setMappings(result.records);
      setPagination({
        current: result.current,
        pageSize: result.size,
        total: result.total
      });
    } catch (err: any) {
      message.error('加载失败: ' + (err.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlatforms();
    loadData(1, pagination.pageSize);
  }, [activeSiteId]);

  const handleSearch = () => {
    loadData(1, pagination.pageSize);
  };

  const handleEdit = (record: ApiParameterMapping) => {
    setEditingMapping(record);
    setFormData({
      platformId: record.platformId,
      modelName: record.modelName || '',
      internalParam: record.internalParam,
      targetParam: record.targetParam,
      fixedValue: record.fixedValue || '',
      defaultValue: record.defaultValue || '',
      description: record.description || '',
      mappingType: record.mappingType,
      isRequired: record.isRequired,
      paramLocation: record.paramLocation,
      paramType: record.paramType || 'string',
      siteId: record.siteId
    });
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingMapping(null);
    setFormData({
      platformId: '',
      modelName: '',
      internalParam: '',
      targetParam: '',
      fixedValue: '',
      defaultValue: '',
      description: '',
      mappingType: 1,
      isRequired: false,
      paramLocation: 'body',
      paramType: 'string',
      siteId: activeSiteId
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string, siteId: SiteId) => {
    AntModal.confirm({
      title: '确认删除',
      content: '确认要删除此映射规则吗？',
      onOk: async () => {
        try {
          await apiParameterMappingAPI.deleteMapping(id, siteId);
          message.success('删除成功');
          loadData(pagination.current, pagination.pageSize);
        } catch (err: any) {
          message.error('删除失败: ' + err.message);
        }
      }
    });
  };

  const handleSubmit = async () => {
    if (!formData.targetParam || !formData.platformId) {
      message.error('请填写必要字段 (平台、目标参数)');
      return;
    }

    try {
      const dataToSubmit = { ...formData, siteId: activeSiteId };
      if (editingMapping) {
        await apiParameterMappingAPI.update(editingMapping.id, dataToSubmit);
        message.success('更新成功');
      } else {
        await apiParameterMappingAPI.create(dataToSubmit);
        message.success('创建成功');
      }
      setModalOpen(false);
      loadData(pagination.current, pagination.pageSize);
    } catch (err: any) {
      message.error('操作失败: ' + err.message);
    }
  };

  const columns = [
    {
      title: '平台',
      dataIndex: 'platformId',
      key: 'platformId',
      render: (pid: string) => {
        const p = platforms.find(x => x.id.toString() === pid.toString());
        return p ? p.name : pid;
      }
    },
    {
      title: '模型',
      dataIndex: 'modelName',
      key: 'modelName',
      render: (text: string) => text || <span className="text-slate-400">通用</span>
    },
    {
      title: '映射关系',
      key: 'mapping',
      render: (_: any, record: ApiParameterMapping) => (
        <div className="flex items-center gap-2">
           <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs">{record.internalParam}</span>
           <ArrowRight size={14} className="text-slate-400" />
           <span className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{record.targetParam}</span>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'mappingType',
      key: 'mappingType',
      render: (type: number) => (
        type === 1 ? <Tag color="blue">字段映射</Tag> : <Tag color="purple">固定值</Tag>
      )
    },
    {
      title: '位置',
      dataIndex: 'paramLocation',
      key: 'paramLocation',
      render: (loc: string) => <Tag>{loc.toUpperCase()}</Tag>
    },
    {
      title: '必填',
      dataIndex: 'isRequired',
      key: 'isRequired',
      render: (req: boolean) => req ? <CheckCircle size={16} className="text-green-500"/> : <span className="text-slate-300">-</span>
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ApiParameterMapping) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-800"><Edit size={16}/></button>
          <button onClick={() => handleDelete(record.id, record.siteId)} className="text-red-600 hover:text-red-800"><Trash2 size={16}/></button>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 card-shadow flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      <div className="p-6 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <GitBranch className="text-blue-600" size={24} />
          <h3 className="text-xl font-bold text-slate-800">参数映射管理</h3>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>新增映射</span>
        </button>
      </div>

      <div className="p-4 bg-slate-50/50 border-b space-y-4">
        <CategoryTabs selected={activeSiteId} onSelect={setActiveSiteId} />
        
        <div className="flex gap-4 items-center flex-wrap">
          <Select 
            className="w-48" 
            placeholder="选择平台" 
            allowClear
            value={filterPlatformId || undefined}
            onChange={setFilterPlatformId}
            options={platforms.map(p => ({ label: p.name, value: p.id.toString() }))}
          />
          
          <div className="relative w-64">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               placeholder="输入模型名称..." 
               value={filterModelName}
               onChange={e => setFilterModelName(e.target.value)}
               className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
             />
          </div>
          
          <button 
            onClick={handleSearch}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700"
          >
            查询
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Table 
          dataSource={mappings} 
          columns={columns} 
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, size) => loadData(page, size)
          }}
        />
      </div>

      {modalOpen && (
        <Modal 
          isOpen={true} 
          onClose={() => setModalOpen(false)} 
          title={editingMapping ? "编辑映射" : "新增映射"}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormItem label="所属站点" required>
                <select 
                  className="w-full p-2 border rounded disabled:bg-slate-100 disabled:text-slate-500"
                  value={formData.siteId}
                  onChange={e => setFormData({
                    ...formData, 
                    siteId: Number(e.target.value) as SiteId,
                    platformId: '' // Reset platform when site changes
                  })}
                  disabled={!!editingMapping}
                >
                  {SITE_IDS.map(id => (
                    <option key={id} value={id}>{SITE_NAMES[id]}</option>
                  ))}
                </select>
              </FormItem>
              <FormItem label="平台" required>
                <select 
                  className="w-full p-2 border rounded"
                  value={formData.platformId}
                  onChange={e => setFormData({...formData, platformId: e.target.value})}
                >
                  <option value="">请选择平台</option>
                  {modalPlatforms.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </FormItem>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <FormItem label="模型名称 (可选)">
                <input 
                  className="w-full p-2 border rounded"
                  value={formData.modelName}
                  onChange={e => setFormData({...formData, modelName: e.target.value})}
                  placeholder="留空则对该平台所有模型生效"
                />
              </FormItem>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormItem label="内部参数名">
                <input 
                  className="w-full p-2 border rounded"
                  value={formData.internalParam}
                  onChange={e => setFormData({...formData, internalParam: e.target.value})}
                  placeholder="e.g. prompt, width, height"
                />
              </FormItem>
              <FormItem label="目标参数名" required>
                <input 
                  className="w-full p-2 border rounded"
                  value={formData.targetParam}
                  onChange={e => setFormData({...formData, targetParam: e.target.value})}
                  placeholder="第三方接口实际参数名"
                />
              </FormItem>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormItem label="映射类型">
                <select 
                  className="w-full p-2 border rounded"
                  value={formData.mappingType}
                  onChange={e => setFormData({...formData, mappingType: Number(e.target.value) as 1 | 2})}
                >
                  <option value={1}>字段映射</option>
                  <option value={2}>固定值</option>
                </select>
              </FormItem>
              <FormItem label="参数位置">
                <select 
                  className="w-full p-2 border rounded"
                  value={formData.paramLocation}
                  onChange={e => setFormData({...formData, paramLocation: e.target.value as any})}
                >
                  <option value="body">Body</option>
                  <option value="query">Query</option>
                  <option value="header">Header</option>
                </select>
              </FormItem>
              <FormItem label="数据类型">
                <select 
                  className="w-full p-2 border rounded"
                  value={formData.paramType}
                  onChange={e => setFormData({...formData, paramType: e.target.value as any})}
                >
                  <option value="string">String</option>
                  <option value="integer">Integer</option>
                  <option value="boolean">Boolean</option>
                  <option value="json">JSON</option>
                </select>
              </FormItem>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormItem label="是否必填">
                <div className="h-10 flex items-center">
                  <ToggleSwitch 
                    enabled={formData.isRequired} 
                    onChange={() => setFormData({...formData, isRequired: !formData.isRequired})} 
                  />
                  <span className="ml-2 text-sm text-slate-600">{formData.isRequired ? '是' : '否'}</span>
                </div>
              </FormItem>
            </div>

            {formData.mappingType === 2 && (
              <FormItem label="固定值/默认值">
                <input 
                  className="w-full p-2 border rounded"
                  value={formData.fixedValue}
                  onChange={e => setFormData({...formData, fixedValue: e.target.value})}
                  placeholder="当类型为固定值时，此项必填"
                />
              </FormItem>
            )}

            <FormItem label="描述">
              <textarea 
                className="w-full p-2 border rounded"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </FormItem>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">取消</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ApiParameterMappingManagement;
