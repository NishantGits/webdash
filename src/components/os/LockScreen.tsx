import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowRight, Lock, ChevronRight } from 'lucide-react';
import { useOSStore } from '@/stores/use-os-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export function LockScreen() {
  const [time, setTime] = useState(new Date());
  const [password, setPassword] = useState('');
  const [showInput, setShowInput] = useState(false);
  const unlock = useOSStore(s => s.unlock);
  const wallpaper = useOSStore(s => s.wallpaper);
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    unlock();
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
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
      {/* Middle Section: User & Interactive Entry */}
      <div className="relative z-10 w-full max-w-xs flex flex-col items-center space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border border-white/30 p-1 flex items-center justify-center overflow-hidden shadow-2xl"
          >
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="User"
              className="w-full h-full object-cover rounded-full bg-white/10"
            />
          </motion.div>
          <h2 className="text-xl font-semibold text-white">Guest User</h2>
        </div>
        <div className="w-full flex flex-col items-center gap-6">
          <AnimatePresence mode="wait">
            {!showInput ? (
              <motion.button
                key="entry-button"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInput(true)}
                className="relative w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] group overflow-hidden"
              >
                {/* Shine effect */}
                <motion.div 
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 1 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                />
                {/* Pulse ring */}
                <motion.div
                  animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-full border border-white/50"
                />
                <ArrowRight className="w-8 h-8 text-white relative z-10" />
              </motion.button>
            ) : (
              <motion.form
                key="password-input"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                onSubmit={handleLogin}
                className="w-full space-y-4"
              >
                <div className="relative group">
                  <Input
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-center rounded-full h-12 focus:ring-white/30 transition-all backdrop-blur-md"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-1.5 top-1.5 rounded-full h-9 w-9 bg-white/20 hover:bg-white/40 text-white border-none"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowInput(false)}
                  className="text-white/40 text-xs hover:text-white/60 transition-colors w-full text-center"
                >
                  Cancel
                </button>
              </motion.form>
            )}
          </AnimatePresence>
          {!showInput && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-white/60 text-xs flex items-center justify-center gap-1"
            >
              <Lock className="w-3 h-3" /> Click button to unlock
            </motion.p>
          )}
        </div>
      </div>
      <div className="relative z-10 text-white/40 text-sm font-medium tracking-wide">
        WEBDASH CLOUD OS
      </div>
    </motion.div>
  );
}