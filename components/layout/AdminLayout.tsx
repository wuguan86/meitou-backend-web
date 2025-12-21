import React, { useState } from 'react';
import { 
  LogOut, 
  Menu as MenuIcon,
  ChevronDown,
  Key,
  CreditCard,
  FileClock,
  Ticket,
  ShieldAlert
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
  GenerationRecords?: React.ComponentType;
  InvitationManagement?: React.ComponentType;
  AccountManagement?: React.ComponentType;
}

const AdminLayout = ({ 
  onLogout,
  SquareManagement,
  AssetsManagement,
  MarketingManagement,
  MenuManagement,
  ApiManagement,
  PaymentManagement,
  GenerationRecords,
  InvitationManagement,
  AccountManagement
}: AdminLayoutProps) => {
  const [activeTab, setActiveTab] = useState<NavSection>('dashboard'); // 当前激活的标签页
  const [sidebarOpen, setSidebarOpen] = useState(true); // 侧边栏是否展开
  const [openMenus, setOpenMenus] = useState<string[]>(['system']); // 展开的菜单项

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
      case 'payment': 
        return PaymentManagement ? <PaymentManagement /> : <div className="p-6 bg-white rounded-xl">页面开发中</div>;
      case 'gen_records': 
        return GenerationRecords ? <GenerationRecords /> : <div className="p-6 bg-white rounded-xl">页面开发中</div>;
      case 'invitations': 
        return InvitationManagement ? <InvitationManagement /> : <div className="p-6 bg-white rounded-xl">页面开发中</div>;
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
      'gen_records': <FileClock size={14} />, 
      'invitations': <Ticket size={14} />, 
      'accounts': <ShieldAlert size={14} /> 
    };
    return iconMap[id] || <div />;
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-sans text-slate-800 overflow-hidden">
      {/* 侧边栏 */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-sidebar-dark text-slate-400 transition-all duration-300 flex flex-col z-50 shrink-0`}>
        {/* Logo 区域 */}
        <div className="h-16 flex items-center px-6 gap-3 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black shadow-lg">
            M
          </div>
          {sidebarOpen && (
            <span className="text-white font-bold tracking-tight text-lg">
              Meitou V2.6.4
            </span>
          )}
        </div>
        
        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
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
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <span>{item.icon}</span>
                      {sidebarOpen && <span>{item.label}</span>}
                    </div>
                    {sidebarOpen && (
                      <ChevronDown 
                        size={14} 
                        className={`transition-transform ${
                          openMenus.includes(item.id) ? 'rotate-180' : ''
                        }`} 
                      />
                    )}
                  </button>
                  {/* 子菜单 */}
                  {sidebarOpen && openMenus.includes(item.id) && (
                    <div className="pl-4 ml-5 border-l border-slate-800 space-y-1 mt-1">
                      {item.children.map(child => (
                        <button 
                          key={child.id} 
                          onClick={() => setActiveTab(child.id as NavSection)} 
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium ${
                            activeTab === child.id 
                              ? 'text-white' 
                              : 'hover:text-white'
                          }`}
                        >
                          {getSubIcon(child.id)}
                          <span>{child.label}</span>
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
                onClick={() => setActiveTab(item.id as NavSection)} 
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  activeTab === item.id 
                    ? 'sidebar-active' 
                    : 'hover:bg-sidebar-hover hover:text-white'
                }`}
              >
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
        
        {/* 退出登录按钮 */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout} 
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 rounded-lg text-sm"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>退出登录</span>}
          </button>
        </div>
      </aside>
      
      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-40">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"
            >
              <MenuIcon size={20} />
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-xs font-bold text-green-600">V2.6.4 运行正常</div>
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-xs">
              A
            </div>
          </div>
        </header>
        
        {/* 页面内容 */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="max-w-[1600px] mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

