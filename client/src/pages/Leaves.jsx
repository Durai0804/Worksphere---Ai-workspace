import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, X, Calendar, Clock } from 'lucide-react';
import { applyLeave, getLeaves, getLeaveBalance, updateLeaveStatus } from '../api/leaveApi';
import { useAuth } from '../context/AuthContext';
import { formatDate, getStatusColor } from '../utils/helpers';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const LeaveForm = ({ onSubmit, onClose }) => {
  const [form, setForm] = useState({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form); };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Leave Type</label><select name="leaveType" value={form.leaveType} onChange={handleChange} className="input-field"><option value="sick">Sick Leave</option><option value="casual">Casual Leave</option><option value="paid">Paid Leave</option></select></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Start Date</label><input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="input-field" required /></div>
        <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">End Date</label><input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="input-field" required /></div>
      </div>
      <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Reason</label><textarea name="reason" value={form.reason} onChange={handleChange} className="input-field" rows={3} required /></div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">Submit Request</button>
      </div>
    </form>
  );
};

const Leaves = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => { loadData(); }, [filter]);

  const loadData = async () => {
    try {
      const [leavesRes, balanceRes] = await Promise.all([getLeaves({ status: filter, limit: 50 }), getLeaveBalance()]);
      setLeaves(leavesRes.data.data);
      setBalance(balanceRes.data.data);
    } catch { /* */ } finally { setLoading(false); }
  };

  const handleApply = async (data) => {
    try { await applyLeave(data); toast.success('Leave request submitted'); setShowModal(false); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleStatusUpdate = async (id, status) => {
    try { await updateLeaveStatus(id, { status }); toast.success(`Leave ${status}`); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <Loader />;

  const leaveTypes = [
    { key: 'sick', label: 'Sick Leave', color: 'from-rose-500 to-pink-600', icon: '🏥' },
    { key: 'casual', label: 'Casual Leave', color: 'from-amber-500 to-orange-600', icon: '🌴' },
    { key: 'paid', label: 'Paid Leave', color: 'from-emerald-500 to-teal-600', icon: '💰' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h1 className="text-2xl font-bold">Leave Management</h1><p className="text-sm text-[var(--color-text-muted)]">Manage your leave requests</p></div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" />Apply Leave</button>
      </div>

      {/* Balance Cards */}
      {balance && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {leaveTypes.map((t, i) => (
            <motion.div key={t.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{t.icon}</span>
                <span className={`text-3xl font-bold bg-gradient-to-r ${t.color} bg-clip-text text-transparent`}>{balance[t.key]}</span>
              </div>
              <p className="text-sm font-medium">{t.label}</p>
              <p className="text-xs text-[var(--color-text-muted)]">days remaining</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {['', 'pending', 'approved', 'rejected'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-[var(--color-primary)] text-white' : 'glass-card text-[var(--color-text-muted)] hover:text-white'}`}>
            {f ? f.charAt(0).toUpperCase() + f.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {/* Leave List */}
      <div className="space-y-3">
        {leaves.map((leave, i) => (
          <motion.div key={leave._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-5">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`status-badge ${getStatusColor(leave.status)}`}>{leave.status}</span>
                  <span className="text-sm font-medium capitalize">{leave.leaveType} Leave</span>
                  <span className="text-xs text-[var(--color-text-muted)]">• {leave.totalDays} day(s)</span>
                </div>
                {leave.user && <p className="text-sm text-[var(--color-text-muted)] mb-1">By: {leave.user.name} ({leave.user.department})</p>}
                <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</span>
                </div>
                <p className="text-sm mt-2">{leave.reason}</p>
                {leave.comments && <p className="text-xs text-[var(--color-text-muted)] mt-1 italic">Comment: {leave.comments}</p>}
              </div>
              {['admin', 'hr'].includes(user?.role) && leave.status === 'pending' && (
                <div className="flex items-start gap-2">
                  <button onClick={() => handleStatusUpdate(leave._id, 'approved')} className="p-2 rounded-lg bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20 transition-colors" title="Approve"><Check className="w-4 h-4" /></button>
                  <button onClick={() => handleStatusUpdate(leave._id, 'rejected')} className="p-2 rounded-lg bg-[var(--color-danger)]/10 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/20 transition-colors" title="Reject"><X className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {leaves.length === 0 && <p className="text-center text-[var(--color-text-muted)] py-12">No leave requests</p>}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Apply for Leave">
        <LeaveForm onSubmit={handleApply} onClose={() => setShowModal(false)} />
      </Modal>
    </div>
  );
};

export default Leaves;
