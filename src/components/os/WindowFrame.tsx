import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Maximize2 } from 'lucide-react';
import { useOSStore, WindowState } from '@/stores/use-os-store';
import { cn } from '@/lib/utils';
interface WindowFrameProps {
  window: WindowState;
  children: React.ReactNode;
}
export function WindowFrame({ window, children }: WindowFrameProps) {
  const closeApp = useOSStore(s => s.closeApp);
  const focusWindow = useOSStore(s => s.focusWindow);
  const minimizeWindow = useOSStore(s => s.minimizeWindow);
  const activeId = useOSStore(s => s.activeWindowId);
  const isActive = activeId === window.id;
  if (window.isMinimized) return null;
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      drag
      dragMomentum={false}
      dragListener={false}
      dragControls={undefined}
      style={{
        zIndex: window.zIndex,
        width: window.width,
        height: window.height,
        left: window.x,
        top: window.y,
        position: 'absolute',
      }}
      onPointerDown={() => focusWindow(window.id)}
      className={cn(
        "flex flex-col rounded-xl overflow-hidden shadow-2xl border bg-white/80 dark:bg-black/70 backdrop-blur-xl transition-shadow",
        isActive ? "border-white/30 shadow-white/5 ring-1 ring-white/10" : "border-transparent opacity-95"
      )}
    >
      {/* Title Bar */}
      <div 
        className="h-9 flex items-center justify-between px-3 select-none cursor-default bg-white/10"
        onPointerDown={(e) => {
          // Drag handle implementation could go here with useDragControls if needed
        }}
      >
        <div className="flex items-center gap-2 w-20">
          <button 
            onClick={() => closeApp(window.id)}
            className="w-3 h-3 rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 flex items-center justify-center group"
          >
            <X className="w-2 h-2 text-black/40 opacity-0 group-hover:opacity-100" />
          </button>
          <button 
            onClick={() => minimizeWindow(window.id)}
            className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 flex items-center justify-center group"
          >
            <Minus className="w-2 h-2 text-black/40 opacity-0 group-hover:opacity-100" />
          </button>
          <button className="w-3 h-3 rounded-full bg-[#27C93F] hover:bg-[#27C93F]/80 flex items-center justify-center group">
            <Maximize2 className="w-2 h-2 text-black/40 opacity-0 group-hover:opacity-100" />
          </button>
        </div>
        <span className="text-[13px] font-semibold text-foreground/70 truncate px-4">
          {window.title}
        </span>
        <div className="w-20" />
      </div>
      {/* Content Area */}
      <div className="flex-1 overflow-auto relative">
        {children}
      </div>
    </motion.div>
  );
}