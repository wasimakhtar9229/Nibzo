import React from 'react';
import { motion } from 'motion/react';
import { 
  Star, MessageSquare, ShieldCheck, Ticket, Users, TrendingUp 
} from 'lucide-react';
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const kpis = [
  { id: 1, title: 'Average Rating', value: '4.8', change: '+0.2', trend: 'up', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 2, title: 'Total Reviews', value: '1,248', change: '+12%', trend: 'up', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 3, title: 'Recovery Cases', value: '84', change: '-5%', trend: 'down', icon: ShieldCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
  { id: 4, title: 'Rewards Redeemed', value: '352', change: '+18%', trend: 'up', icon: Ticket, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 5, title: 'Repeat Customers', value: '64%', change: '+4%', trend: 'up', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 6, title: 'Revenue Impact', value: '$12,450', change: '+22%', trend: 'up', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' }
];

const reviewTrends = [
  { name: 'Mon', positive: 45, negative: 5 },
  { name: 'Tue', positive: 52, negative: 3 },
  { name: 'Wed', positive: 48, negative: 6 },
  { name: 'Thu', positive: 61, negative: 4 },
  { name: 'Fri', positive: 85, negative: 12 },
  { name: 'Sat', positive: 110, negative: 15 },
  { name: 'Sun', positive: 95, negative: 8 }
];

const ratingDistribution = [
  { name: '5 Stars', count: 850 },
  { name: '4 Stars', count: 250 },
  { name: '3 Stars', count: 100 },
  { name: '2 Stars', count: 35 },
  { name: '1 Star', count: 13 }
];
const ratingColors = ['#10b981', '#34d399', '#fbbf24', '#f87171', '#ef4444'];

const complaintCategories = [
  { name: 'Wait Time', value: 45 },
  { name: 'Food Quality', value: 25 },
  { name: 'Service', value: 20 },
  { name: 'Pricing', value: 10 }
];
const complaintColors = ['#0f766e', '#14b8a6', '#5eead4', '#ccfbf1'];

const recoverySuccess = [
  { month: 'Jan', rate: 75 },
  { month: 'Feb', rate: 78 },
  { month: 'Mar', rate: 82 },
  { month: 'Apr', rate: 85 },
  { month: 'May', rate: 89 },
  { month: 'Jun', rate: 92 }
];

const customerRetention = [
  { month: 'Jan', returning: 40, new: 60 },
  { month: 'Feb', returning: 45, new: 55 },
  { month: 'Mar', returning: 48, new: 62 },
  { month: 'Apr', returning: 55, new: 58 },
  { month: 'May', returning: 60, new: 70 },
  { month: 'Jun', returning: 64, new: 75 }
];

export function RestaurantDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Performance Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time reputation metrics and analytics from all sources.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors shadow-sm">
            Download Report
          </button>
          <div className="px-4 py-2 border border-slate-200 bg-white text-slate-900 rounded-lg font-medium text-sm shadow-sm flex items-center gap-2">
            <span>Last 30 Days</span>
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className={`text-xs font-bold px-2 py-1 rounded-full ${kpi.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {kpi.change}
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{kpi.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{kpi.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Review Trends */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Review Trends</h3>
            <p className="text-sm text-slate-500">Volume and sentiment analysis over time</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reviewTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPos)" />
                <Area type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorNeg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Rating Distribution</h3>
            <p className="text-sm text-slate-500">Breakdown of star ratings across all platforms</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDistribution} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13, fontWeight: 500}} width={60} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ratingColors[index % ratingColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaint Categories & Recovery Success */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 xl:col-span-2">
          
          <div className="flex-1">
            <div className="mb-6 text-center">
              <h3 className="text-lg font-bold text-slate-900">Complaint Radar</h3>
              <p className="text-sm text-slate-500">Primary friction points</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complaintCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {complaintCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={complaintColors[index % complaintColors.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {complaintCategories.map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: complaintColors[i]}}></div>
                  <span className="text-xs text-slate-600 font-medium">{cat.name} ({cat.value}%)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-px bg-slate-200 hidden md:block"></div>

          <div className="flex-1">
            <div className="mb-6 text-center">
              <h3 className="text-lg font-bold text-slate-900">Recovery Success</h3>
              <p className="text-sm text-slate-500">Conversion of complaints to 5-star updates</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recoverySuccess} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={['dataMin - 10', 'auto']} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                  <Line type="monotone" dataKey="rate" stroke="#0f766e" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6, fill: '#0f766e'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Customer Retention */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm xl:col-span-2">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Customer Retention Cohorts</h3>
              <p className="text-sm text-slate-500">New vs. Returning diners captured via QR</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-teal-600"></div>
                <span className="text-xs text-slate-600 font-medium">Returning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-slate-200"></div>
                <span className="text-xs text-slate-600 font-medium">New</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerRetention} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="returning" stackId="a" fill="#0f766e" radius={[0, 0, 4, 4]} barSize={32} />
                <Bar dataKey="new" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
