import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, AreaChart, Area, Cell
} from 'recharts';
import { User, Search, ArrowRight, Coins } from 'lucide-react';
import CategoryTabs from '../common/CategoryTabs';
import { SITES, SITE_NAMES, SiteId } from '../../constants/sites';
import { getStats, getTrend, getRanking, DashboardParams } from '../../api/dashboard';

// Dashboard 组件 - 数据概览页面
const Dashboard = () => {
  const [activeCategory, setActiveCategory] = useState<SiteId>(SITES.MEDICAL); // 当前选中的分类
  const [timeRange, setTimeRange] = useState('week'); // 时间范围
  const [customDates, setCustomDates] = useState({ start: '', end: '' }); // 自定义日期范围
  
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalConsumption: 0
  });
  
  const [trendData, setTrendData] = useState<any[]>([]);
  const [rankingData, setRankingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: DashboardParams = {
        siteId: activeCategory,
        timeRange,
        startDate: customDates.start,
        endDate: customDates.end
      };

      const [statsRes, trendRes, rankingRes] = await Promise.all([
        getStats(params),
        getTrend(params),
        getRanking(params)
      ]);

      // api/index.ts 中的 request 拦截器已经解包了 response.data.data
      // 所以这里直接获取返回的数据对象
      if (statsRes) {
        setStats(statsRes);
      }
      if (trendRes && trendRes.trendData) {
        setTrendData(trendRes.trendData);
      }
      if (rankingRes && rankingRes.rankingData) {
        setRankingData(rankingRes.rankingData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, timeRange, customDates]);

  useEffect(() => {
    // If custom range is selected, only fetch if both dates are present
    if (timeRange === 'custom' && (!customDates.start || !customDates.end)) {
      return;
    }
    fetchData();
  }, [fetchData, timeRange, customDates, activeCategory]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面头部 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800">数据概览</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
          {/* 分类标签 */}
          <CategoryTabs selected={activeCategory} onSelect={setActiveCategory} />
          {/* 时间范围选择 */}
          <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-lg p-1 border border-slate-200 w-full sm:w-auto overflow-x-auto">
            {['today', 'week', 'month', 'custom'].map(t => (
              <button 
                key={t} 
                onClick={() => setTimeRange(t)} // 切换时间范围
                className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded transition-all whitespace-nowrap ${
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 积分总余额 */}
        <div className="sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-500 to-blue-700 p-4 sm:p-6 rounded-xl text-white relative overflow-hidden shadow-lg shadow-blue-200">
          <p className="text-[10px] sm:text-xs font-medium opacity-80 mb-2">平台积分总余额</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">{stats.totalBalance.toLocaleString()}</span>
            <span className="text-[9px] sm:text-[10px] bg-white/20 px-1 sm:px-1.5 py-0.5 rounded font-bold">总池</span>
          </div>
          <Coins size={60} className="sm:w-20 sm:h-20 absolute -right-2 sm:-right-4 -bottom-2 sm:-bottom-4 opacity-10" />
        </div>
        {/* 商家总数 */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-100 flex items-center gap-3 sm:gap-4 card-shadow">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 shrink-0">
            <User size={20} className="sm:w-6 sm:h-6"/>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs text-slate-400 mb-1">{SITE_NAMES[activeCategory]} 商家总数</p>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-800">{stats.totalUsers.toLocaleString()}</span>
              {/* <span className="text-[9px] sm:text-[10px] text-green-500 font-bold bg-green-50 px-1 rounded">+5%</span> */}
            </div>
          </div>
        </div>
        {/* 产生消耗商家数 */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-100 flex items-center gap-3 sm:gap-4 card-shadow">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 shrink-0">
            <ArrowRight size={20} className="sm:w-6 sm:h-6"/>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs text-slate-400 mb-1">产生消耗商家数</p>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-800">{stats.activeUsers.toLocaleString()}</span>
              {/* <span className="text-[9px] sm:text-[10px] text-blue-500 font-bold">85% 活跃</span> */}
            </div>
          </div>
        </div>
        {/* 类目总消耗 */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-100 flex items-center gap-3 sm:gap-4 card-shadow">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 shrink-0">
            <Search size={20} className="sm:w-6 sm:h-6"/>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs text-slate-400 mb-1">该类目总消耗</p>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-800">{stats.totalConsumption.toLocaleString()}</span>
              <span className="text-[9px] sm:text-[10px] text-orange-500 font-bold">积分</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 每日数据趋势 */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-100 card-shadow h-[300px] sm:h-[350px] lg:h-[400px]">
          <h4 className="font-bold text-sm sm:text-base text-slate-800 mb-4 sm:mb-6 lg:mb-8">每日数据趋势 ({SITE_NAMES[activeCategory]})</h4>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <ChartTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
              <Area yAxisId="left" type="monotone" dataKey="merchants" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.05} strokeWidth={2} name="新增商家" />
              <Area yAxisId="right" type="monotone" dataKey="consumption" stroke="#f97316" fill="#f97316" fillOpacity={0.05} strokeWidth={2} name="消耗量" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 sm:gap-6 mt-2 text-[9px] sm:text-[10px] font-bold">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border-2 border-blue-500" /> 新增商家
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border-2 border-orange-500" /> 消耗量
            </div>
          </div>
        </div>
        {/* 消耗排名 */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-100 card-shadow">
          <h4 className="font-bold text-slate-800 mb-8">消耗排名 Top 5</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rankingData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#475569', fontWeight: 600}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24}>
                  {rankingData.map((_, i) => <Cell key={i} fillOpacity={1 - i * 0.15} />)}
                </Bar>
                <ChartTooltip />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
