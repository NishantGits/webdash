import React, { useEffect } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { MenuBar } from '@/components/os/MenuBar';
import { Dock } from '@/components/os/Dock';
import { DesktopIcons } from '@/components/os/DesktopIcons';
import { WindowFrame } from '@/components/os/WindowFrame';
import { LockScreen } from '@/components/os/LockScreen';
import { Spotlight } from '@/components/os/Spotlight';
import { useOSStore } from '@/stores/use-os-store';
import { TerminalApp } from '@/apps/TerminalApp';
import { AboutApp } from '@/apps/AboutApp';
import { FinderApp } from '@/apps/FinderApp';
import { SettingsApp } from '@/apps/SettingsApp';
import { BrowserApp } from '@/apps/BrowserApp';
import { ImageViewerApp } from '@/apps/ImageViewerApp';
import { TextEditorApp } from '@/apps/TextEditorApp';
import { AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { File, Folder } from 'lucide-react';
export function HomePage() {
  const windows = useOSStore(s => s.windows);
  const isLocked = useOSStore(s => s.isLocked);
  const wallpaper = useOSStore(s => s.wallpaper);
  const toggleSpotlight = useOSStore(s => s.toggleSpotlight);
  const setVfsDragging = useOSStore(s => s.setVfsDragging);
  const notifyVfsChange = useOSStore(s => s.notifyVfsChange);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    })
  );
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
  const handleDragStart = (event: DragStartEvent) => {
    setVfsDragging(true);
  };
  const handleDragEnd = async (event: DragEndEvent) => {
    setVfsDragging(false);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const itemId = active.id as string;
      const targetParentId = over.id as string;
      try {
        await api(`/api/vfs/${itemId}`, {
          method: 'PUT',
          body: JSON.stringify({ parentId: targetParentId })
        });
        notifyVfsChange();
        toast.success('Item moved successfully');
      } catch (err) {
        console.error('Failed to move item:', err);
        toast.error('Failed to move item');
      }
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
      <AnimatePresence mode="wait">
        {isLocked ? (
          <LockScreen key="lock-screen" />
        ) : (
          <DndContext 
            sensors={sensors} 
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div key="desktop-env" className="relative w-full h-full overflow-hidden">
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
              <DragOverlay>
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/40 shadow-2xl flex items-center gap-3">
                  <File className="w-8 h-8 text-white/80" />
                  <span className="text-xs font-bold text-white uppercase tracking-tighter">Moving...</span>
                </div>
              </DragOverlay>
            </div>
          </DndContext>
        )}
      </AnimatePresence>
    </div>
  );
}