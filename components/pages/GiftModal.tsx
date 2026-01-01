import React, { useState } from 'react';
import { User } from '../../types';
import Modal from '../common/Modal';
import FormItem from '../common/FormItem';

// GiftModal 组件 - 赠送积分弹窗组件
interface GiftModalProps {
  user: User | null; // 用户数据
  onClose: () => void; // 关闭回调
  onConfirm: (points: number) => void; // 确认回调
}

const GiftModal = ({ user, onClose, onConfirm }: GiftModalProps) => {
  const [points, setPoints] = useState(100); // 积分数量
  const [validity, setValidity] = useState('1_month'); // 有效期
  
  if (!user) return null; // 没有用户数据时不显示
  
  return (
    <Modal isOpen={true} onClose={onClose} title={`赠送积分 - ${user.username}`} maskClosable={false}>
      <div className="space-y-4">
        {/* 积分数量输入 */}
        <FormItem label="赠送积分数量">
          <input 
            type="number" 
            value={points} 
            onChange={e => setPoints(parseInt(e.target.value))} 
            className="w-full p-2 border rounded" 
          />
        </FormItem>
        {/* 有效期选择 */}
        <FormItem label="有效期">
          <select 
            value={validity} 
            onChange={e => setValidity(e.target.value)} 
            className="w-full p-2 border rounded bg-white"
          >
            <option value="1_month">1个月</option>
            <option value="3_months">3个月</option>
            <option value="1_year">1年</option>
            <option value="permanent">永久有效</option>
          </select>
        </FormItem>
        {/* 提示信息 */}
        <div className="bg-orange-50 p-3 rounded text-orange-800 text-sm">
          注意：积分将即时到账。
        </div>
        {/* 操作按钮 */}
        <div className="flex justify-end gap-2 pt-4">
          <button 
            onClick={onClose} 
            className="px-4 py-2 hover:bg-slate-100 rounded"
          >
            取消
          </button>
          <button 
            onClick={() => onConfirm(points)} 
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            确认赠送
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default GiftModal;

