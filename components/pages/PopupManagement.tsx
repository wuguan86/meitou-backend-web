import React, { useState, useEffect } from 'react';
import { message, Switch, Table, Modal, Button, Popconfirm, Tag, Tooltip } from 'antd';
import { Save, Upload, X, Eye, Monitor, Plus, Edit, Trash2 } from 'lucide-react';
import { SiteId, SITES } from '../../constants/sites';
import CategoryTabs from '../common/CategoryTabs';
import FormItem from '../common/FormItem';
import { SecureImage } from '../common/SecureImage';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import * as marketingAPI from '../../api/marketing';
import * as uploadAPI from '../../api/upload';
import { PopupConfig } from '../../types';

const PopupManagement = () => {
  const [activeSiteId, setActiveSiteId] = useState<SiteId>(SITES.MEDICAL);
  const [loading, setLoading] = useState(false);
  const [popupList, setPopupList] = useState<PopupConfig[]>([]);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formConfig, setFormConfig] = useState<PopupConfig>({
    id: '',
    siteId: activeSiteId,
    name: '',
    imageUrl: '',
    startDate: '',
    endDate: '',
    isEnabled: false,
    jumpType: 'external',
    jumpLink: '',
    richTextContent: ''
  });
  const [activeTab, setActiveTab] = useState<'external' | 'rich_text'>('external');

  // 加载配置列表
  const loadList = async () => {
    setLoading(true);
    try {
      const data = await marketingAPI.getPopupList(activeSiteId);
      setPopupList(data || []);
    } catch (error) {
      console.error('加载弹窗列表失败:', error);
      message.error('加载列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, [activeSiteId]);

  // 打开新建模态框
  const handleCreate = () => {
    setEditingId(null);
    setFormConfig({
      id: '',
      siteId: activeSiteId,
      name: '',
      imageUrl: '',
      startDate: '',
      endDate: '',
      isEnabled: true, // 默认开启
      jumpType: 'external',
      jumpLink: '',
      richTextContent: ''
    });
    setActiveTab('external');
    setIsModalOpen(true);
  };

  // 打开编辑模态框
  const handleEdit = (record: PopupConfig) => {
    setEditingId(record.id || '');
    setFormConfig({ ...record });
    setActiveTab(record.jumpType === 'rich_text' ? 'rich_text' : 'external');
    setIsModalOpen(true);
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      await marketingAPI.deletePopup(id, activeSiteId);
      message.success('删除成功');
      loadList();
    } catch (error) {
      console.error('删除弹窗失败:', error);
      message.error('删除失败');
    }
  };

  // 保存配置
  const handleSubmit = async () => {
    if (formConfig.isEnabled) {
      if (!formConfig.imageUrl) {
        message.warning('启用弹窗时必须上传图片');
        return;
      }
      if (!formConfig.name) {
        message.warning('请输入弹窗名称');
        return;
      }
      if (!formConfig.startDate || !formConfig.endDate) {
        message.warning('请选择开始时间和结束时间');
        return;
      }
      if (formConfig.startDate > formConfig.endDate) {
        message.warning('结束时间不能早于开始时间');
        return;
      }
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formConfig,
        siteId: activeSiteId,
        jumpType: activeTab === 'external' ? 'external' : 'rich_text',
      };
      
      if (editingId) {
        await marketingAPI.updatePopup(editingId, activeSiteId, dataToSave);
        message.success('更新成功');
      } else {
        await marketingAPI.createPopup(activeSiteId, dataToSave);
        message.success('创建成功');
      }
      setIsModalOpen(false);
      loadList();
    } catch (error) {
      console.error('保存弹窗配置失败:', error);
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      message.warning('只支持 JPG、PNG、WEBP 格式的图片');
      return;
    }

    // 预览
    const previewUrl = URL.createObjectURL(file);
    setFormConfig(prev => ({ ...prev, imageUrl: previewUrl }));

    setUploading(true);
    try {
      const uploadedUrl = await uploadAPI.uploadImage(file, 'marketing/popup/');
      setFormConfig(prev => ({ ...prev, imageUrl: uploadedUrl }));
    } catch (error) {
      console.error('图片上传失败:', error);
      message.error('图片上传失败');
    } finally {
      setUploading(false);
      URL.revokeObjectURL(previewUrl);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '弹窗图片',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 120,
      render: (url: string) => (
        <div className="w-20 h-20 bg-slate-50 rounded-lg border flex items-center justify-center overflow-hidden">
          {url ? (
            <SecureImage src={url} className="w-full h-full object-contain" />
          ) : (
            <div className="text-slate-300">无图片</div>
          )}
        </div>
      ),
    },
    {
      title: '弹窗名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-bold text-slate-700">{text || '-'}</span>,
    },
    {
      title: '有效时间',
      key: 'validDate',
      width: 200,
      render: (_: any, record: PopupConfig) => (
        <div className="text-xs text-slate-500">
          {record.startDate && record.endDate ? `${record.startDate} ~ ${record.endDate}` : '-'}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      width: 100,
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? '已启用' : '已禁用'}
        </Tag>
      ),
    },
    {
      title: '跳转类型',
      dataIndex: 'jumpType',
      key: 'jumpType',
      width: 150,
      render: (type: string) => (
        <Tag color="blue">{type === 'rich_text' ? '富文本详情' : '外部网页'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: PopupConfig) => (
        <div className="flex gap-2">
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<Edit size={16} className="text-blue-600" />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个弹窗吗？"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record.id || '')}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="删除">
              <Button 
                type="text" 
                danger
                icon={<Trash2 size={16} />} 
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl border card-shadow h-[calc(100vh-140px)] flex flex-col animate-fade-in">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">弹窗管理</h3>
        <button 
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          新增弹窗
        </button>
      </div>
      
      <div className="p-4 border-b bg-slate-50/50">
        <CategoryTabs selected={activeSiteId} onSelect={setActiveSiteId} />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Table 
          columns={columns} 
          dataSource={popupList} 
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </div>

      {/* 编辑/新增模态框 */}
      <Modal
        title={editingId ? "编辑弹窗" : "新增弹窗"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>取消</Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={saving} 
            onClick={handleSubmit}
            className="bg-blue-600"
          >
            保存
          </Button>
        ]}
        style={{ top: 20 }}
      >
        <div className="flex flex-col lg:flex-row gap-6 max-h-[70vh] overflow-y-auto p-1">
          {/* 左侧表单 */}
          <div className="flex-1 space-y-5">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700">是否启用弹窗</span>
                <Switch 
                  checked={formConfig.isEnabled} 
                  onChange={checked => setFormConfig(prev => ({ ...prev, isEnabled: checked }))} 
                />
              </div>
              <p className="text-xs text-slate-500">启用后，用户访问该站点首页时将显示此弹窗。</p>
            </div>

            <FormItem label="弹窗名称">
              <input 
                type="text" 
                className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100" 
                placeholder="请输入弹窗名称"
                value={formConfig.name || ''}
                onChange={e => setFormConfig(prev => ({ ...prev, name: e.target.value }))}
              />
            </FormItem>

            <div className="grid grid-cols-2 gap-4">
              <FormItem label="开始时间">
                <input 
                  type="date" 
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={formConfig.startDate || ''}
                  onChange={e => setFormConfig(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </FormItem>
              <FormItem label="结束时间">
                <input 
                  type="date" 
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={formConfig.endDate || ''}
                  onChange={e => setFormConfig(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </FormItem>
            </div>

            <FormItem label="弹窗图片 (1380*1088)">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-400 transition-colors bg-slate-50 group relative">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/png,image/webp"
                />
                
                {formConfig.imageUrl ? (
                  <div className="relative">
                    <SecureImage 
                      src={formConfig.imageUrl} 
                      className="max-h-48 mx-auto object-contain rounded-lg shadow-sm" 
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                      <p className="text-white font-bold flex items-center gap-2">
                        <Upload size={16} /> 点击更换图片
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-6">
                    <Upload size={24} className="mx-auto text-slate-300 mb-2 group-hover:text-blue-500 transition-colors" />
                    <p className="text-slate-500 font-medium text-sm">点击上传图片</p>
                    <p className="text-xs text-slate-400 mt-1">建议尺寸 1380*1088</p>
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                    <div className="text-blue-600 font-bold">上传中...</div>
                  </div>
                )}
              </div>
            </FormItem>

            <FormItem label="跳转类型">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setActiveTab('external')} 
                  className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'external' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  外部网页
                </button>
                <button 
                  onClick={() => setActiveTab('rich_text')} 
                  className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'rich_text' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  富文本详情
                </button>
              </div>
            </FormItem>

            {activeTab === 'external' && (
              <FormItem label="跳转链接">
                <input 
                  type="url" 
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100" 
                  placeholder="https://"
                  value={formConfig.jumpLink || ''}
                  onChange={e => setFormConfig(prev => ({ ...prev, jumpLink: e.target.value }))}
                />
              </FormItem>
            )}
          </div>

          {/* 右侧富文本 */}
          <div className="flex-1 border border-slate-200 rounded-xl flex flex-col overflow-hidden bg-white shadow-sm min-h-[400px]">
             <div className="px-5 py-3 border-b bg-slate-50/50 flex justify-between items-center">
               <label className="font-bold text-slate-700 text-sm flex items-center gap-2">
                 <div className="w-1 h-4 bg-blue-600 rounded-full"></div> 
                 详情内容编辑
               </label>
               {activeTab === 'external' && <span className="text-xs text-amber-500 font-medium bg-amber-50 px-2 py-0.5 rounded">仅富文本模式生效</span>}
             </div>
             
             <div className="flex-1 bg-white relative flex flex-col">
               <ReactQuill 
                  theme="snow"
                  value={formConfig.richTextContent || ''} 
                  onChange={(content) => setFormConfig(prev => ({ ...prev, richTextContent: content }))}
                  className="h-full flex flex-col [&>.ql-container]:flex-1 [&>.ql-container]:overflow-auto [&>.ql-container]:border-none [&>.ql-toolbar]:border-none [&>.ql-toolbar]:border-b [&>.ql-toolbar]:border-slate-200"
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
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PopupManagement;
