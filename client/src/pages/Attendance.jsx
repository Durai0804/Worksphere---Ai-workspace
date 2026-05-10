import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut, Clock, Calendar, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { checkIn, checkOut, getTodayAttendance, getAttendanceHistory, getMonthlySummary } from '../api/attendanceApi';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime, getStatusColor } from '../utils/helpers';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const Attendance = () => {
  const { user } = useAuth();
  const [todayStatus, setTodayStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const [todayRes, historyRes, summaryRes] = await Promise.all([
        getTodayAttendance(), getAttendanceHistory({}), getMonthlySummary({})
      ]);
      setTodayStatus(todayRes.data.data);
      setHistory(historyRes.data.data);
      setSummary(summaryRes.data.data);
    } catch { /* */ } finally { setLoading(false); }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const res = await checkIn();
      toast.success(res.data.message);
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Check-in failed'); }
    finally { setActionLoading(false); }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const res = await checkOut();
      toast.success(res.data.message);
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Check-out failed'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <Loader />;

  const isCheckedIn = todayStatus?.checkIn && !todayStatus?.checkOut;
  const isCheckedOut = todayStatus?.checkOut;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Track your daily attendance</p>
      </div>

      {/* Clock & Check-in Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center">
        <div className="text-5xl font-bold glow-text mb-2">
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="flex justify-center gap-4">
          {!isCheckedIn && !isCheckedOut && (
            <button onClick={handleCheckIn} disabled={actionLoading} className="btn-primary px-8 py-3 text-base">
              <LogIn className="w-5 h-5" /> Check In
            </button>
          )}
          {isCheckedIn && (
            <button onClick={handleCheckOut} disabled={actionLoading} className="btn-danger px-8 py-3 text-base flex items-center gap-2">
              <LogOut className="w-5 h-5" /> Check Out
            </button>
          )}
          {isCheckedOut && (
            <div className="flex items-center gap-2 text-[var(--color-success)]">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Completed for today</span>
            </div>
          )}
        </div>

        {todayStatus && (
          <div className="flex justify-center gap-8 mt-6 text-sm">
            {todayStatus.checkIn && <div><span className="text-[var(--color-text-muted)]">Check In: </span><span className="font-semibold text-[var(--color-success)]">{formatTime(todayStatus.checkIn)}</span></div>}
            {todayStatus.checkOut && <div><span className="text-[var(--color-text-muted)]">Check Out: </span><span className="font-semibold text-[var(--color-accent)]">{formatTime(todayStatus.checkOut)}</span></div>}
            {todayStatus.workHours > 0 && <div><span className="text-[var(--color-text-muted)]">Hours: </span><span className="font-semibold">{todayStatus.workHours}h</span></div>}
          </div>
        )}
      </motion.div>

      {/* Monthly Summary */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { icon: CheckCircle, label: 'Present', value: summary.present, color: 'text-[var(--color-success)]' },
            { icon: XCircle, label: 'Absent', value: summary.absent, color: 'text-[var(--color-danger)]' },
            { icon: AlertTriangle, label: 'Late', value: summary.late, color: 'text-[var(--color-warning)]' },
            { icon: Calendar, label: 'Half Day', value: summary.halfDay, color: 'text-[var(--color-secondary)]' },
            { icon: Clock, label: 'Total Hours', value: `${summary.totalWorkHours}h`, color: 'text-[var(--color-primary-light)]' },
            { icon: Clock, label: 'Avg Hours', value: `${summary.avgWorkHours}h`, color: 'text-[var(--color-text)]' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="glass-card p-4 text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* History Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h3 className="text-sm font-semibold">Attendance History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Check In</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Check Out</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Hours</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 15).map((a) => (
                <tr key={a._id} className="border-b border-[var(--color-border)] hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3 text-sm">{formatDate(a.date)}</td>
                  <td className="px-5 py-3 text-sm text-[var(--color-success)]">{a.checkIn ? formatTime(a.checkIn) : '—'}</td>
                  <td className="px-5 py-3 text-sm text-[var(--color-accent)]">{a.checkOut ? formatTime(a.checkOut) : '—'}</td>
                  <td className="px-5 py-3 text-sm">{a.workHours ? `${a.workHours}h` : '—'}</td>
                  <td className="px-5 py-3"><span className={`status-badge ${getStatusColor(a.status)}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {history.length === 0 && <p className="text-center text-[var(--color-text-muted)] py-8">No attendance records</p>}
      </motion.div>
    </div>
  );
};

export default Attendance;
