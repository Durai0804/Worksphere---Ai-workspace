import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Clock, CalendarOff, TrendingUp, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { getDashboardStats } from '../api/analyticsApi';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/helpers';
import Loader from '../components/common/Loader';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-[var(--color-text-muted)] mb-1">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </motion.div>
);

const COLORS = ['#6366f1', '#0ea5e9', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data.data);
    } catch { /* fallback data */ 
      setStats({
        totalEmployees: 10, presentToday: 7, absentToday: 3, lateToday: 1, pendingLeaves: 2,
        departmentDistribution: [{ _id: 'Engineering', count: 4 }, { _id: 'Design', count: 2 }, { _id: 'Marketing', count: 1 }, { _id: 'HR', count: 2 }, { _id: 'Finance', count: 1 }],
        attendanceTrend: [],
        recentActivity: [],
        leaveStats: [{ _id: 'pending', count: 2 }, { _id: 'approved', count: 5 }, { _id: 'rejected', count: 1 }],
      });
    } finally { setLoading(false); }
  };

  if (loading) return <Loader />;

  const attendanceData = stats?.attendanceTrend?.length ? stats.attendanceTrend.map(d => ({
    date: new Date(d._id).toLocaleDateString('en-US', { weekday: 'short' }), present: d.present, absent: d.absent,
  })) : [
    { date: 'Mon', present: 8, absent: 2 }, { date: 'Tue', present: 9, absent: 1 }, { date: 'Wed', present: 7, absent: 3 },
    { date: 'Thu', present: 10, absent: 0 }, { date: 'Fri', present: 8, absent: 2 }, { date: 'Sat', present: 3, absent: 7 }, { date: 'Sun', present: 0, absent: 10 },
  ];

  const deptData = stats?.departmentDistribution?.map(d => ({ name: d._id || 'Other', value: d.count })) || [];

  const leaveChartData = stats?.leaveStats?.map(s => ({ name: s._id, count: s.count })) || [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Overview of your workplace analytics</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Employees" value={stats?.totalEmployees || 0} color="from-violet-500 to-purple-600" delay={0.1} />
        <StatCard icon={UserCheck} label="Present Today" value={stats?.presentToday || 0} color="from-emerald-500 to-teal-600" delay={0.15} />
        <StatCard icon={UserX} label="Absent Today" value={stats?.absentToday || 0} color="from-rose-500 to-pink-600" delay={0.2} />
        <StatCard icon={CalendarOff} label="Pending Leaves" value={stats?.pendingLeaves || 0} color="from-amber-500 to-orange-600" delay={0.25} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[var(--color-primary)]" />
            <h3 className="text-sm font-semibold">Attendance Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={attendanceData}>
              <defs>
                <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '13px' }} />
              <Area type="monotone" dataKey="present" stroke="#6366f1" fill="url(#presentGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="absent" stroke="#f43f5e" fill="url(#absentGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Department Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Department Distribution</h3>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={deptData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-[var(--color-text-muted)] text-center py-10">No data</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            {deptData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{d.name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leave Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Leave Statistics</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={leaveChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '13px' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {leaveChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[var(--color-primary)]" />
            <h3 className="text-sm font-semibold">Recent Activity</h3>
          </div>
          <div className="space-y-3 max-h-52 overflow-y-auto">
            {(stats?.recentActivity?.length ? stats.recentActivity : [
              { _id: '1', action: 'System initialized', details: 'Workplace OS is ready', createdAt: new Date(), user: { name: 'System' } },
              { _id: '2', action: 'Welcome', details: 'Run the database seeder to add demo data', createdAt: new Date(), user: { name: 'Admin' } },
            ]).map((a) => (
              <div key={a._id} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.action}</p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{a.details || `by ${a.user?.name || 'System'}`}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{formatDateTime(a.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
