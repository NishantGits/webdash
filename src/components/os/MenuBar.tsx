import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Monitor, Wifi, Battery, Search } from 'lucide-react';
import { useOSStore } from '@/stores/use-os-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
export function MenuBar() {
  const [time, setTime] = useState(new Date());
  // Zustand Zero-Tolerance Selectors
  const activeId = useOSStore(s => s.activeWindowId);
  const windows = useOSStore(s => s.windows);
  const openApp = useOSStore(s => s.openApp);
  const closeApp = useOSStore(s => s.closeApp);
  const minimizeAll = useOSStore(s => s.minimizeAll);
  const toggleSpotlight = useOSStore(s => s.toggleSpotlight);
  const updateWindowMetadata = useOSStore(s => s.updateWindowMetadata);
  const toggleMaximize = useOSStore(s => s.toggleMaximize);
  const lock = useOSStore(s => s.lock);
  const activeWindow = windows.find(w => w.id === activeId);
  const activeAppTitle = activeWindow ? activeWindow.title : 'Finder';
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const handleGo = (pathId: string | null) => {
    const finder = windows.find(w => w.appType === 'finder');
    if (finder) {
      updateWindowMetadata(finder.id, { navigateTo: pathId });
    } else {
      openApp('finder', 'Finder', { navigateTo: pathId });
    }
  };
  return (
    <div className="fixed top-0 left-0 right-0 h-7 bg-white/40 dark:bg-black/40 backdrop-blur-md border-b border-white/20 dark:border-white/10 flex items-center justify-between px-4 z-[9999] text-[13px] font-medium select-none">
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 px-2 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors outline-none">
            <Monitor className="w-4 h-4 text-foreground/90" strokeWidth={2.5} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 glass border-white/20 ml-2">
            <DropdownMenuItem onClick={() => openApp('about', 'About WebDash')}>About WebDash</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openApp('settings', 'Settings')}>System Settings...</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => lock()}>Lock Screen</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="font-bold px-3 text-foreground tracking-tight">{activeAppTitle}</span>
        <div className="hidden md:flex gap-1 text-foreground/80">
          <DropdownMenu>
            <DropdownMenuTrigger className="px-3 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded outline-none transition-colors">File</DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 glass border-white/20">
              <DropdownMenuItem onClick={() => openApp('finder', 'Finder')}>New Finder Window</DropdownMenuItem>
              <DropdownMenuItem onClick={() => openApp('terminal', 'Terminal')}>New Terminal</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={!activeId} onClick={() => activeId && closeApp(activeId)}>
                Close Window <DropdownMenuShortcut>⌘W</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="px-3 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded outline-none transition-colors">Edit</DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 glass border-white/20">
              <DropdownMenuItem>Undo</DropdownMenuItem>
              <DropdownMenuItem>Redo</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Cut</DropdownMenuItem>
              <DropdownMenuItem>Copy</DropdownMenuItem>
              <DropdownMenuItem>Paste</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="px-3 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded outline-none transition-colors">Go</DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 glass border-white/20">
              <DropdownMenuItem onClick={() => handleGo(null)}>Root Directory</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGo('root-desktop')}>Desktop</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGo('root-docs')}>Documents</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGo('root-downloads')}>Downloads</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="px-3 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded outline-none transition-colors">Window</DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 glass border-white/20">
              <DropdownMenuItem onClick={minimizeAll}>Minimize All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => activeId && toggleMaximize(activeId)}>Zoom</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex items-center gap-4 text-foreground/90">
        <Wifi className="w-4 h-4" strokeWidth={2} />
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold">85%</span>
          <Battery className="w-4 h-4" strokeWidth={2} />
        </div>
        <button 
          onClick={toggleSpotlight} 
          className="p-1 px-2 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <span className="tabular-nums px-1 font-bold">
          {format(time, 'EEE MMM d  h:mm aa')}
        </span>
      </div>
    </div>
  );
}