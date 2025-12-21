import React from 'react';

// CategoryTabs 组件 - 分类标签页组件
interface CategoryTabsProps {
  selected: string; // 当前选中的分类
  onSelect: (c: string) => void; // 选择回调
}

const CategoryTabs = ({ selected, onSelect }: CategoryTabsProps) => {
  // 分类选项
  const tabs = [
    { id: 'medical', label: '医美类' },
    { id: 'ecommerce', label: '电商类' },
    { id: 'life', label: '生活服务类' }
  ];
  
  return (
    <div className="flex bg-white rounded-lg p-1 border border-slate-200 w-fit">
      {tabs.map(tab => (
        <button 
          key={tab.id} 
          onClick={() => onSelect(tab.id)} // 点击切换分类
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
            selected === tab.id 
              ? 'bg-blue-50 text-blue-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;

