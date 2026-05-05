import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Apple, Wifi, Battery, Search } from 'lucide-react';
import { useOSStore } from '@/stores/use-os-store';
export function MenuBar() {
  const [time, setTime] = useState(new Date());
  const activeId = useOSStore(s => s.activeWindowId);
  const windows = useOSStore(s => s.windows);
  const activeWindow = windows.find(w => w.id === activeId);
  const activeAppTitle = activeWindow ? activeWindow.title : 'Finder';
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 h-7 bg-white/40 dark:bg-black/40 backdrop-blur-md border-b border-white/20 dark:border-white/10 flex items-center justify-between px-4 z-[9999] text-[13px] font-medium select-none">
      <div className="flex items-center gap-4">
        <Apple className="w-4 h-4" />
        <span className="font-bold">{activeAppTitle}</span>
        <div className="hidden md:flex gap-4 text-foreground/80">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Go</span>
          <span>Window</span>
          <span>Help</span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-foreground/90">
        <Wifi className="w-4 h-4" />
        <div className="flex items-center gap-1">
          <span className="text-[11px]">85%</span>
          <Battery className="w-4 h-4" />
        </div>
        <Search className="w-4 h-4" />
        <span className="tabular-nums">
          {format(time, 'EEE MMM d  h:mm aa')}
        </span>
      </div>
    </div>
  );
}