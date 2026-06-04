import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, LogOut, Clock, Calendar, CheckCircle, XCircle, AlertTriangle, Scan, ShieldCheck, ShieldX, Camera, X } from 'lucide-react';
import { checkIn, checkOut, getTodayAttendance, getAttendanceHistory, getMonthlySummary } from '../api/attendanceApi';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime, getStatusColor } from '../utils/helpers';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import * as faceapi from '@vladmandic/face-api';

// CDN base for face-api model weights — configurable via env
const MODEL_URL = import.meta.env.VITE_FACE_MODEL_URL || 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

// ─── Face Verification Modal ─────────────────────────────────────────
const FaceVerifyModal = ({ onSuccess, onCancel, avatarUrl }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const [step, setStep] = useState('loading'); // loading | scanning | matched | failed
  const [statusMsg, setStatusMsg] = useState('Loading AI models...');
  const [progress, setProgress] = useState(0);
  const refDescriptorRef = useRef(null);

  // Load face-api models then start webcam
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setStatusMsg('Loading AI face models (first time may take a few seconds)...');
        setProgress(10);

        if (!faceapi.nets.ssdMobilenetv1.isLoaded) {
          await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        }
        setProgress(40);
        if (!faceapi.nets.faceLandmark68Net.isLoaded) {
          await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        }
        setProgress(70);
        if (!faceapi.nets.faceRecognitionNet.isLoaded) {
          await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        }
        setProgress(90);

        if (cancelled) return;

        // Compute reference face descriptor from avatar
        setStatusMsg('Analyzing your reference profile photo...');
        const refImg = await faceapi.fetchImage(avatarUrl);
        const refDetection = await faceapi
          .detectSingleFace(refImg, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 }))
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!refDetection) {
          setStep('failed');
          setStatusMsg('No face detected in your profile picture. Please update your profile photo with a clear face image and try again.');
          return;
        }
        refDescriptorRef.current = refDetection.descriptor;
        setProgress(100);

        if (cancelled) return;

        // Start webcam
        setStatusMsg('Starting webcam...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStep('scanning');
        setStatusMsg('Align your face in the camera...');
      } catch (err) {
        if (!cancelled) {
          setStep('failed');
          setStatusMsg(`Error: ${err.message || 'Could not start face verification.'}`);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [avatarUrl]);

  // Start scanning loop once webcam is ready
  useEffect(() => {
    if (step !== 'scanning') return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || !refDescriptorRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      const displaySize = { width: video.videoWidth || 640, height: video.videoHeight || 480 };
      faceapi.matchDimensions(canvas, displaySize);

      try {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }))
          .withFaceLandmarks()
          .withFaceDescriptor();

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detection) {
          // Draw detection box
          const resized = faceapi.resizeResults(detection, displaySize);
          const { x, y, width, height } = resized.detection.box;

          const distance = faceapi.euclideanDistance(refDescriptorRef.current, detection.descriptor);
          const matched = distance < 0.55;

          // Draw box
          ctx.strokeStyle = matched ? '#10b981' : '#f43f5e';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);

          // Label
          ctx.fillStyle = matched ? '#10b981' : '#f43f5e';
          ctx.font = 'bold 14px Inter, sans-serif';
          ctx.fillText(
            matched ? `✓ Identity Verified (${(1 - distance).toFixed(2)})` : `✗ No Match (${distance.toFixed(2)})`,
            x, y > 20 ? y - 8 : y + height + 20
          );

          if (matched) {
            clearInterval(intervalRef.current);
            setStep('matched');
            setStatusMsg('Identity verified! Checking you in...');
            // Stop webcam
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(t => t.stop());
            }
            setTimeout(() => onSuccess(), 1000);
          } else {
            setStatusMsg(`Face detected — verifying identity (score: ${(1 - distance).toFixed(2)})`);
          }
        } else {
          setStatusMsg('No face detected — please look directly at the camera...');
        }
      } catch {
        // silently ignore per-frame errors
      }
    }, 700);

    return () => clearInterval(intervalRef.current);
  }, [step]);

  const handleCancel = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    onCancel();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md glass-card p-6 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Scan className="w-5 h-5 text-[var(--color-primary)]" />
              <h2 className="text-lg font-bold glow-text">Face ID Verification</h2>
            </div>
            <button onClick={handleCancel} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-[var(--color-text-muted)]" />
            </button>
          </div>

          {/* Status message */}
          <div className={`text-xs px-3 py-2 rounded-lg mb-4 flex items-center gap-2 ${
            step === 'matched' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
            step === 'failed' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' :
            'bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] border border-[var(--color-primary)]/20'
          }`}>
            {step === 'matched' && <ShieldCheck className="w-4 h-4 flex-shrink-0" />}
            {step === 'failed' && <ShieldX className="w-4 h-4 flex-shrink-0" />}
            {(step === 'loading' || step === 'scanning') && (
              <motion.div
                className="w-3.5 h-3.5 rounded-full border-2 border-[var(--color-primary)] border-t-transparent flex-shrink-0"
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              />
            )}
            <span>{statusMsg}</span>
          </div>

          {/* Loading progress bar */}
          {step === 'loading' && (
            <div className="w-full bg-[var(--color-surface-lighter)] rounded-full h-1.5 mb-4">
              <motion.div
                className="h-1.5 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          )}

          {/* Camera view */}
          {(step === 'scanning' || step === 'matched') && (
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-[var(--color-border)] mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full scale-x-[-1]"
                style={{ pointerEvents: 'none' }}
              />
              {/* Corner brackets */}
              {[['top-2 left-2', 'border-t-2 border-l-2'], ['top-2 right-2', 'border-t-2 border-r-2'],
                ['bottom-2 left-2', 'border-b-2 border-l-2'], ['bottom-2 right-2', 'border-b-2 border-r-2']
              ].map(([pos, borders], i) => (
                <div key={i} className={`absolute ${pos} w-6 h-6 ${borders} border-[var(--color-primary)] rounded-sm`} />
              ))}

              {/* Matched overlay */}
              {step === 'matched' && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/25"
                >
                  <ShieldCheck className="w-14 h-14 text-emerald-400 mb-2" />
                  <span className="text-emerald-400 font-bold text-lg">Verified!</span>
                </motion.div>
              )}
            </div>
          )}

          {/* Failed state */}
          {step === 'failed' && (
            <div className="text-center py-6">
              <ShieldX className="w-14 h-14 text-rose-400 mx-auto mb-3" />
              <p className="text-sm text-[var(--color-text-muted)]">Please go to <strong>Settings → Profile</strong> and upload a clear, well-lit face photo, then try again.</p>
              <button onClick={handleCancel} className="btn-secondary mt-4 text-sm">Close</button>
            </div>
          )}

          {/* Tips */}
          {step === 'scanning' && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {['Good lighting', 'Face the camera', 'Remove glasses if needed'].map(tip => (
                <div key={tip} className="text-center text-[10px] text-[var(--color-text-muted)] bg-white/3 rounded-lg py-1.5 px-1">
                  {tip}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Main Attendance Page ─────────────────────────────────────────────
const Attendance = () => {
  const { user } = useAuth();
  const [todayStatus, setTodayStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showFaceVerify, setShowFaceVerify] = useState(false);

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

  const handleCheckInClick = () => {
    if (!user?.avatar) {
      toast.error('Please upload your profile photo in Settings first to enable Face ID check-in.', { duration: 5000 });
      return;
    }
    setShowFaceVerify(true);
  };

  const handleFaceVerifySuccess = async () => {
    setShowFaceVerify(false);
    setActionLoading(true);
    try {
      const res = await checkIn();
      toast.success(`✅ ${res.data.message}`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
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

      {/* Face ID Check-in Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center">
        {/* Clock */}
        <div className="text-5xl font-bold glow-text mb-2">
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          {!isCheckedIn && !isCheckedOut && (
            <button
              onClick={handleCheckInClick}
              disabled={actionLoading}
              className="btn-primary px-8 py-3 text-base"
            >
              {actionLoading ? (
                <motion.div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent"
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
              ) : <><Scan className="w-5 h-5" /> Face ID Check In</>}
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

        {/* Today's times */}
        {todayStatus && (
          <div className="flex justify-center gap-8 mt-6 text-sm">
            {todayStatus.checkIn && <div><span className="text-[var(--color-text-muted)]">Check In: </span><span className="font-semibold text-[var(--color-success)]">{formatTime(todayStatus.checkIn)}</span></div>}
            {todayStatus.checkOut && <div><span className="text-[var(--color-text-muted)]">Check Out: </span><span className="font-semibold text-[var(--color-accent)]">{formatTime(todayStatus.checkOut)}</span></div>}
            {todayStatus.workHours > 0 && <div><span className="text-[var(--color-text-muted)]">Hours: </span><span className="font-semibold">{todayStatus.workHours}h</span></div>}
          </div>
        )}

        {/* No avatar warning */}
        {!user?.avatar && !isCheckedIn && !isCheckedOut && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-xs text-amber-400 flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            No reference photo set. Go to <strong className="ml-1">Settings → Profile</strong> to upload or capture your face photo.
          </motion.p>
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

      {/* Face Verification Modal */}
      {showFaceVerify && (
        <FaceVerifyModal
          avatarUrl={user.avatar}
          onSuccess={handleFaceVerifySuccess}
          onCancel={() => setShowFaceVerify(false)}
        />
      )}
    </div>
  );
};

export default Attendance;
