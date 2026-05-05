import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
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
}
function DockItem({ icon, label, mouseX, isRunning, isActive, onClick }: DockItemProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });
  const widthSync = useTransform(distance, [-150, 0, 150], [48, 80, 48]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });
  return (
    <motion.div
      ref={ref}
      style={{ width }}
      onClick={onClick}
      className="relative group cursor-pointer flex flex-col items-center"
    >
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-[11px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-white/10">
        {label}
      </div>
      <motion.div 
        className="w-full aspect-square rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center shadow-lg backdrop-blur-md"
        whileTap={{ scale: 0.85 }}
      >
        {React.cloneElement(icon as React.ReactElement, { className: "w-1/2 h-1/2" })}
      </motion.div>
      <div className="absolute -bottom-2.5 flex items-center justify-center gap-1">
        {isRunning && (
          <div className={cn(
            "w-1 h-1 rounded-full transition-all duration-300",
            isActive ? "bg-white scale-125 shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-white/40"
          )} />
        )}
      </div>
    </motion.div>
  );
}
export function Dock() {
  const mouseX = useMotionValue(Infinity);
  const openApp = useOSStore(s => s.openApp);
  const windows = useOSStore(s => s.windows);
  const activeWindowId = useOSStore(s => s.activeWindowId);
  const isRunning = (type: AppType) => windows.some(w => w.appType === type);
  const isActive = (type: AppType) => {
    const win = windows.find(w => w.id === activeWindowId);
    return win?.appType === type;
  };
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] px-4">
      <motion.div 
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-end gap-3 px-4 py-3 bg-white/20 dark:bg-black/30 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-2xl"
      >
        <DockItem
          icon={<Folder className="text-blue-400" />}
          label="Finder"
          appType="finder"
          mouseX={mouseX}
          isRunning={isRunning('finder')}
          isActive={isActive('finder')}
          onClick={() => openApp('finder', 'Finder')}
        />
        <DockItem
          icon={<Terminal className="text-emerald-400" />}
          label="Terminal"
          appType="terminal"
          mouseX={mouseX}
          isRunning={isRunning('terminal')}
          isActive={isActive('terminal')}
          onClick={() => openApp('terminal', 'Terminal')}
        />
        <DockItem
          icon={<Globe className="text-sky-400" />}
          label="Browser"
          appType="browser"
          mouseX={mouseX}
          isRunning={isRunning('browser')}
          isActive={isActive('browser')}
          onClick={() => openApp('browser', 'Browser')}
        />
        <DockItem
          icon={<Settings className="text-gray-400" />}
          label="Settings"
          appType="settings"
          mouseX={mouseX}
          isRunning={isRunning('settings')}
          isActive={isActive('settings')}
          onClick={() => openApp('settings', 'Settings')}
        />
        <div className="w-[1px] h-10 bg-white/20 mx-1 mb-1 self-center" />
        <DockItem
          icon={<Info className="text-indigo-400" />}
          label="About"
          appType="about"
          mouseX={mouseX}
          isRunning={isRunning('about')}
          isActive={isActive('about')}
          onClick={() => openApp('about', 'About WebDash')}
        />
      </motion.div>
    </div>
  );
}