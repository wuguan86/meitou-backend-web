import { useState, useEffect } from 'react';

// useAuth Hook - 管理登录状态
export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 登录状态
  
  // 检查登录状态
  useEffect(() => {
    // 从本地存储检查登录状态
    setIsLoggedIn(!!localStorage.getItem('vidu_admin_session'));
    // 设置页面标题
    document.title = "Meitou Admin | V2.6.4";
  }, []);
  
  return {
    isLoggedIn, // 登录状态
    setIsLoggedIn // 设置登录状态
  };
};

