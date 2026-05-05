import React, { useState } from 'react';
import { motion, useDragControls, AnimatePresence } from 'framer-motion';
import { X, Minus, Maximize2 } from 'lucide-react';
import { useOSStore, WindowState } from '@/stores/use-os-store';
import { cn } from '@/lib/utils';
interface WindowFrameProps {
  window: WindowState;
  children: React.ReactNode;
}
const MENU_BAR_HEIGHT = 28;
export function WindowFrame({ window: win, children }: WindowFrameProps) {
  const closeApp = useOSStore(s => s.closeApp);
  const focusWindow = useOSStore(s => s.focusWindow);
  const minimizeWindow = useOSStore(s => s.minimizeWindow);
  const toggleMaximize = useOSStore(s => s.toggleMaximize);
  const updateWindowSize = useOSStore(s => s.updateWindowSize);
  const updateWindowPosition = useOSStore(s => s.updateWindowPosition);
  const activeId = useOSStore(s => s.activeWindowId);
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const isActive = activeId === win.id;
  const handleResize = (e: React.PointerEvent, direction: 'se' | 'e' | 's') => {
    e.stopPropagation();
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = win.width;
    const startHeight = win.height;
    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      let newWidth = startWidth;
      let newHeight = startHeight;
      if (direction.includes('e')) newWidth = Math.max(350, startWidth + deltaX);
      if (direction.includes('s')) newHeight = Math.max(250, startHeight + deltaY);
      updateWindowSize(win.id, newWidth, newHeight);
    };
    const onPointerUp = () => {
      setIsResizing(false);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };
  const handleDragEnd = (_: any, info: any) => {
    setIsDragging(false);
    const newX = win.x + info.offset.x;
    const newY = win.y + info.offset.y;
    // Boundary enforcement: ensure title bar is always clickable and accessible
    const constrainedX = Math.max(-win.width + 100, Math.min(window.innerWidth - 100, newX));
    const constrainedY = Math.max(MENU_BAR_HEIGHT, Math.min(window.innerHeight - 50, newY));
    updateWindowPosition(win.id, constrainedX, constrainedY);
  };
  return (
    <motion.div
      layout
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{
        scale: win.isMinimized ? 0.4 : 1,
        opacity: win.isMinimized ? 0 : 1,
        x: win.isMaximized ? 0 : win.x,
        y: win.isMaximized ? 0 : (win.isMinimized ? window.innerHeight : win.y),
        width: win.isMaximized ? '100vw' : win.width,
        height: win.isMaximized ? `calc(100vh - ${MENU_BAR_HEIGHT}px)` : win.height,
        pointerEvents: win.isMinimized ? 'none' : 'auto',
      }}
      transition={{
        type: 'spring',
        damping: 30,
        stiffness: 400,
        mass: 0.5,
      }}
      drag={!win.isMaximized && !isResizing && !win.isMinimized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      style={{
        zIndex: win.zIndex,
        position: 'absolute',
      }}
      onPointerDown={() => focusWindow(win.id)}
      className={cn(
        "flex flex-col overflow-hidden shadow-2xl transition-[border-color,box-shadow,opacity] duration-200",
        win.isMaximized ? "rounded-none" : "rounded-xl border",
        isActive
          ? "border-blue-500/60 shadow-blue-500/10 ring-[0.5px] ring-blue-500/20"
          : "border-white/10 dark:border-white/5 opacity-95",
        "bg-white/90 dark:bg-[#121212]/80 backdrop-blur-3xl"
      )}
    >
      {/* Title Bar */}
      <div
        className="h-10 flex items-center justify-between px-4 select-none cursor-default bg-white/5 shrink-0 active:bg-white/10 transition-colors"
        onPointerDown={(e) => !win.isMaximized && dragControls.start(e)}
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        <div className="flex items-center gap-2.5 w-24">
          <button
            onClick={(e) => { e.stopPropagation(); closeApp(win.id); }}
            className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-black/10 flex items-center justify-center group active:scale-90 transition-transform"
          >
            <X className="w-2.5 h-2.5 text-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
            className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-black/10 flex items-center justify-center group active:scale-90 transition-transform"
          >
            <Minus className="w-2.5 h-2.5 text-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleMaximize(win.id); }}
            className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-black/10 flex items-center justify-center group active:scale-90 transition-transform"
          >
            <Maximize2 className="w-2.5 h-2.5 text-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
        <span className="text-[13px] font-bold text-foreground/60 tracking-tight truncate px-4 pointer-events-none">
          {win.title}
        </span>
        <div className="w-24" />
      </div>
      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false}>
          {/* Focus guard: snappier transitions for inactive window masking */}
          {!isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute inset-0 z-50 cursor-default bg-black/0"
            />
          )}
          {/* Drag guard: immediate blocking for iframes */}
          {(isDragging || isResizing) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0 }}
              className="absolute inset-0 z-[60] bg-transparent"
            />
          )}
        </AnimatePresence>
        <div className="h-full overflow-auto custom-scrollbar rounded-b-xl">
          {children}
        </div>
      </div>
      {/* Resize Handles */}
      {!win.isMaximized && (
        <>
          <div
            className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize z-[70] hover:bg-primary/5 transition-colors"
            onPointerDown={(e) => handleResize(e, 'e')}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize z-[70] hover:bg-primary/5 transition-colors"
            onPointerDown={(e) => handleResize(e, 's')}
          />
          <div
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-[80] flex items-end justify-end p-1 group"
            onPointerDown={(e) => handleResize(e, 'se')}
          >
            <div className="w-3 h-3 border-r-[1.5px] border-b-[1.5px] border-foreground/20 rounded-br-sm group-hover:border-primary/50 transition-colors" />
          </div>
        </>
      )}
    </motion.div>
  );
}