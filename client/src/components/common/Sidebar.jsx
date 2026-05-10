import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, CalendarCheck, CalendarOff, Bot, Settings, LogOut, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'hr', 'employee'] },
    { to: '/employees', icon: Users, label: 'Employees', roles: ['admin', 'hr'] },
    { to: '/attendance', icon: CalendarCheck, label: 'Attendance', roles: ['admin', 'hr', 'employee'] },
    { to: '/leaves', icon: CalendarOff, label: 'Leaves', roles: ['admin', 'hr', 'employee'] },
    { to: '/ai-workspace', icon: Bot, label: 'AI Assistant', roles: ['admin', 'hr', 'employee'] },
    { to: '/settings', icon: Settings, label: 'Settings', roles: ['admin', 'hr', 'employee'] },
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <motion.aside
      initial={{ width: 260 }}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col glass border-r border-[var(--color-border)]"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--color-border)]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden">
              <h1 className="text-base font-bold glow-text whitespace-nowrap">Workplace OS</h1>
              <p className="text-[10px] text-[var(--color-text-muted)] whitespace-nowrap">Smart Management</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-[var(--color-primary)]/20 to-transparent text-[var(--color-primary-light)] border border-[var(--color-primary)]/20'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* User & Collapse */}
      <div className="p-3 border-t border-[var(--color-border)]">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-[var(--color-text-muted)] capitalize">{user?.role}</p>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Logout</span>}
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-xl hover:bg-white/5 text-[var(--color-text-muted)] transition-colors" title={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
