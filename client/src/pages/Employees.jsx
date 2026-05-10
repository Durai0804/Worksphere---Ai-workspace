import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Edit2, Trash2, Mail, Phone, Building } from 'lucide-react';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../api/employeeApi';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import { formatDate, getInitials, getStatusColor, DEPARTMENTS, ROLES } from '../utils/helpers';
import toast from 'react-hot-toast';

const EmployeeForm = ({ employee, onSubmit, onClose }) => {
  const [form, setForm] = useState({
    name: employee?.name || '', email: employee?.email || '', password: '', role: employee?.role || 'employee',
    department: employee?.department || '', phone: employee?.phone || '', salary: employee?.salary || '', status: employee?.status || 'active',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    if (!data.password) delete data.password;
    data.salary = Number(data.salary) || 0;
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Full Name *</label><input name="name" value={form.name} onChange={handleChange} className="input-field" required /></div>
        <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Email *</label><input type="email" name="email" value={form.email} onChange={handleChange} className="input-field" required /></div>
        {!employee && <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Password *</label><input type="password" name="password" value={form.password} onChange={handleChange} className="input-field" required={!employee} /></div>}
        <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Role</label><select name="role" value={form.role} onChange={handleChange} className="input-field">{ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}</select></div>
        <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Department</label><select name="department" value={form.department} onChange={handleChange} className="input-field"><option value="">Select...</option>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
        <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Phone</label><input name="phone" value={form.phone} onChange={handleChange} className="input-field" /></div>
        <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Salary</label><input type="number" name="salary" value={form.salary} onChange={handleChange} className="input-field" /></div>
        <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Status</label><select name="status" value={form.status} onChange={handleChange} className="input-field"><option value="active">Active</option><option value="inactive">Inactive</option><option value="on-leave">On Leave</option></select></div>
      </div>
      <div className="flex justify-end gap-3 pt-3">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">{employee ? 'Update' : 'Add'} Employee</button>
      </div>
    </form>
  );
};

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => { loadEmployees(); }, [page, search, deptFilter]);

  const loadEmployees = async () => {
    try {
      const res = await getEmployees({ page, limit: 10, search, department: deptFilter });
      setEmployees(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load employees'); } finally { setLoading(false); }
  };

  const handleCreate = async (data) => {
    try {
      await createEmployee(data);
      toast.success('Employee added!');
      setShowModal(false);
      loadEmployees();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleUpdate = async (data) => {
    try {
      await updateEmployee(editingEmp._id, data);
      toast.success('Employee updated!');
      setEditingEmp(null);
      loadEmployees();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee?')) return;
    try {
      await deleteEmployee(id);
      toast.success('Employee deleted');
      loadEmployees();
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{pagination.total || 0} total employees</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" />Add Employee</button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field pl-10" />
        </div>
        <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }} className="input-field w-48">
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Employee</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Department</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Joined</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => (
                <motion.tr key={emp._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-[var(--color-border)] hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {emp.avatar ? <img src={emp.avatar} className="w-full h-full rounded-full object-cover" /> : getInitials(emp.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{emp.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><span className="text-sm flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />{emp.department || '—'}</span></td>
                  <td className="px-5 py-3.5"><span className="text-sm capitalize">{emp.role}</span></td>
                  <td className="px-5 py-3.5"><span className={`status-badge ${getStatusColor(emp.status)}`}>{emp.status}</span></td>
                  <td className="px-5 py-3.5"><span className="text-sm text-[var(--color-text-muted)]">{formatDate(emp.joiningDate)}</span></td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setEditingEmp(emp)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Edit"><Edit2 className="w-4 h-4 text-[var(--color-primary-light)]" /></button>
                      {user?.role === 'admin' && <button onClick={() => handleDelete(emp._id)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Delete"><Trash2 className="w-4 h-4 text-[var(--color-accent)]" /></button>}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {employees.length === 0 && <p className="text-center text-[var(--color-text-muted)] py-12">No employees found</p>}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 py-4 border-t border-[var(--color-border)]">
            {Array.from({ length: pagination.pages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-white/10 text-[var(--color-text-muted)]'}`}>{i + 1}</button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Employee" size="lg">
        <EmployeeForm onSubmit={handleCreate} onClose={() => setShowModal(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingEmp} onClose={() => setEditingEmp(null)} title="Edit Employee" size="lg">
        <EmployeeForm employee={editingEmp} onSubmit={handleUpdate} onClose={() => setEditingEmp(null)} />
      </Modal>
    </div>
  );
};

export default Employees;
