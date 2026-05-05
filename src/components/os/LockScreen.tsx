import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-between py-20 bg-cover bg-center select-none"
      style={{ backgroundImage: `url('${wallpaper}')` }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-xl" />
      {/* Top Section: Time & Date */}
      <div className="relative z-10 flex flex-col items-center text-white space-y-2">
        <motion.span
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-8xl font-thin tracking-tighter"
        >
          {format(time, 'h:mm')}
        </motion.span>
        <motion.span
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-light"
        >
          {format(time, 'EEEE, MMMM do')}
        </motion.span>
      </div>
      {/* Middle Section: User & Instant Entry */}
      <div className="relative z-10 w-full max-w-xs flex flex-col items-center space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-md border border-white/30 p-1 flex items-center justify-center overflow-hidden shadow-2xl"
          >
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=facearea&facepad=3"
              alt="Guest User"
              className="w-full h-full object-cover rounded-full bg-white/10"
            />
          </motion.div>
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white">Guest User</h2>
            <p className="text-white/60 text-sm font-medium">Session Ready</p>
          </div>
        </div>
        <div className="w-full flex flex-col items-center gap-6">
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => unlock()}
            className="relative w-20 h-20 rounded-full bg-white/20 backdrop-blur-2xl border border-white/40 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.15)] group overflow-hidden"
          >
            {/* Ambient Pulse Ring */}
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border border-white/60"
            />
            {/* Glass Shine Effect */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 2 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
            />
            <ArrowRight className="w-10 h-10 text-white relative z-10 transition-transform group-hover:translate-x-1" />
          </motion.button>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-white/50 text-xs flex items-center justify-center gap-1.5 font-medium tracking-wide"
          >
            <Lock className="w-3 h-3" /> CLICK TO UNLOCK
          </motion.p>
        </div>
      </div>
      <div className="relative z-10 text-white/30 text-[10px] font-bold tracking-[0.3em] uppercase">
        WebDash Cloud OS • Production Stable
      </div>
    </motion.div>
  );
}