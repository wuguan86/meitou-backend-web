import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Gift, Ban, CheckCircle } from 'lucide-react';
import { message, Pagination, Modal as AntModal } from 'antd';
import { User } from '../../types';
import * as userAPI from '../../api/user';
import { useUsers } from '../../hooks/useUsers';
import CategoryTabs from '../common/CategoryTabs';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import UserForm from './UserForm';
import GiftModal from './GiftModal';
import { SITES, SiteId } from '../../constants/sites';

// UserManagement 组件 - 用户管理页面
const UserManagement = () => {
  const [activeSiteId, setActiveSiteId] = useState<SiteId>(SITES.MEDICAL); // 当前站点ID（默认医美类）
  const [search, setSearch] = useState(''); // 搜索关键词
  const [modal, setModal] = useState<{ isOpen: boolean, user: Partial<User> | null }>({ 
    isOpen: false, 
    user: null 
  }); // 编辑弹窗状态
  const [giftModal, setGiftModal] = useState<{ isOpen: boolean, user: User | null }>({ 
    isOpen: false, 
    user: null 
  }); // 赠送积分弹窗状态
  
  // 使用自定义 hook 获取用户数据
  const { users, loading, loadUsers, pagination, handlePageChange } = useUsers(activeSiteId, search);
  
  // 保存用户（新增或编辑）
  const handleSave = async (user: Partial<User>) => {
    try {
      if (user.id) {
        // 编辑用户
        await userAPI.updateUser(user.id.toString(), activeSiteId, user);
      } else {
        // 新增用户
        await userAPI.createUser(activeSiteId, { ...user, siteId: activeSiteId });
      }
      await loadUsers(); // 重新加载列表
      setModal({ isOpen: false, user: null });
    } catch (err: any) {
      console.error('保存失败:', err);
      message.error('保存失败: ' + (err.message || '未知错误'));
    }
  };
  
  // 删除用户
  const handleDelete = async (id: string) => {
    AntModal.confirm({
      title: '确认删除',
      content: '确认删除该用户吗?',
      onOk: async () => {
        try {
          await userAPI.deleteUser(id, activeSiteId);
          await loadUsers(); // 重新加载列表
          message.success('删除成功');
        } catch (err: any) {
          console.error('删除失败:', err);
          // 错误已经在拦截器中处理，或者在这里显示
        }
      }
    });
  };

  // 赠送积分
  const handleGiftPoints = async (points: number) => {
    if (!giftModal.user) return;
    try {
      await userAPI.giftPoints(giftModal.user.id.toString(), activeSiteId, points);
      await loadUsers(); // 重新加载列表
      setGiftModal({ isOpen: false, user: null });
    } catch (err: any) {
      message.error('赠送积分失败: ' + (err.message || '未知错误'));
    }
  };

  // 切换用户状态（封禁/解封）
  const handleToggleStatus = async (user: User) => {
    const isSuspended = user.status === 'suspended';
    const newStatus = isSuspended ? 'active' : 'suspended';
    const actionName = isSuspended ? '解封' : '封禁';
    
    AntModal.confirm({
      title: `确认${actionName}`,
      content: `确认${actionName}该用户吗?`,
      onOk: async () => {
        try {
          // 调用 updateUser 接口更新状态
          await userAPI.updateUser(user.id.toString(), activeSiteId, { ...user, status: newStatus });
          await loadUsers(); // 重新加载列表
          message.success(`${actionName}成功`);
        } catch (err: any) {
          console.error(`${actionName}失败:`, err);
          message.error(`${actionName}失败: ` + (err.message || '未知错误'));
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 card-shadow flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] animate-fade-in">
      {/* 页面头部 */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800">用户管理</h3>
        <button 
          onClick={() => setModal({ isOpen: true, user: {} })} 
          className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus size={14} className="sm:w-4 sm:h-4"/> 新增用户
        </button>
      </div>
      
      {/* 筛选区域 */}
      <div className="p-3 sm:p-4 bg-slate-50/50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <CategoryTabs selected={activeSiteId} onSelect={setActiveSiteId} />
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索邮箱/用户名/手机..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-xs sm:text-sm" 
          />
        </div>
      </div>
      
      {/* 用户列表 */}
      <div className="flex-1 overflow-auto flex flex-col">
        <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 text-sm">加载中...</div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400 text-sm">暂无数据</div>
        ) : (
          <>
            {/* 桌面端表格 */}
            <div className="hidden lg:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b text-[11px] uppercase">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">邮箱</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">用户名</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">手机</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">余额</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">状态</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs sm:text-sm">{u.email}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs sm:text-sm">{u.username}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs sm:text-sm">{u.phone || '-'}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 font-bold text-xs sm:text-sm">{u.balance || 0}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <StatusBadge status={u.status || 'active'} />
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => setGiftModal({ isOpen: true, user: u })} 
                          className="p-1.5 sm:p-2 text-orange-600 hover:bg-orange-50 rounded" 
                          title="赠送积分"
                        >
                          <Gift size={14} className="sm:w-4 sm:h-4"/>
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(u)} 
                          className={`p-1.5 sm:p-2 ${u.status === 'suspended' ? 'text-green-600 hover:bg-green-50' : 'text-rose-600 hover:bg-rose-50'} rounded`} 
                          title={u.status === 'suspended' ? '解封用户' : '封禁用户'}
                        >
                          {u.status === 'suspended' ? <CheckCircle size={14} className="sm:w-4 sm:h-4"/> : <Ban size={14} className="sm:w-4 sm:h-4"/>}
                        </button>
                        <button 
                          onClick={() => setModal({ isOpen: true, user: u })} 
                          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded" 
                          title="编辑用户"
                        >
                          <Edit size={14} className="sm:w-4 sm:h-4"/>
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)} 
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded" 
                          title="删除用户"
                        >
                          <Trash2 size={14} className="sm:w-4 sm:h-4"/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* 移动端卡片列表 */}
            <div className="lg:hidden space-y-3 p-3">
              {users.map(u => (
                <div key={u.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">邮箱</span>
                      <span className="text-sm font-medium text-slate-800 truncate flex-1 text-right ml-2">{u.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">用户名</span>
                      <span className="text-sm font-medium text-slate-800">{u.username}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">手机</span>
                      <span className="text-sm font-medium text-slate-800">{u.phone || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">余额</span>
                      <span className="text-sm font-bold text-slate-800">{u.balance || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">状态</span>
                      <StatusBadge status={u.status || 'active'} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button 
                      onClick={() => setGiftModal({ isOpen: true, user: u })} 
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded" 
                      title="赠送积分"
                    >
                      <Gift size={16}/>
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(u)} 
                      className={`p-2 ${u.status === 'suspended' ? 'text-green-600 hover:bg-green-50' : 'text-rose-600 hover:bg-rose-50'} rounded`} 
                      title={u.status === 'suspended' ? '解封用户' : '封禁用户'}
                    >
                      {u.status === 'suspended' ? <CheckCircle size={16}/> : <Ban size={16}/>}
                    </button>
                    <button 
                      onClick={() => setModal({ isOpen: true, user: u })} 
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded" 
                      title="编辑用户"
                    >
                      <Edit size={16}/>
                    </button>
                    <button 
                      onClick={() => handleDelete(u.id)} 
                      className="p-2 text-red-600 hover:bg-red-50 rounded" 
                      title="删除用户"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        </div>
        
        {/* 分页组件 */}
        {!loading && users.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex justify-end bg-white">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger
              showTotal={(total) => `共 ${total} 条`}
              size="small"
            />
          </div>
        )}
      </div>
      
      {/* 编辑用户弹窗 */}
      {modal.isOpen && (
        <Modal 
          isOpen={true} 
          onClose={() => setModal({ isOpen: false, user: null })} 
          title={modal.user?.id ? '编辑用户' : '新增用户'}
          maskClosable={false}
        >
          <UserForm 
            key={modal.user?.id ? `edit-${modal.user.id}` : 'create'}
            user={modal.user} 
            onSave={handleSave} 
            onCancel={() => setModal({ isOpen: false, user: null })} 
          />
        </Modal>
      )}
      
      {/* 赠送积分弹窗 */}
      {giftModal.isOpen && (
        <GiftModal 
          user={giftModal.user} 
          onClose={() => setGiftModal({ isOpen: false, user: null })} 
          onConfirm={handleGiftPoints} 
        />
      )}
    </div>
  );
};

export default UserManagement;

