import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Info, Globe, Settings, Folder } from 'lucide-react';
import { useOSStore, AppType } from '@/stores/use-os-store';
interface DockItemProps {
  icon: React.ReactNode;
  label: string;
  appType: AppType;
  isActive: boolean;
  onClick: () => void;
}
function DockItem({ icon, label, appType, isActive, onClick }: DockItemProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.3, y: -10 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="relative group cursor-pointer flex flex-col items-center"
    >
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {label}
      </div>
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center shadow-lg backdrop-blur-sm">
        {icon}
      </div>
      {isActive && (
        <div className="absolute -bottom-1.5 w-1 h-1 bg-foreground rounded-full" />
      )}
    </motion.div>
  );
}
export function Dock() {
  const openApp = useOSStore(s => s.openApp);
  const windows = useOSStore(s => s.windows);
  const isRunning = (type: AppType) => windows.some(w => w.appType === type);
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999]">
      <div className="flex items-end gap-3 px-3 py-2 bg-white/20 dark:bg-black/30 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl">
        <DockItem
          icon={<Folder className="w-8 h-8 text-blue-400" />}
          label="Finder"
          appType="finder"
          isActive={isRunning('finder')}
          onClick={() => openApp('finder', 'Finder')}
        />
        <DockItem
          icon={<Terminal className="w-8 h-8 text-emerald-400" />}
          label="Terminal"
          appType="terminal"
          isActive={isRunning('terminal')}
          onClick={() => openApp('terminal', 'Terminal')}
        />
        <DockItem
          icon={<Globe className="w-8 h-8 text-sky-400" />}
          label="Browser"
          appType="browser"
          isActive={isRunning('browser')}
          onClick={() => openApp('browser', 'Browser')}
        />
        <DockItem
          icon={<Settings className="w-8 h-8 text-gray-400" />}
          label="Settings"
          appType="settings"
          isActive={isRunning('settings')}
          onClick={() => openApp('settings', 'Settings')}
        />
        <div className="w-[1px] h-10 bg-white/20 mx-1 mb-1" />
        <DockItem
          icon={<Info className="w-8 h-8 text-indigo-400" />}
          label="About"
          appType="about"
          isActive={isRunning('about')}
          onClick={() => openApp('about', 'About WebDash')}
        />
      </div>
    </div>
  );
}