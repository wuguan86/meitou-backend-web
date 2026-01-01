import React, { useState, useEffect } from 'react';
import { Search, Trash2, FileImage, FileVideo, FileAudio, Download } from 'lucide-react';
import { message, Modal, Pagination } from 'antd';
import { UserAsset } from '../../types';
import * as assetAPI from '../../api/asset';
import CategoryTabs from '../common/CategoryTabs';
import StatusBadge from '../common/StatusBadge';
import { SITES, SiteId } from '../../constants/sites';

const AssetsManagement = () => {
  const [activeSiteId, setActiveSiteId] = useState<SiteId>(SITES.MEDICAL);
  const [activeType, setActiveType] = useState('all');
  const [assets, setAssets] = useState<UserAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const loadAssets = async (pageNum = page, size = pageSize) => {
    setLoading(true);
    try {
      const data = await assetAPI.getAssets(activeSiteId, activeType, searchQuery, pageNum, size);
      // 后端返回的是分页对象: { records: [], total: 0, ... }
      setAssets(data.records || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      message.error('加载资产失败: ' + (err.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadAssets(1, pageSize);
  }, [activeSiteId, activeType]);

  const handleSearch = () => {
    setPage(1);
    loadAssets(1, pageSize);
  };

  const handlePageChange = (p: number, s: number) => {
    setPage(p);
    setPageSize(s);
    loadAssets(p, s);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个资产吗？此操作无法撤销。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await assetAPI.deleteAsset(id, activeSiteId);
          message.success('删除成功');
          loadAssets();
        } catch (err: any) {
          message.error('删除失败: ' + (err.message || '未知错误'));
        }
      }
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <FileImage size={16} className="text-blue-500" />;
      case 'video': return <FileVideo size={16} className="text-purple-500" />;
      case 'audio': return <FileAudio size={16} className="text-green-500" />;
      default: return <FileImage size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border card-shadow h-[calc(100vh-140px)] flex flex-col animate-fade-in">
      <div className="p-6 border-b"><h3 className="text-xl font-bold text-slate-800">资产管理</h3></div>
      
      {/* Filters & Actions */}
      <div className="p-4 bg-slate-50/50 border-b flex flex-col sm:flex-row gap-4 justify-between items-center">
        <CategoryTabs selected={activeSiteId} onSelect={setActiveSiteId} />
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索用户名或标题..." 
              className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button 
            onClick={handleSearch}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            查询
          </button>
          
          <div className="flex bg-white rounded-lg p-1 border shrink-0">
            {[
              { id: 'all', label: '全部' },
              { id: 'image', label: '图片' },
              { id: 'video', label: '视频' },
              { id: 'audio', label: '音频' }
            ].map(t => (
              <button 
                key={t.id} 
                onClick={() => setActiveType(t.id)} 
                className={`px-4 py-1.5 text-xs font-medium rounded capitalize transition-all ${
                  activeType === t.id 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="flex-1 overflow-auto flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10 text-xs uppercase text-slate-500 font-semibold tracking-wider">
            <tr>
              <th className="p-4 border-b">预览</th>
              <th className="p-4 border-b">标题 / ID</th>
              <th className="p-4 border-b">类型</th>
              <th className="p-4 border-b">用户</th>
              <th className="p-4 border-b">上传时间</th>
              <th className="p-4 border-b">状态</th>
              <th className="p-4 border-b">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                  </div>
                </td>
              </tr>
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-slate-400">暂无数据</td>
              </tr>
            ) : (
              assets.map(asset => (
                <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-4">
                    <div className="w-16 h-16 rounded-lg bg-slate-100 border overflow-hidden flex items-center justify-center relative">
                      {asset.type === 'image' ? (
                        <img src={asset.thumbnail || asset.url} alt={asset.title} className="w-full h-full object-cover" />
                      ) : asset.type === 'video' ? (
                         asset.thumbnail ? (
                            <div className="relative w-full h-full">
                                <img src={asset.thumbnail} alt={asset.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <FileVideo size={20} className="text-white drop-shadow-md" />
                                </div>
                            </div>
                         ) : (
                            <div className="relative w-full h-full bg-black">
                                <video 
                                    src={asset.url} 
                                    className="w-full h-full object-cover"
                                    preload="metadata"
                                    muted
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                    <FileVideo size={20} className="text-white drop-shadow-md" />
                                </div>
                            </div>
                         )
                      ) : (
                        <FileAudio size={24} className="text-slate-400" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900 truncate max-w-[200px]" title={asset.title}>
                      {asset.title || '无标题'}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {asset.id}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      {getTypeIcon(asset.type)}
                      <span className="capitalize">{asset.type === 'image' ? '图片' : asset.type === 'video' ? '视频' : '音频'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-slate-700">{asset.userName || '未知用户'}</div>
                    <div className="text-xs text-slate-400">ID: {asset.userId}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {new Date(asset.uploadDate || asset.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={asset.status} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-start gap-2">
                      <a 
                        href={asset.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="下载"
                      >
                        <Download size={16} />
                      </a>
                      <button 
                        onClick={() => handleDelete(asset.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="p-4 border-t flex justify-end bg-white">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
          showSizeChanger
          showTotal={(total) => `共 ${total} 条`}
          pageSizeOptions={['10', '20', '50', '100']}
        />
      </div>
    </div>
  </div>
  );
};

export default AssetsManagement;
