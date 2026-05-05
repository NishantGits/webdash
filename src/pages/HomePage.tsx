import React, { useEffect } from 'react';
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
export function HomePage() {
  const windows = useOSStore(s => s.windows);
  const isLocked = useOSStore(s => s.isLocked);
  const wallpaper = useOSStore(s => s.wallpaper);
  const toggleSpotlight = useOSStore(s => s.toggleSpotlight);
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
          <div key="desktop-env" className="relative w-full h-full overflow-hidden">
            <MenuBar />
            {/* Desktop Layer: Icons & Background Context Menu */}
            <DesktopIcons />
            {/* Window Management Layer */}
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
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}