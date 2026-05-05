import React, { useState } from 'react';
import { motion, useDragControls, AnimatePresence } from 'framer-motion';
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
  const toggleMaximize = useOSStore(s => s.toggleMaximize);
  const activeId = useOSStore(s => s.activeWindowId);
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const isActive = activeId === window.id;
  if (window.isMinimized) return null;
  return (
    <motion.div
      layout
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: window.isMaximized ? 0 : window.x,
        y: window.isMaximized ? 0 : window.y,
        width: window.isMaximized ? '100vw' : window.width,
        height: window.isMaximized ? 'calc(100vh - 28px)' : window.height,
      }}
      exit={{ scale: 0.9, opacity: 0 }}
      drag={!window.isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
      style={{
        zIndex: window.zIndex,
        position: 'absolute',
      }}
      onPointerDown={() => focusWindow(window.id)}
      className={cn(
        "flex flex-col overflow-hidden shadow-2xl transition-shadow duration-200",
        window.isMaximized ? "rounded-none" : "rounded-xl border",
        isActive
          ? "border-blue-500/50 shadow-blue-500/20 ring-1 ring-blue-500/10"
          : "border-white/10 opacity-98",
        "bg-white/85 dark:bg-black/60 backdrop-blur-2xl"
      )}
    >
      {/* Title Bar */}
      <div
        className="h-9 flex items-center justify-between px-3 select-none cursor-default bg-white/5 shrink-0"
        onPointerDown={(e) => !window.isMaximized && dragControls.start(e)}
        onDoubleClick={() => toggleMaximize(window.id)}
      >
        <div className="flex items-center gap-2 w-24">
          <button
            onClick={(e) => { e.stopPropagation(); closeApp(window.id); }}
            className="w-3 h-3 rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 flex items-center justify-center group"
          >
            <X className="w-2 h-2 text-black/40 opacity-0 group-hover:opacity-100" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); minimizeWindow(window.id); }}
            className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 flex items-center justify-center group"
          >
            <Minus className="w-2 h-2 text-black/40 opacity-0 group-hover:opacity-100" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleMaximize(window.id); }}
            className="w-3 h-3 rounded-full bg-[#27C93F] hover:bg-[#27C93F]/80 flex items-center justify-center group"
          >
            <Maximize2 className="w-2 h-2 text-black/40 opacity-0 group-hover:opacity-100" />
          </button>
        </div>
        <span className="text-[13px] font-semibold text-foreground/70 truncate px-4 pointer-events-none">
          {window.title}
        </span>
        <div className="w-24" />
      </div>
      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence>
          {isDragging && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-transparent" 
            />
          )}
        </AnimatePresence>
        <div className="h-full overflow-auto">
          {children}
        </div>
      </div>
    </motion.div>
  );
}