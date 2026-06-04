import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Palette, Save, Upload, Camera } from 'lucide-react';
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

  const [showWebcam, setShowWebcam] = useState(false);
  const [webcamLoading, setWebcamLoading] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startWebcam = async () => {
    setShowWebcam(true);
    setWebcamLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 320 } });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      toast.error('Could not access webcam. Please check permissions.');
      setShowWebcam(false);
    } finally {
      setWebcamLoading(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowWebcam(false);
  };

  const captureWebcam = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 320, 320);
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });
      await uploadAvatar(file);
      stopWebcam();
    }, 'image/jpeg', 0.9);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      return toast.error('File size must be less than 2MB');
    }
    await uploadAvatar(file);
  };

  const uploadAvatar = async (file) => {
    const loadingToast = toast.loading('Uploading profile picture...');
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      const res = await updateProfile(formData);
      updateUser(res.data.data);
      toast.success('Profile picture updated successfully!', { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload profile picture', { id: loadingToast });
    }
  };

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
              
              <div className="flex flex-col md:flex-row gap-6 items-start mb-8 pb-6 border-b border-[var(--color-border)]">
                {/* Avatar Display */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-2xl font-bold text-white overflow-hidden border border-[var(--color-border)]">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user?.name)
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-lg font-semibold">{user?.name}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">{user?.email}</p>
                    <p className="text-xs text-[var(--color-primary-light)] font-medium capitalize mt-1">Role: {user?.role}</p>
                  </div>
                  
                  {/* Photo Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => document.getElementById('avatar-input').click()} className="btn-secondary text-xs py-1.5 px-3">
                      <Upload className="w-3.5 h-3.5" /> Upload File
                    </button>
                    <button type="button" onClick={startWebcam} className="btn-secondary text-xs py-1.5 px-3">
                      <Camera className="w-3.5 h-3.5" /> Use Webcam
                    </button>
                    <input id="avatar-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </div>
                </div>
              </div>

              {/* Webcam Box */}
              {showWebcam && (
                <div className="glass p-4 rounded-xl border border-[var(--color-primary)]/20 mb-6 flex flex-col items-center max-w-sm">
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">Align your face inside the camera view</p>
                  <div className="relative w-64 h-64 bg-black rounded-xl overflow-hidden mb-3 border border-[var(--color-border)]">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                    {webcamLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <span className="text-xs text-[var(--color-text-muted)] animate-pulse">Camera starting...</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={captureWebcam} className="btn-primary text-xs py-1.5 px-3">
                      Capture Photo
                    </button>
                    <button type="button" onClick={stopWebcam} className="btn-secondary text-xs py-1.5 px-3">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

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
