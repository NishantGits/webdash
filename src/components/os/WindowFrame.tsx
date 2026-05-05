import React, { useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
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
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = React.useState(false);
  const isActive = activeId === window.id;
  if (window.isMinimized) return null;
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
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
        "flex flex-col rounded-xl overflow-hidden shadow-2xl border bg-white/90 dark:bg-black/70 backdrop-blur-xl transition-shadow duration-200",
        isActive 
          ? "border-blue-500/50 shadow-blue-500/10 ring-1 ring-blue-500/20" 
          : "border-white/10 opacity-95 shadow-black/20"
      )}
    >
      {/* Title Bar */}
      <div
        className="h-9 flex items-center justify-between px-3 select-none cursor-default bg-white/10 shrink-0"
        onPointerDown={(e) => dragControls.start(e)}
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
          <button className="w-3 h-3 rounded-full bg-[#27C93F] hover:bg-[#27C93F]/80 flex items-center justify-center group">
            <Maximize2 className="w-2 h-2 text-black/40 opacity-0 group-hover:opacity-100" />
          </button>
        </div>
        <span className="text-[13px] font-semibold text-foreground/80 truncate px-4 pointer-events-none">
          {window.title}
        </span>
        <div className="w-24" />
      </div>
      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Iframe Shield Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-transparent" />
        )}
        <div className="h-full overflow-auto">
          {children}
        </div>
      </div>
    </motion.div>
  );
}