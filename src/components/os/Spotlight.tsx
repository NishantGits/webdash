import React, { useEffect, useRef } from 'react';
import { Search, Terminal, Info, Globe, Settings, Folder, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore, AppType } from '@/stores/use-os-store';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  const inputRef = useRef<HTMLInputElement>(null);
  // Robust focus management
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  const handleLaunch = (app: typeof APPS[0]) => {
    openApp(app.type, app.name);
    setSpotlight(false);
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-start justify-center pt-[18vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setSpotlight(false)}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-xl glass border-white/20 rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <Command className="flex flex-col bg-transparent">
              <div className="flex items-center px-4 border-b border-white/10">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <CommandInput
                  ref={inputRef}
                  placeholder="Search applications..."
                  className="flex-1 bg-transparent border-none outline-none text-lg py-6 placeholder:text-muted-foreground/40"
                />
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/10 text-[10px] text-muted-foreground font-bold border border-white/5">
                  ESC
                </div>
              </div>
              <CommandList className="max-h-[320px] overflow-y-auto p-2 custom-scrollbar">
                <CommandEmpty className="py-10 text-center flex flex-col items-center gap-2">
                  <Search className="w-8 h-8 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">No applications match your search.</p>
                </CommandEmpty>
                <CommandGroup heading="Applications" className="px-2 py-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  {APPS.map((app) => (
                    <CommandItem
                      key={app.type}
                      onSelect={() => handleLaunch(app)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-default aria-selected:bg-blue-600 aria-selected:text-white group transition-all"
                    >
                      <div className={cn("p-1.5 rounded-lg bg-white/5 transition-colors group-aria-selected:bg-white/20")}>
                        <app.icon className={cn("w-5 h-5", app.color, "group-aria-selected:text-white")} />
                      </div>
                      <span className="text-sm font-medium">{app.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}