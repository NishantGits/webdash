import React from 'react';
import { Command } from 'cmdk';
import { Search, Terminal, Info, Globe, Settings, Folder, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore, AppType } from '@/stores/use-os-store';
import { cn } from '@/lib/utils';
const APPS: { name: string; type: AppType; icon: any; color: string }[] = [
  { name: 'Finder', type: 'finder', icon: Folder, color: 'text-blue-400' },
  { name: 'Terminal', type: 'terminal', icon: Terminal, color: 'text-emerald-400' },
  { name: 'Browser', type: 'browser', icon: Globe, color: 'text-sky-400' },
  { name: 'Settings', type: 'settings', icon: Settings, color: 'text-gray-400' },
  { name: 'About WebDash', type: 'about', icon: Info, color: 'text-indigo-400' },
  { name: 'Text Editor', type: 'text-editor', icon: FileText, color: 'text-orange-400' },
];
export function Spotlight() {
  const isOpen = useOSStore(s => s.isSpotlightOpen);
  const setSpotlight = useOSStore(s => s.setSpotlight);
  const openApp = useOSStore(s => s.openApp);
  const handleLaunch = (app: typeof APPS[0]) => {
    openApp(app.type, app.name);
    setSpotlight(false);
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setSpotlight(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-xl glass border-white/20 rounded-2xl shadow-2xl overflow-hidden"
          >
            <Command className="flex flex-col">
              <div className="flex items-center border-b border-white/10 px-4 h-14">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <Command.Input
                  autoFocus
                  placeholder="Search apps, files, and settings..."
                  className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/50"
                />
              </div>
              <Command.List className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground">No results found.</Command.Empty>
                <Command.Group heading="Applications" className="px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  {APPS.map((app) => (
                    <Command.Item
                      key={app.type}
                      onSelect={() => handleLaunch(app)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-default aria-selected:bg-primary aria-selected:text-primary-foreground group transition-all"
                    >
                      <app.icon className={cn("w-5 h-5 transition-colors", app.color, "group-aria-selected:text-white")} />
                      <span className="text-sm font-medium">{app.name}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}