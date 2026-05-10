import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0e1a]">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center relative z-10">
        <motion.h1 className="text-9xl font-black glow-text mb-4" animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>404</motion.h1>
        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="text-[var(--color-text-muted)] mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex justify-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-secondary"><ArrowLeft className="w-4 h-4" />Go Back</button>
          <button onClick={() => navigate('/dashboard')} className="btn-primary"><Home className="w-4 h-4" />Dashboard</button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
