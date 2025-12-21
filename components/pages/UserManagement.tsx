import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Gift } from 'lucide-react';
import { User } from '../../types';
import * as userAPI from '../../api/user';
import { useUsers } from '../../hooks/useUsers';
import CategoryTabs from '../common/CategoryTabs';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import UserForm from './UserForm';
import GiftModal from './GiftModal';

// UserManagement 组件 - 用户管理页面
const UserManagement = () => {
  const [activeCategory, setActiveCategory] = useState('medical'); // 当前分类
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
  const { users, loading, loadUsers } = useUsers(activeCategory, search);
  
  // 保存用户（新增或编辑）
  const handleSave = async (user: Partial<User>) => {
    try {
      if (user.id) {
        // 编辑用户
        await userAPI.updateUser(user.id.toString(), user);
      } else {
        // 新增用户
        await userAPI.createUser({ ...user, category: activeCategory });
      }
      await loadUsers(); // 重新加载列表
      setModal({ isOpen: false, user: null });
    } catch (err: any) {
      alert('保存失败: ' + (err.message || '未知错误'));
    }
  };
  
  // 删除用户
  const handleDelete = async (id: string) => {
    if (!window.confirm('确认删除该用户吗?')) return;
    try {
      await userAPI.deleteUser(id);
      await loadUsers(); // 重新加载列表
    } catch (err: any) {
      alert('删除失败: ' + (err.message || '未知错误'));
    }
  };

  // 赠送积分
  const handleGiftPoints = async (points: number) => {
    if (!giftModal.user) return;
    try {
      await userAPI.giftPoints(giftModal.user.id.toString(), points);
      await loadUsers(); // 重新加载列表
      setGiftModal({ isOpen: false, user: null });
    } catch (err: any) {
      alert('赠送积分失败: ' + (err.message || '未知错误'));
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 card-shadow flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      {/* 页面头部 */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">用户管理</h3>
        <button 
          onClick={() => setModal({ isOpen: true, user: {} })} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
        >
          <Plus size={16}/> 新增用户
        </button>
      </div>
      
      {/* 筛选区域 */}
      <div className="p-4 bg-slate-50/50 border-b flex justify-between items-center">
        <CategoryTabs selected={activeCategory} onSelect={setActiveCategory} />
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索邮箱/用户名/手机..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm" 
          />
        </div>
      </div>
      
      {/* 用户列表 */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">加载中...</div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400">暂无数据</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b text-[11px] uppercase">
              <tr>
                <th className="px-6 py-4">邮箱</th>
                <th className="px-6 py-4">用户名</th>
                <th className="px-6 py-4">手机</th>
                <th className="px-6 py-4">余额</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">{u.username}</td>
                  <td className="px-6 py-4">{u.phone || '-'}</td>
                  <td className="px-6 py-4 font-bold">{u.balance || 0}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={u.status || 'active'} />
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => setGiftModal({ isOpen: true, user: u })} 
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded" 
                      title="赠送积分"
                    >
                      <Gift size={16}/>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* 编辑用户弹窗 */}
      {modal.isOpen && (
        <Modal 
          isOpen={true} 
          onClose={() => setModal({ isOpen: false, user: null })} 
          title={modal.user?.id ? '编辑用户' : '新增用户'}
        >
          <UserForm 
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

