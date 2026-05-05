import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowRight, Lock } from 'lucide-react';
import { useOSStore } from '@/stores/use-os-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export function LockScreen() {
  const [time, setTime] = useState(new Date());
  const [password, setPassword] = useState('');
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
      <div className="relative z-10 flex flex-col items-center text-white space-y-2">
        <span className="text-8xl font-thin tracking-tighter">
          {format(time, 'h:mm')}
        </span>
        <span className="text-2xl font-light">
          {format(time, 'EEEE, MMMM do')}
        </span>
      </div>
      <div className="relative z-10 w-full max-w-xs flex flex-col items-center space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center overflow-hidden shadow-2xl">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl font-semibold text-white">Guest User</h2>
        </div>
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="relative group">
            <Input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-center rounded-full h-10 focus:ring-white/30 transition-all"
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 top-1 rounded-full h-8 w-8 bg-white/20 hover:bg-white/40 text-white border-none"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-center text-white/60 text-xs flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Click to Unlock
          </p>
        </form>
      </div>
      <div className="relative z-10 text-white/40 text-sm">
        WebDash Cloud OS v1.0.0
      </div>
    </motion.div>
  );
}