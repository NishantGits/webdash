import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowRight, Lock } from 'lucide-react';
import { useOSStore } from '@/stores/use-os-store';
export function LockScreen() {
  const [time, setTime] = useState(new Date());
  const unlock = useOSStore(s => s.unlock);
  const wallpaper = useOSStore(s => s.wallpaper);
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-between py-20 bg-cover bg-center select-none"
      style={{ backgroundImage: `url('${wallpaper}')` }}
    >
      {/* Animated breathing overlay */}
      <motion.div 
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-black/40 backdrop-blur-2xl" 
      />
      {/* Top Section: Time & Date */}
      <div className="relative z-10 flex flex-col items-center text-white space-y-2 drop-shadow-2xl">
        <motion.span
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-8xl font-thin tracking-tighter"
        >
          {format(time, 'h:mm')}
        </motion.span>
        <motion.span
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="text-2xl font-light opacity-80"
        >
          {format(time, 'EEEE, MMMM do')}
        </motion.span>
      </div>
      {/* Middle Section: Entry Interaction */}
      <div className="relative z-10 w-full max-w-xs flex flex-col items-center justify-center flex-1">
        <div className="w-full flex flex-col items-center gap-8">
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => unlock()}
            className="relative w-24 h-24 rounded-full bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.1)] group overflow-hidden transition-colors"
          >
            {/* Ambient Pulse Rings */}
            <motion.div
              animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border border-white/30"
            />
            {/* Glass Shine Animation */}
            <motion.div
              animate={{ x: ['-150%', '250%'] }}
              transition={{ repeat: Infinity, duration: 5, ease: "linear", repeatDelay: 0.5 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12"
            />
            <ArrowRight className="w-12 h-12 text-white relative z-10 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
          </motion.button>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-white text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-2">
              <Lock className="w-3 h-3" /> Click to Unlock
            </p>
          </motion.div>
        </div>
      </div>
      {/* Footer Section */}
      <div className="relative z-10 flex flex-col items-center gap-1">
        <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <p className="text-white/40 text-[9px] font-black tracking-[0.4em] uppercase">
            WebDash Cloud OS • Version 1.1.0
          </p>
        </div>
      </div>
    </motion.div>
  );
}