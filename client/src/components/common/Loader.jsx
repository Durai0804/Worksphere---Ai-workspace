import { motion } from 'framer-motion';

const Loader = ({ fullScreen = false }) => (
  <div className={`flex items-center justify-center ${fullScreen ? 'h-screen w-screen fixed inset-0 bg-[#0a0e1a] z-50' : 'py-20'}`}>
    <motion.div className="flex gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {[0, 1, 2].map((i) => (
        <motion.div key={i} className="w-3 h-3 rounded-full bg-[var(--color-primary)]"
          animate={{ y: [0, -12, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }} />
      ))}
    </motion.div>
  </div>
);

export default Loader;
