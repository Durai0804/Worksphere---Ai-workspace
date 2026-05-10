import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Palette, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, updatePassword } from '../api/authApi';
import { getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', department: user?.department || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notifPref, setNotifPref] = useState(user?.notificationPreferences || { email: true, push: true, sms: false });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile(profile);
      updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match');
    if (passwords.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      await updatePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password updated!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'security', icon: Lock, label: 'Security' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-sm text-[var(--color-text-muted)]">Manage your account preferences</p></div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-56 flex lg:flex-col gap-2">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary-light)] border border-[var(--color-primary)]/20' : 'text-[var(--color-text-muted)] hover:bg-white/5'}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {tab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-6">Profile Information</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-xl font-bold text-white">
                  {getInitials(user?.name)}
                </div>
                <div>
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">{user?.email}</p>
                  <p className="text-xs text-[var(--color-text-muted)] capitalize mt-0.5">Role: {user?.role}</p>
                </div>
              </div>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Full Name</label><input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="input-field" /></div>
                <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Phone</label><input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="input-field" /></div>
                <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Department</label><input value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} className="input-field" /></div>
                <button type="submit" className="btn-primary"><Save className="w-4 h-4" />Save Changes</button>
              </form>
            </motion.div>
          )}

          {tab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-6">Change Password</h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Current Password</label><input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} className="input-field" required /></div>
                <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">New Password</label><input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="input-field" required /></div>
                <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Confirm Password</label><input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} className="input-field" required /></div>
                <button type="submit" className="btn-primary"><Lock className="w-4 h-4" />Update Password</button>
              </form>
            </motion.div>
          )}

          {tab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-6">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
                  { key: 'sms', label: 'SMS Notifications', desc: 'Receive SMS alerts' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
                    <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-[var(--color-text-muted)]">{item.desc}</p></div>
                    <button onClick={() => setNotifPref({ ...notifPref, [item.key]: !notifPref[item.key] })} className={`w-11 h-6 rounded-full transition-colors relative ${notifPref[item.key] ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-lighter)]'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notifPref[item.key] ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
