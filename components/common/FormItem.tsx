import React from 'react';

// FormItem 组件 - 表单项组件
interface FormItemProps {
  label: string; // 标签文本
  required?: boolean; // 是否必填
  children?: React.ReactNode; // 子内容（输入框等）
  className?: string; // 额外样式类
}

const FormItem = ({ label, required, children, className = '' }: FormItemProps) => (
  <div className={className}>
    {/* 标签 */}
    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {/* 表单项内容 */}
    {children}
  </div>
);

export default FormItem;

