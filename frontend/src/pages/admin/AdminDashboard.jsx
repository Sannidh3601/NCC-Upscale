import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import DashboardLayout from '../../components/DashboardLayout';
import { StatSkeleton } from '../../components/Skeleton';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, TrendingUp, IndianRupee, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/dashboard-stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const chartColors = ['#F59E0B', '#7C3AED', '#10B981', '#EF4444'];

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const revenueData = stats?.monthlyRevenue?.map(r => ({
    month: monthNames[new Date(r.month).getMonth()],
    revenue: parseFloat(r.total),
  })) || [];

  const taskData = [
    { name: 'Completed', value: stats?.taskCompletionRate || 0, color: '#10B981' },
    { name: 'Remaining', value: 100 - (stats?.taskCompletionRate || 0), color: '#2A2A2A' },
  ];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />) : (
            <>
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Total Users</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><Users size={18} className="text-blue-400" /></div>
                </div>
                <p className="text-3xl font-bold">{stats?.totalUsers}</p>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Active Courses</span>
                  <div className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center"><BookOpen size={18} className="text-amber" /></div>
                </div>
                <p className="text-3xl font-bold">{stats?.activeCourses}</p>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Tasks Completed</span>
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center"><TrendingUp size={18} className="text-green-400" /></div>
                </div>
                <p className="text-3xl font-bold">{stats?.taskCompletionRate}%</p>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Revenue (Month)</span>
                  <div className="w-10 h-10 rounded-xl bg-purple/10 flex items-center justify-center"><IndianRupee size={18} className="text-purple" /></div>
                </div>
                <p className="text-3xl font-bold">₹{stats?.revenueThisMonth?.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Total: ₹{stats?.totalRevenue?.toLocaleString()}</p>
              </div>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="month" stroke="#666" tick={{ fontSize: 12 }} />
                <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#F59E0B" fill="url(#revenueGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Task Completion</h3>
            <div className="flex justify-center">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={taskData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" startAngle={90} endAngle={-270}>
                    {taskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-2xl font-bold mt-2">{stats?.taskCompletionRate}%</p>
            <p className="text-center text-sm text-gray-400">Tasks Completed</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Top Courses</h3>
            <div className="space-y-3">
              {stats?.topCourses?.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center text-amber text-sm font-bold">{i + 1}</span>
                    <div>
                      <p className="font-medium text-sm">{c.title}</p>
                      <p className="text-xs text-gray-400">{c.enrollments} enrollments</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-amber">₹{parseFloat(c.revenue).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {stats?.recentActivity?.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm"><span className="font-semibold">{a.name}</span> enrolled in <span className="text-amber">{a.course_title}</span></p>
                    <p className="text-xs text-gray-300">{new Date(a.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                <p className="text-sm text-gray-400">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
