import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markAllAsRead } from '../../api/analyticsApi';
import { getInitials, formatDateTime } from '../../utils/helpers';

const Navbar = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.data.notifications);
      setUnread(res.data.data.unreadCount);
    } catch { /* silently fail */ }
  };

  const handleMarkAllRead = async () => {
    try { await markAllAsRead(); setUnread(0); setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))); } catch { /* */ }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="sticky top-0 z-30 glass border-b border-[var(--color-border)] px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Greeting */}
        <div>
          <h2 className="text-lg font-semibold">{getGreeting()}, <span className="glow-text">{user?.name?.split(' ')[0]}</span></h2>
          <p className="text-xs text-[var(--color-text-muted)]">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Right: Search & Notifications */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10 w-64" />
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5 text-[var(--color-text-muted)]" />
              {unread > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[var(--color-accent)] rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                  {unread > 9 ? '9+' : unread}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showNotif && (
                <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="absolute right-0 mt-2 w-80 glass-card rounded-xl overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    <div className="flex gap-2">
                      {unread > 0 && <button onClick={handleMarkAllRead} className="text-xs text-[var(--color-primary-light)] hover:underline">Mark all read</button>}
                      <button onClick={() => setShowNotif(false)}><X className="w-4 h-4 text-[var(--color-text-muted)]" /></button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-[var(--color-text-muted)] text-center py-8">No notifications</p>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div key={n._id} className={`px-4 py-3 border-b border-[var(--color-border)] hover:bg-white/5 transition-colors ${!n.read ? 'bg-[var(--color-primary)]/5' : ''}`}>
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{formatDateTime(n.createdAt)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-sm font-bold text-white cursor-pointer">
            {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : getInitials(user?.name)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
