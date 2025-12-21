import React from 'react';

// ToggleSwitch 组件 - 开关切换组件
interface ToggleSwitchProps {
  enabled: boolean; // 是否启用
  onChange: (enabled: boolean) => void; // 状态变化回调
}

const ToggleSwitch = ({ enabled, onChange }: ToggleSwitchProps) => {
  return (
    <button
      onClick={() => onChange(!enabled)} // 点击切换状态
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-slate-200'
      }`}
    >
      {/* 开关滑块 */}
      <span 
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`} 
      />
    </button>
  );
};

export default ToggleSwitch;

