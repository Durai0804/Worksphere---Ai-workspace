import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) { navigate('/dashboard', { replace: true }); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogins = [
    { label: 'Admin', email: 'admin@workplace.com', pass: 'admin123', color: 'from-violet-500 to-purple-600' },
    { label: 'HR', email: 'hr@workplace.com', pass: 'hr123456', color: 'from-cyan-500 to-blue-600' },
    { label: 'Employee', email: 'john@workplace.com', pass: 'emp12345', color: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[#0a0e1a]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-secondary)]/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-accent)]/5 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/30">
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold glow-text mb-1">Workplace OS</h1>
          <p className="text-[var(--color-text-muted)] text-sm">Smart Workplace Management Platform</p>
        </div>

        {/* Form */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-[var(--color-text-muted)] mb-1.5 block">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="input-field" required />
            </div>
            <div>
              <label className="text-sm text-[var(--color-text-muted)] mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-field pr-10" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Demo logins */}
          <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)] text-center mb-3">Quick Demo Login</p>
            <div className="grid grid-cols-3 gap-2">
              {demoLogins.map((d) => (
                <button key={d.label} onClick={() => { setEmail(d.email); setPassword(d.pass); }} className={`px-3 py-2 rounded-lg bg-gradient-to-r ${d.color} text-white text-xs font-semibold hover:opacity-90 transition-opacity`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
