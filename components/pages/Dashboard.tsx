import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, AreaChart, Area, Cell
} from 'recharts';
import { User, Search, ArrowRight, Coins } from 'lucide-react';
import CategoryTabs from '../common/CategoryTabs';

// Dashboard 组件 - 数据概览页面
const Dashboard = () => {
  const [activeCategory, setActiveCategory] = useState('medical'); // 当前选中的分类
  const [timeRange, setTimeRange] = useState('week'); // 时间范围
  const [customDates, setCustomDates] = useState({ start: '', end: '' }); // 自定义日期范围
  
  // 趋势数据
  const trendData = [
    { date: '10-24', merchants: 14, consumption: 9200 },
    { date: '10-25', merchants: 16, consumption: 10400 },
    { date: '10-26', merchants: 22, consumption: 8800 },
    { date: '10-27', merchants: 18, consumption: 11200 },
    { date: '10-28', merchants: 20, consumption: 9600 },
    { date: '10-29', merchants: 15, consumption: 7400 },
    { date: '10-30', merchants: 21, consumption: 10200 }
  ];
  
  // 排名数据
  const rankingData = [
    { name: '美好医美', value: 5200 },
    { name: '张氏诊所', value: 4500 },
    { name: '康康体检', value: 3800 },
    { name: '爱美中心', value: 3500 },
    { name: '美莱整形', value: 2400 }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面头部 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">数据概览</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          {/* 分类标签 */}
          <CategoryTabs selected={activeCategory} onSelect={setActiveCategory} />
          {/* 时间范围选择 */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200">
            {['today', 'week', 'month', 'custom'].map(t => (
              <button 
                key={t} 
                onClick={() => setTimeRange(t)} // 切换时间范围
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                  timeRange === t 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t === 'today' ? '当天' : t === 'week' ? '当周' : t === 'month' ? '当月' : '自定义时间段'}
              </button>
            ))}
          </div>
          {/* 自定义日期选择 */}
          {timeRange === 'custom' && (
            <div className="flex items-center gap-2 animate-fade-in bg-white p-1 rounded-lg border border-slate-200">
              <input 
                type="date" 
                value={customDates.start} 
                onChange={e => setCustomDates({...customDates, start: e.target.value})} 
                className="text-xs p-1 border rounded" 
              />
              <span className="text-slate-400">-</span>
              <input 
                type="date" 
                value={customDates.end} 
                onChange={e => setCustomDates({...customDates, end: e.target.value})} 
                className="text-xs p-1 border rounded" 
              />
            </div>
          )}
        </div>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 积分总余额 */}
        <div className="md:col-span-1 bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-xl text-white relative overflow-hidden shadow-lg shadow-blue-200">
          <p className="text-xs font-medium opacity-80 mb-2">平台积分总余额</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">2,458,200</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">总池</span>
          </div>
          <Coins size={80} className="absolute -right-4 -bottom-4 opacity-10" />
        </div>
        {/* 商家总数 */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 flex items-center gap-4 card-shadow">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
            <User size={24}/>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">医美类 商家总数</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-800">324</span>
              <span className="text-[10px] text-green-500 font-bold bg-green-50 px-1 rounded">+5%</span>
            </div>
          </div>
        </div>
        {/* 产生消耗商家数 */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 flex items-center gap-4 card-shadow">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
            <ArrowRight size={24}/>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">产生消耗商家数</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-800">280</span>
              <span className="text-[10px] text-blue-500 font-bold">85% 活跃</span>
            </div>
          </div>
        </div>
        {/* 类目总消耗 */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 flex items-center gap-4 card-shadow">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
            <Search size={24}/>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">该类目总消耗</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-800">125,400</span>
              <span className="text-[10px] text-orange-500 font-bold">积分</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 每日数据趋势 */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 card-shadow h-[400px]">
          <h4 className="font-bold text-slate-800 mb-8">每日数据趋势 (医美)</h4>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} domain={[0, 24]} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} domain={[0, 12000]} />
              <ChartTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
              <Area yAxisId="left" type="monotone" dataKey="merchants" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.05} strokeWidth={2} name="新增商家" />
              <Area yAxisId="right" type="monotone" dataKey="consumption" stroke="#f97316" fill="#f97316" fillOpacity={0.05} strokeWidth={2} name="消耗量" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2 text-[10px] font-bold">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full border-2 border-blue-500" /> 新增商家
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full border-2 border-orange-500" /> 消耗量
            </div>
          </div>
        </div>
        {/* 消耗排名 */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 card-shadow">
          <h4 className="font-bold text-slate-800 mb-8">消耗排名 Top 5</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rankingData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#475569', fontWeight: 600}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24}>
                  {rankingData.map((_, i) => <Cell key={i} fillOpacity={1 - i * 0.15} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

