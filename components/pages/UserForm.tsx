import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import FormItem from '../common/FormItem';

// UserForm 组件 - 用户表单组件
interface UserFormProps {
  user: Partial<User> | null; // 用户数据（编辑时传入）
  onSave: (user: Partial<User>) => void | Promise<void>; // 保存回调
  onCancel: () => void; // 取消回调
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState(user || {}); // 表单数据
  
  useEffect(() => {
    setFormData(user || {});
  }, [user]);
  
  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  return (
    <div className="space-y-4">
      {/* 邮箱输入 */}
      <FormItem label="邮箱">
        <input 
          name="email" 
          value={formData.email || ''} 
          onChange={handleChange} 
          className="w-full p-2 border rounded" 
          autoComplete="off"
          placeholder="选填"
        />
      </FormItem>
      {/* 用户名输入 */}
      <FormItem label="用户名">
        <input 
          name="username" 
          value={formData.username || ''} 
          onChange={handleChange} 
          className="w-full p-2 border rounded" 
          autoComplete="off"
          placeholder="选填，不填则自动生成"
        />
      </FormItem>
      {/* 手机号输入 */}
      <FormItem label="手机号" required>
        <input 
          name="phone" 
          value={formData.phone || ''} 
          onChange={handleChange} 
          className="w-full p-2 border rounded" 
          autoComplete="off"
          placeholder="必填"
        />
      </FormItem>
      {/* 登录密码输入 */}
      <FormItem label="登录密码">
        <input 
          name="password" 
          type="password" 
          placeholder={user?.id ? "留空则不修改" : "设置密码"} 
          value={formData.password || ''} 
          onChange={handleChange} 
          className="w-full p-2 border rounded" 
          autoComplete="new-password"
        />
      </FormItem>
      {/* 公司/机构输入 */}
      <FormItem label="公司/机构">
        <input 
          name="company" 
          value={formData.company || ''} 
          onChange={handleChange} 
          className="w-full p-2 border rounded" 
        />
      </FormItem>
      {/* 积分余额（只读） */}
      <FormItem label="积分余额">
        <input 
          value={formData.balance || 0} 
          disabled 
          className="w-full p-2 border rounded bg-slate-100 text-slate-500 cursor-not-allowed" 
        />
      </FormItem>
      {/* 操作按钮 */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <button onClick={onCancel}>取消</button>
        <button 
          onClick={() => {
            if (!formData.phone || !formData.phone.trim()) {
              alert('请输入手机号');
              return;
            }
            onSave(formData);
          }} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          保存
        </button>
      </div>
    </div>
  );
};

export default UserForm;

