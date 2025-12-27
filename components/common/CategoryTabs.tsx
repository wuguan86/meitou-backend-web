import React from 'react';
import { SITES, SITE_NAMES, SiteId } from '../../constants/sites';

// CategoryTabs 组件 - 站点标签页组件（使用 siteId）
interface CategoryTabsProps {
  selected: SiteId; // 当前选中的站点ID
  onSelect: (siteId: SiteId) => void; // 选择回调
}

const CategoryTabs = ({ selected, onSelect }: CategoryTabsProps) => {
  // 站点选项（使用 siteId）
  const tabs: { id: SiteId; label: string }[] = [
    { id: SITES.MEDICAL, label: SITE_NAMES[SITES.MEDICAL] },
    { id: SITES.ECOMMERCE, label: SITE_NAMES[SITES.ECOMMERCE] },
    { id: SITES.LIFE, label: SITE_NAMES[SITES.LIFE] }
  ];
  
  return (
    <div className="flex bg-white rounded-lg p-1 border border-slate-200 w-fit">
      {tabs.map(tab => (
        <button 
          key={tab.id} 
          onClick={() => onSelect(tab.id)} // 点击切换站点
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

