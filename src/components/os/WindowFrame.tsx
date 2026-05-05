import React, { useState } from 'react';
import { motion, useDragControls, AnimatePresence } from 'framer-motion';
import { X, Minus, Maximize2 } from 'lucide-react';
import { useOSStore, WindowState } from '@/stores/use-os-store';
import { cn } from '@/lib/utils';
interface WindowFrameProps {
  window: WindowState;
  children: React.ReactNode;
}
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
      if (direction.includes('e')) newWidth = Math.max(300, startWidth + deltaX);
      if (direction.includes('s')) newHeight = Math.max(200, startHeight + deltaY);
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
  return (
    <motion.div
      layout
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{
        scale: win.isMinimized ? 0.3 : 1,
        opacity: win.isMinimized ? 0 : 1,
        x: win.isMaximized ? 0 : win.x,
        y: win.isMaximized ? 0 : (win.isMinimized ? window.innerHeight : win.y),
        width: win.isMaximized ? '100vw' : win.width,
        height: win.isMaximized ? 'calc(100vh - 28px)' : win.height,
        pointerEvents: win.isMinimized ? 'none' : 'auto',
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
      drag={!win.isMaximized && !isResizing && !win.isMinimized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, info) => {
        setIsDragging(false);
        updateWindowPosition(win.id, win.x + info.offset.x, win.y + info.offset.y);
      }}
      style={{
        zIndex: win.zIndex,
        position: 'absolute',
      }}
      onPointerDown={() => focusWindow(win.id)}
      className={cn(
        "flex flex-col overflow-hidden shadow-2xl",
        win.isMaximized ? "rounded-none" : "rounded-xl border",
        isActive
          ? "border-blue-500/50 shadow-blue-500/20 ring-1 ring-blue-500/10"
          : "border-white/10 opacity-98",
        "bg-white/85 dark:bg-black/70 backdrop-blur-2xl"
      )}
    >
      <div
        className="h-9 flex items-center justify-between px-3 select-none cursor-default bg-white/5 shrink-0"
        onPointerDown={(e) => !win.isMaximized && dragControls.start(e)}
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        <div className="flex items-center gap-2 w-24">
          <button
            onClick={(e) => { e.stopPropagation(); closeApp(win.id); }}
            className="w-3 h-3 rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 flex items-center justify-center group"
          >
            <X className="w-2 h-2 text-black/40 opacity-0 group-hover:opacity-100" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
            className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 flex items-center justify-center group"
          >
            <Minus className="w-2 h-2 text-black/40 opacity-0 group-hover:opacity-100" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleMaximize(win.id); }}
            className="w-3 h-3 rounded-full bg-[#27C93F] hover:bg-[#27C93F]/80 flex items-center justify-center group"
          >
            <Maximize2 className="w-2 h-2 text-black/40 opacity-0 group-hover:opacity-100" />
          </button>
        </div>
        <span className="text-[13px] font-semibold text-foreground/70 truncate px-4 pointer-events-none">
          {win.title}
        </span>
        <div className="w-24" />
      </div>
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence>
          {/* Focus guard: capture clicks on inactive windows even if they contain iframes */}
          {!isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 cursor-default bg-transparent"
            />
          )}
          {/* Interaction guard during drag/resize */}
          {(isDragging || isResizing) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] bg-transparent"
            />
          )}
        </AnimatePresence>
        <div className="h-full overflow-auto custom-scrollbar">
          {children}
        </div>
      </div>
      {!win.isMaximized && (
        <>
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize z-[70]"
            onPointerDown={(e) => handleResize(e, 'e')}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-[70]"
            onPointerDown={(e) => handleResize(e, 's')}
          />
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-[80]"
            onPointerDown={(e) => handleResize(e, 'se')}
          >
            <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-foreground/20 rounded-br-sm" />
          </div>
        </>
      )}
    </motion.div>
  );
}