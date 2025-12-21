import React, { useState } from 'react';
import * as authAPI from '../../api/auth';

// Login 组件 - 登录页面
interface LoginProps {
  onLogin: () => void; // 登录成功回调
}

const Login = ({ onLogin }: LoginProps) => {
  const [account, setAccount] = useState(''); // 账号
  const [password, setPassword] = useState(''); // 密码
  const [loading, setLoading] = useState(false); // 加载状态
  const [error, setError] = useState(''); // 错误信息
    
  // 处理登录
  const handleLogin = async () => {
    if (!account || !password) {
      setError('请输入账号和密码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authAPI.login({ account, password });
      onLogin(); // 登录成功回调
    } catch (err: any) {
      setError(err.message || '登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };
    
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg transform rotate-3">
            M
          </div>
        </div>
        {/* 标题 */}
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
          Meitou 平台管理系统
        </h2>
        <p className="text-center text-slate-400 text-sm mb-8">
          V2.6.4 Authorized Access Only
        </p>
        {/* 登录表单 */}
        <div className="space-y-4">
          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
          {/* 账号输入 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              管理员账号
            </label>
            <input 
              type="text" 
              value={account} 
              onChange={e => { 
                setAccount(e.target.value); 
                setError(''); 
              }} 
              onKeyDown={e => e.key === 'Enter' && handleLogin()} // 回车登录
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              placeholder="请输入账号/邮箱" 
              disabled={loading}
            />
          </div>
          {/* 密码输入 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              登录密码
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={e => { 
                setPassword(e.target.value); 
                setError(''); 
              }} 
              onKeyDown={e => e.key === 'Enter' && handleLogin()} // 回车登录
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              placeholder="••••••••" 
              disabled={loading}
            />
          </div>
          {/* 登录按钮 */}
          <button 
            onClick={handleLogin} 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-lg shadow-md transition-all mt-2 active:scale-95 disabled:cursor-not-allowed"
          >
            {loading ? '登录中...' : '立即登录'}
          </button>
        </div>
        {/* 版权信息 */}
        <div className="mt-6 text-center text-xs text-slate-400">
          &copy; 2024 Meitou Technology. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;

