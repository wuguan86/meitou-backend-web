import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  Menu as MenuIcon,
  ChevronDown,
  Key,
  CreditCard,
  FileClock,
  Ticket,
  ShieldAlert,
  Coins,
  Server,
  X
} from 'lucide-react';
import { NavSection } from '../../types';
import { SIDEBAR_MENU } from '../../constants';
import Dashboard from '../pages/Dashboard';
import UserManagement from '../pages/UserManagement';

// AdminLayout 组件 - 管理后台布局
interface AdminLayoutProps {
  onLogout: () => void; // 退出登录回调
  // 其他页面组件通过 props 传入，避免循环依赖
  SquareManagement?: React.ComponentType;
  AssetsManagement?: React.ComponentType;
  MarketingManagement?: React.ComponentType;
  MenuManagement?: React.ComponentType;
  ApiManagement?: React.ComponentType;
  PaymentManagement?: React.ComponentType;
  RechargeConfigManagement?: React.ComponentType;
  GenerationRecords?: React.ComponentType;
  InvitationManagement?: React.ComponentType;
  SiteManagement?: React.ComponentType;
  AccountManagement?: React.ComponentType;
  ApiParameterMappingManagement?: React.ComponentType;
}

const AdminLayout = ({ 
  onLogout,
  SquareManagement,
  AssetsManagement,
  MarketingManagement,
  MenuManagement,
  ApiManagement,
  PaymentManagement,
  RechargeConfigManagement,
  GenerationRecords,
  InvitationManagement,
  SiteManagement,
  AccountManagement,
  ApiParameterMappingManagement
}: AdminLayoutProps) => {
  const [activeTab, setActiveTab] = useState<NavSection>('dashboard'); // 当前激活的标签页
  const [sidebarOpen, setSidebarOpen] = useState(true); // 侧边栏是否展开（桌面端）
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // 移动端菜单是否打开
  const [openMenus, setOpenMenus] = useState<string[]>(['system']); // 展开的菜单项

  // 监听窗口大小变化，自动关闭移动端菜单
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 渲染页面内容
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': 
        return <Dashboard />;
      case 'users': 
        return <UserManagement />;
      case 'square': 
        return SquareManagement ? <SquareManagement /> : <div className="p-6 bg-white rounded-xl">页面开发中</div>;
      case 'assets': 
        return AssetsManagement ? <AssetsManagement /> : <div className="p-6 bg-white rounded-xl">页面开发中</div>;
      case 'marketing': 
        return MarketingManagement ? <MarketingManagement /> : <div className="p-6 bg-white rounded-xl">页面开发中</div>;
      case 'menus': 
        return MenuManagement ? <MenuManagement /> : <div className="p-6 bg-white rounded-xl">页面开发中</div>;
      case 'api': 
        return ApiManagement ? <ApiManagement /> : <div className="p-6 bg-white rounded-xl">页面开发中</div>;
      case 'api_mapping':
        return ApiParameterMappingManagement ? <ApiParameterMappingManagement /> : <div className="p-6 bg-white rounded-xl">页面开发中</div>;
      case 'payment': 
        return PaymentManagement ? <PaymentManagement /> : <div className="p-6 bg-white rounded-xl">页面开发中</div>;
      case 'recharge_config': 
        return RechargeConfigManagement ? <RechargeConfigManagement /> : <div className="p-6 bg-white rounded-xl">页面开发中</div>;
      case 'gen_records': 
        return GenerationRecords ? <GenerationRecords /> : <div className="p-6 bg-white rounded-xl">页面开发中</div>;
      case 'invitations': 
        return InvitationManagement ? <InvitationManagement /> : <div className="p-6 bg-white rounded-xl">页面开发中</div>;
      case 'sites': 
        return SiteManagement ? <SiteManagement /> : <div className="p-6 bg-white rounded-xl">页面开发中</div>;
      case 'accounts': 
        return AccountManagement ? <AccountManagement /> : <div className="p-6 bg-white rounded-xl">页面开发中</div>;
      default: 
        return <div className="p-6 bg-white rounded-xl">页面开发中: {activeTab}</div>;
    }
  };

  // 获取子菜单图标
  const getSubIcon = (id: string) => {
    const iconMap: Record<string, React.ReactNode> = { 
      'menus': <MenuIcon size={14} />, 
      'api': <Key size={14} />, 
      'payment': <CreditCard size={14} />, 
      'recharge_config': <Coins size={14} />, 
      'gen_records': <FileClock size={14} />, 
      'invitations': <Ticket size={14} />, 
      'sites': <Server size={14} />,
      'accounts': <ShieldAlert size={14} /> 
    };
    return iconMap[id] || <div />;
  };

  // 处理导航点击，移动端点击后关闭菜单
  const handleNavClick = (tab: NavSection) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-sans text-slate-800 overflow-hidden">
      {/* 移动端遮罩层 */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* 侧边栏 */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${sidebarOpen ? 'w-64' : 'w-20'} bg-sidebar-dark text-slate-400 
        transition-all duration-300 flex flex-col shrink-0
        transform lg:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo 区域 */}
        <div className="h-16 flex items-center px-4 lg:px-6 gap-3 shrink-0 border-b border-slate-800 lg:border-b-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black shadow-lg shrink-0">
            M
          </div>
          {sidebarOpen && (
            <span className="text-white font-bold tracking-tight text-base lg:text-lg whitespace-nowrap">
              Meitou V2.6.4
            </span>
          )}
          {/* 移动端关闭按钮 */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden ml-auto p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 sm:px-3 space-y-1">
          {SIDEBAR_MENU.map(item => {
            // 有子菜单的项
            if (item.children) {
              return (
                <div key={item.id}>
                  <button 
                    onClick={() => setOpenMenus(p => 
                      p.includes(item.id) 
                        ? p.filter(i => i !== item.id) 
                        : [...p, item.id]
                    )} 
                    className="w-full flex items-center justify-between px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-sidebar-hover hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="shrink-0">{item.icon}</span>
                      {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                    </div>
                    {sidebarOpen && (
                      <ChevronDown 
                        size={14} 
                        className={`transition-transform shrink-0 ${
                          openMenus.includes(item.id) ? 'rotate-180' : ''
                        }`} 
                      />
                    )}
                  </button>
                  {/* 子菜单 */}
                  {sidebarOpen && openMenus.includes(item.id) && (
                    <div className="pl-2 sm:pl-4 ml-3 sm:ml-5 border-l border-slate-800 space-y-1 mt-1">
                      {item.children.map(child => (
                        <button 
                          key={child.id} 
                          onClick={() => handleNavClick(child.id as NavSection)} 
                          className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-colors ${
                            activeTab === child.id 
                              ? 'text-white bg-sidebar-hover' 
                              : 'hover:text-white hover:bg-sidebar-hover'
                          }`}
                        >
                          {child.icon}
                          <span className="whitespace-nowrap">{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            // 无子菜单的项
            return (
              <button 
                key={item.id} 
                onClick={() => handleNavClick(item.id as NavSection)} 
                className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all text-xs sm:text-sm font-medium ${
                  activeTab === item.id 
                    ? 'sidebar-active' 
                    : 'hover:bg-sidebar-hover hover:text-white'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>
        
        {/* 退出登录按钮 */}
        <div className="p-3 sm:p-4 border-t border-slate-800 shrink-0">
          <button 
            onClick={onLogout} 
            className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 text-slate-400 hover:text-red-400 rounded-lg text-xs sm:text-sm transition-colors"
          >
            <LogOut size={16} className="sm:w-[18px] sm:h-[18px] shrink-0" />
            {sidebarOpen && <span className="whitespace-nowrap">退出登录</span>}
          </button>
        </div>
      </aside>
      
      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* 顶部导航栏 */}
        <header className="h-14 sm:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30">
          <div className="flex items-center gap-3 sm:gap-6">
            {/* 移动端菜单按钮 */}
            <button 
              onClick={() => setMobileMenuOpen(true)} 
              className="lg:hidden p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
            >
              <MenuIcon size={20} />
            </button>
            {/* 桌面端侧边栏切换按钮 */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="hidden lg:flex p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
            >
              <MenuIcon size={20} />
            </button>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="text-[10px] sm:text-xs font-bold text-green-600 whitespace-nowrap">V2.6.4 运行正常</div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-[10px] sm:text-xs shrink-0">
              A
            </div>
          </div>
        </header>
        
        {/* 页面内容 */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50">
          <div className="max-w-[1600px] mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

