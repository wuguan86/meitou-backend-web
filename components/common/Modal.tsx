import React from 'react';
import { X } from 'lucide-react';

// Modal 组件 - 通用弹窗组件
interface ModalProps {
  isOpen: boolean; // 是否显示弹窗
  onClose: () => void; // 关闭回调
  title: string; // 弹窗标题
  children?: React.ReactNode; // 子内容
  size?: 'md' | 'lg' | 'xl' | 'full'; // 弹窗尺寸
  maskClosable?: boolean; // 点击背景是否关闭，默认为 true
}

const Modal = ({ isOpen, onClose, title, children, size = 'md', maskClosable = true }: ModalProps) => {
  if (!isOpen) return null; // 不显示时返回空
  
  // 尺寸映射
  const sizeClasses = { 
    md: 'max-w-md', 
    lg: 'max-w-2xl', 
    xl: 'max-w-4xl', 
    full: 'max-w-[95vw] h-[90vh]' 
  };
  
  // 处理背景点击关闭（阻止事件冒泡，确保只在点击背景时关闭）
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 只有当点击的是背景层本身（而不是其子元素）时，且允许点击背景关闭时才关闭
    if (e.target === e.currentTarget && maskClosable) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 animate-fade-in" 
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} flex flex-col max-h-[90vh] overflow-hidden relative transform transition-all`}
        onClick={(e) => e.stopPropagation()} // 阻止内容区域的点击事件冒泡到背景层
      >
        {/* 弹窗头部 */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>
        {/* 弹窗内容区域 */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

