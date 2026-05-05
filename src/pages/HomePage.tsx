import React, { useEffect } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { MenuBar } from '@/components/os/MenuBar';
import { Dock } from '@/components/os/Dock';
import { DesktopIcons } from '@/components/os/DesktopIcons';
import { WindowFrame } from '@/components/os/WindowFrame';
import { LockScreen } from '@/components/os/LockScreen';
import { Spotlight } from '@/components/os/Spotlight';
import { useOSStore } from '@/stores/use-os-store';
import { useVfsStore } from '@/stores/use-vfs-store';
import { TerminalApp } from '@/apps/TerminalApp';
import { AboutApp } from '@/apps/AboutApp';
import { FinderApp } from '@/apps/FinderApp';
import { SettingsApp } from '@/apps/SettingsApp';
import { BrowserApp } from '@/apps/BrowserApp';
import { ImageViewerApp } from '@/apps/ImageViewerApp';
import { TextEditorApp } from '@/apps/TextEditorApp';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { File } from 'lucide-react';
export function HomePage() {
  const windows = useOSStore(s => s.windows);
  const isLocked = useOSStore(s => s.isLocked);
  const wallpaper = useOSStore(s => s.wallpaper);
  const toggleSpotlight = useOSStore(s => s.toggleSpotlight);
  const setVfsDragging = useOSStore(s => s.setVfsDragging);
  const reduceMotion = useOSStore(s => s.reduceMotion);
  const startupApps = useOSStore(s => s.startupApps);
  const openApp = useOSStore(s => s.openApp);
  const seed = useVfsStore(s => s.seed);
  const moveItem = useVfsStore(s => s.moveItem);
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  });
  const sensors = useSensors(pointerSensor);
  // Initialize Local VFS
  useEffect(() => {
    seed();
  }, [seed]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleSpotlight();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSpotlight]);
  useEffect(() => {
    if (!isLocked && startupApps.length > 0 && windows.length === 0) {
      startupApps.forEach(app => {
        if (app === 'finder') openApp('finder', 'Finder');
      });
    }
  }, [isLocked, startupApps, openApp, windows.length]);
  const handleDragStart = (event: DragStartEvent) => {
    setVfsDragging(true);
  };
  const handleDragEnd = (event: DragEndEvent) => {
    setVfsDragging(false);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      moveItem(active.id as string, over.id as string);
      toast.success('Moved successfully');
    }
  };
  const renderAppContent = (type: string) => {
    switch (type) {
      case 'terminal': return <TerminalApp />;
      case 'about': return <AboutApp />;
      case 'finder': return <FinderApp />;
      case 'settings': return <SettingsApp />;
      case 'browser': return <BrowserApp />;
      case 'image-viewer': return <ImageViewerApp />;
      case 'text-editor': return <TextEditorApp />;
      default: return (
        <div className="flex items-center justify-center h-full text-muted-foreground p-10 text-center">
          This app is under development.
        </div>
      );
    }
  };
  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-cover bg-center bg-no-repeat select-none"
      style={{ backgroundImage: `url('${wallpaper}')` }}
    >
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      <AnimatePresence mode="wait" initial={false}>
        {isLocked ? (
          <LockScreen key="lock-screen" />
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <motion.div
              key="desktop-env"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative w-full h-full overflow-hidden"
            >
              <MenuBar />
              <DesktopIcons />
              <main className="relative w-full h-full pt-7 pb-20 overflow-hidden pointer-events-none">
                <AnimatePresence initial={false}>
                  {windows.map((win) => (
                    <div key={win.id} className="pointer-events-auto">
                      <WindowFrame window={win}>
                        {renderAppContent(win.appType)}
                      </WindowFrame>
                    </div>
                  ))}
                </AnimatePresence>
              </main>
              <Spotlight />
              <Dock />
              <DragOverlay dropAnimation={null}>
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/40 shadow-2xl flex items-center gap-3">
                  <File className="w-8 h-8 text-white/80" />
                  <span className="text-xs font-bold text-white uppercase tracking-tighter">Moving...</span>
                </div>
              </DragOverlay>
            </motion.div>
          </DndContext>
        )}
      </AnimatePresence>
    </div>
  );
}