import React from 'react';
import { X } from 'lucide-react';

// Modal 组件 - 通用弹窗组件
interface ModalProps {
  isOpen: boolean; // 是否显示弹窗
  onClose: () => void; // 关闭回调
  title: string; // 弹窗标题
  children?: React.ReactNode; // 子内容
  size?: 'md' | 'lg' | 'xl' | 'full'; // 弹窗尺寸
}

const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  if (!isOpen) return null; // 不显示时返回空
  
  // 尺寸映射
  const sizeClasses = { 
    md: 'max-w-md', 
    lg: 'max-w-2xl', 
    xl: 'max-w-4xl', 
    full: 'max-w-[95vw] h-[90vh]' 
  };
  
  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 animate-fade-in" 
      onClick={(e) => {
        // 点击背景关闭弹窗
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} flex flex-col max-h-[90vh] overflow-hidden relative transform transition-all`}>
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

