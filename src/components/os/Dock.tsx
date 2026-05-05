import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Terminal, Info, Globe, Settings, Folder } from 'lucide-react';
import { useOSStore, AppType } from '@/stores/use-os-store';
import { cn } from '@/lib/utils';
interface DockItemProps {
  icon: React.ReactNode;
  label: string;
  appType: AppType;
  mouseX: any;
  isRunning: boolean;
  isActive: boolean;
  onClick: () => void;
  position: 'bottom' | 'left' | 'right';
  magnification: boolean;
}
function DockItem({ icon, label, mouseX, isRunning, isActive, onClick, position, magnification }: DockItemProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, y: 0, width: 0, height: 0 };
    const center = position === 'bottom' ? (bounds.x + bounds.width / 2) : (bounds.y + bounds.height / 2);
    return val - center;
  });
  const sizeSync = useTransform(distance, [-150, 0, 150], [48, 80, 48]);
  const size = useSpring(sizeSync, { mass: 0.1, stiffness: 200, damping: 20 });
  const finalSize = magnification ? size : 48;
  const tooltipPosition = cn(
    "absolute bg-black/80 backdrop-blur-md text-white text-[11px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-white/10 z-[10001]",
    position === 'bottom' && "-top-12 left-1/2 -translate-x-1/2",
    position === 'left' && "left-16 top-1/2 -translate-y-1/2",
    position === 'right' && "right-16 top-1/2 -translate-y-1/2"
  );
  return (
    <motion.div
      ref={ref}
      style={position === 'bottom' ? { width: finalSize } : { height: finalSize }}
      onClick={onClick}
      className="relative group cursor-pointer flex items-center justify-center"
      whileHover={{ scale: 1.05 }}
    >
      <div className={tooltipPosition}>{label}</div>
      <motion.div
        className={cn(
          "w-full aspect-square rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-md transition-all duration-300",
          "bg-gradient-to-br from-white/20 to-white/5 border border-white/20",
          "group-hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)] group-hover:border-white/40",
          isRunning ? "ring-1 ring-white/10" : ""
        )}
        style={{ width: '100%', height: '100%' }}
        whileTap={{ scale: 0.8 }}
      >
        {React.cloneElement(icon as React.ReactElement, { className: "w-1/2 h-1/2" })}
      </motion.div>
      <div className={cn(
        "absolute flex items-center justify-center",
        position === 'bottom' ? "-bottom-2.5" : (position === 'left' ? "-right-2.5" : "-left-2.5")
      )}>
        {isRunning && (
          <motion.div
            animate={isActive ? { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className={cn(
              "w-1 h-1 rounded-full",
              isActive ? "bg-white shadow-[0_0_8px_white]" : "bg-white/40"
            )}
          />
        )}
      </div>
    </motion.div>
  );
}
export function Dock() {
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(Infinity);
  const openApp = useOSStore(s => s.openApp);
  const windows = useOSStore(s => s.windows);
  const activeWindowId = useOSStore(s => s.activeWindowId);
  const isVisible = useOSStore(s => s.isDockVisible);
  const dockPosition = useOSStore(s => s.dockPosition);
  const dockMagnification = useOSStore(s => s.dockMagnification);
  const dockAutoHide = useOSStore(s => s.dockAutoHide);
  const reduceMotion = useOSStore(s => s.reduceMotion);
  if (!isVisible) return null;
  const isRunning = (type: AppType) => windows.some(w => w.appType === type);
  const isActive = (type: AppType) => {
    const win = windows.find(w => w.id === activeWindowId);
    return win?.appType === type;
  };
  const containerClasses = cn(
    "fixed z-[9999] transition-all duration-500",
    dockPosition === 'bottom' && "bottom-4 left-1/2 -translate-x-1/2",
    dockPosition === 'left' && "left-4 top-1/2 -translate-y-1/2",
    dockPosition === 'right' && "right-4 top-1/2 -translate-y-1/2",
    dockAutoHide && !isHovered && (
      dockPosition === 'bottom' ? "translate-y-[120%]" : (dockPosition === 'left' ? "-translate-x-[120%]" : "translate-x-[120%]")
    )
  );
  return (
    <>
      {/* Target area for auto-hide */}
      {dockAutoHide && (
        <div 
          className={cn(
            "fixed z-[9998] transition-colors",
            dockPosition === 'bottom' ? "bottom-0 left-0 right-0 h-4" : (dockPosition === 'left' ? "left-0 top-0 bottom-0 w-4" : "right-0 top-0 bottom-0 w-4")
          )}
          onMouseEnter={() => setIsHovered(true)}
        />
      )}
      <div 
        className={containerClasses}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); mouseX.set(Infinity); }}
        onMouseMove={(e) => mouseX.set(dockPosition === 'bottom' ? e.pageX : e.pageY)}
      >
        <motion.div
          layout
          className={cn(
            "flex gap-3 px-4 py-3 bg-white/20 dark:bg-black/30 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-2xl",
            dockPosition === 'bottom' ? "flex-row items-end" : "flex-col items-center"
          )}
        >
          <DockItem
            icon={<Folder className="text-blue-400" />}
            label="Finder"
            appType="finder"
            mouseX={mouseX}
            isRunning={isRunning('finder')}
            isActive={isActive('finder')}
            onClick={() => openApp('finder', 'Finder')}
            position={dockPosition}
            magnification={dockMagnification && !reduceMotion}
          />
          <DockItem
            icon={<Terminal className="text-emerald-400" />}
            label="Terminal"
            appType="terminal"
            mouseX={mouseX}
            isRunning={isRunning('terminal')}
            isActive={isActive('terminal')}
            onClick={() => openApp('terminal', 'Terminal')}
            position={dockPosition}
            magnification={dockMagnification && !reduceMotion}
          />
          <DockItem
            icon={<Globe className="text-sky-400" />}
            label="Browser"
            appType="browser"
            mouseX={mouseX}
            isRunning={isRunning('browser')}
            isActive={isActive('browser')}
            onClick={() => openApp('browser', 'Browser')}
            position={dockPosition}
            magnification={dockMagnification && !reduceMotion}
          />
          <DockItem
            icon={<Settings className="text-gray-400" />}
            label="Settings"
            appType="settings"
            mouseX={mouseX}
            isRunning={isRunning('settings')}
            isActive={isActive('settings')}
            onClick={() => openApp('settings', 'Settings')}
            position={dockPosition}
            magnification={dockMagnification && !reduceMotion}
          />
          <div className={cn("bg-white/20 mx-1", dockPosition === 'bottom' ? "w-[1px] h-10 self-center" : "h-[1px] w-10 self-center")} />
          <DockItem
            icon={<Info className="text-indigo-400" />}
            label="About"
            appType="about"
            mouseX={mouseX}
            isRunning={isRunning('about')}
            isActive={isActive('about')}
            onClick={() => openApp('about', 'About WebDash')}
            position={dockPosition}
            magnification={dockMagnification && !reduceMotion}
          />
        </motion.div>
      </div>
    </>
  );
}