import React from 'react';

// StatusBadge 组件 - 状态徽章组件
interface StatusBadgeProps {
  status: string; // 状态值
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  // 状态样式映射
  const styles: any = {
    active: 'bg-green-50 text-green-600 border-green-200',
    published: 'bg-green-50 text-green-600 border-green-200',
    active_ad: 'bg-green-50 text-green-600 border-green-200',
    success: 'bg-green-50 text-green-600 border-green-200',
    suspended: 'bg-slate-100 text-slate-500 border-slate-200',
    hidden: 'bg-slate-100 text-slate-500 border-slate-200',
    locked: 'bg-red-50 text-red-600 border-red-200',
    failed: 'bg-red-50 text-red-600 border-red-200',
    expired: 'bg-slate-100 text-slate-500 border-slate-200',
    processing: 'bg-blue-50 text-blue-600 border-blue-200',
    true: 'bg-green-50 text-green-600 border-green-200',
    false: 'bg-slate-100 text-slate-500 border-slate-200'
  };
  
  // 状态标签映射
  const labels: any = {
    active: '正常', 
    suspended: '停用', 
    published: '展示中', 
    hidden: '已下架', 
    active_ad: '进行中', 
    locked: '已锁定',
    success: '成功', 
    failed: '失败', 
    processing: '生成中', 
    expired: '已过期', 
    true: '已启用', 
    false: '已停用'
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || ''}`}>
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;

