import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, DatePicker, message, Card, Space, Tag } from 'antd';
import { Search, Download, RefreshCw } from 'lucide-react';
import { SITES, SiteId } from '../../constants/sites';
import * as rechargeOrderAPI from '../../api/rechargeOrder';
import CategoryTabs from '../common/CategoryTabs';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const RechargeOrderManagement = () => {
  const [activeSiteId, setActiveSiteId] = useState<SiteId>(SITES.MEDICAL);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<rechargeOrderAPI.RechargeOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [queryParams, setQueryParams] = useState({
    search: '',
    paymentType: '全部',
    dateRange: [] as any[],
    page: 1,
    size: 10
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const params: rechargeOrderAPI.RechargeOrderQuery = {
        siteId: activeSiteId,
        search: queryParams.search,
        paymentType: queryParams.paymentType,
        page: queryParams.page,
        size: queryParams.size
      };
      
      if (queryParams.dateRange && queryParams.dateRange.length === 2) {
        params.startDate = queryParams.dateRange[0].format('YYYY-MM-DD');
        params.endDate = queryParams.dateRange[1].format('YYYY-MM-DD');
      }

      const [resOrders, resStats] = await Promise.all([
        rechargeOrderAPI.getRechargeOrders(params),
        rechargeOrderAPI.getRechargeStats(params)
      ]);

      setData(resOrders.records || []);
      setTotal(resOrders.total || 0);
      setTotalAmount(resStats.totalAmount || 0);
    } catch (error: any) {
      console.error(error);
      message.error('加载失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSiteId, queryParams.page, queryParams.size]); 

  const handleSearch = () => {
    setQueryParams(prev => ({ ...prev, page: 1 }));
    loadData();
  };
  
  const handleRefresh = () => {
    loadData();
  };

  const handleExport = async () => {
    try {
      const params: rechargeOrderAPI.RechargeOrderQuery = {
        siteId: activeSiteId,
        search: queryParams.search,
        paymentType: queryParams.paymentType,
        page: 1, // 导出不需要分页，或者后端忽略
        size: 10000 // 导出数量限制
      };
      
      if (queryParams.dateRange && queryParams.dateRange.length === 2) {
        params.startDate = queryParams.dateRange[0].format('YYYY-MM-DD');
        params.endDate = queryParams.dateRange[1].format('YYYY-MM-DD');
      }

      const response = await rechargeOrderAPI.exportRechargeOrders(params);
      
      // 创建下载链接
      const blob = new Blob([response as any], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `充值记录_${dayjs().format('YYYYMMDDHHmmss')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('导出成功');
    } catch (error: any) {
      console.error(error);
      message.error('导出失败: ' + (error.message || '未知错误'));
    }
  };

  const columns = [
    {
      title: '充值时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    {
      title: '用户/手机号',
      key: 'user',
      render: (_: any, record: rechargeOrderAPI.RechargeOrder) => (
        <div>
          <div className="font-bold">{record.user?.username || '未知用户'}</div>
          <div className="text-gray-500 text-xs">{record.user?.phone || '-'}</div>
        </div>
      )
    },
    {
      title: '充值金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => <span className="font-bold">¥{amount?.toFixed(2)}</span>
    },
    {
      title: '获得积分',
      dataIndex: 'points',
      key: 'points',
      render: (points: number) => <span className="text-blue-500 font-bold">+{points}</span>
    },
    {
      title: '支付渠道',
      dataIndex: 'paymentType',
      key: 'paymentType',
      render: (type: string) => {
        let color = 'default';
        let label = type;
        if (type === 'alipay') {
          color = 'blue';
          label = 'Alipay';
        } else if (type === 'wechat') {
          color = 'green';
          label = 'Wechat';
        } else if (type === 'system') {
            color = 'gray';
            label = 'System';
        }
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let label = status;
        
        switch (status) {
          case 'pending':
            color = 'warning';
            label = '待支付';
            break;
          case 'paying':
            color = 'processing';
            label = '支付中';
            break;
          case 'paid':
            color = 'success';
            label = '已支付';
            break;
          case 'cancelled':
            color = 'default';
            label = '已取消';
            break;
          case 'refunded':
            color = 'purple';
            label = '已退款';
            break;
          case 'failed':
            color = 'error';
            label = '支付失败';
            break;
          default:
            break;
        }
        
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      className: 'text-gray-400 text-xs'
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold mb-1">充值记录查询</h1>
          <p className="text-gray-500 text-sm">监控全平台资金流入与充值明细</p>
        </div>
        <Space>
            <Button icon={<Download size={16} />} onClick={handleExport}>导出记录</Button>
            <Button icon={<RefreshCw size={16} />} onClick={handleRefresh} />
        </Space>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
         <CategoryTabs 
            selected={activeSiteId} 
            onSelect={(id) => {
                setActiveSiteId(id);
                setQueryParams(prev => ({ ...prev, page: 1 }));
            }} 
        />
        
        <div className="mt-4 flex flex-wrap gap-4 items-center">
            <Input 
                placeholder="搜索用户手机号..." 
                prefix={<Search size={16} className="text-gray-400" />} 
                value={queryParams.search}
                onChange={e => setQueryParams({...queryParams, search: e.target.value})}
                onPressEnter={handleSearch}
                style={{ width: 240 }}
                allowClear
            />
            
            <div className="flex items-center">
                <span className="mr-2 text-gray-500">支付渠道:</span>
                <Select 
                    defaultValue="全部" 
                    style={{ width: 120 }} 
                    value={queryParams.paymentType}
                    onChange={val => setQueryParams({...queryParams, paymentType: val})}
                    options={[
                        { value: '全部', label: '全部' },
                        { value: 'alipay', label: 'Alipay' },
                        { value: 'wechat', label: 'Wechat' },
                        { value: 'system', label: 'System' },
                    ]}
                />
            </div>
            
            <RangePicker 
                value={queryParams.dateRange as any}
                onChange={dates => setQueryParams({...queryParams, dateRange: dates || []})}
                placeholder={['开始日期', '结束日期']}
            />
            
            <Button type="primary" onClick={handleSearch}>查询</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
          <Table 
            columns={columns} 
            dataSource={data} 
            rowKey="id" 
            loading={loading}
            pagination={{
                current: queryParams.page,
                pageSize: queryParams.size,
                total: total,
                onChange: (page, size) => setQueryParams(prev => ({ ...prev, page, size })),
                showTotal: (total) => `共 ${total} 条`,
                showSizeChanger: true
            }}
            scroll={{ y: 'calc(100vh - 450px)' }}
          />
          
          <div className="p-4 border-t flex items-center justify-between bg-gray-50">
            <div>
                <span className="text-gray-500 mr-2">总计统计:</span>
                <span className="font-bold text-lg">流水 ¥{totalAmount.toFixed(2)}</span>
            </div>
          </div>
      </div>
    </div>
  );
};

export default RechargeOrderManagement;
