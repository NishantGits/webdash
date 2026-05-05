import React from 'react';
import { MenuBar } from '@/components/os/MenuBar';
import { Dock } from '@/components/os/Dock';
import { WindowFrame } from '@/components/os/WindowFrame';
import { LockScreen } from '@/components/os/LockScreen';
import { useOSStore } from '@/stores/use-os-store';
import { TerminalApp } from '@/apps/TerminalApp';
import { AboutApp } from '@/apps/AboutApp';
import { FinderApp } from '@/apps/FinderApp';
import { SettingsApp } from '@/apps/SettingsApp';
import { BrowserApp } from '@/apps/BrowserApp';
import { ImageViewerApp } from '@/apps/ImageViewerApp';
import { AnimatePresence } from 'framer-motion';
export function HomePage() {
  const windows = useOSStore(s => s.windows);
  const isLocked = useOSStore(s => s.isLocked);
  const wallpaper = useOSStore(s => s.wallpaper);
  const renderAppContent = (type: string) => {
    switch (type) {
      case 'terminal': return <TerminalApp />;
      case 'about': return <AboutApp />;
      case 'finder': return <FinderApp />;
      case 'settings': return <SettingsApp />;
      case 'browser': return <BrowserApp />;
      case 'image-viewer': return <ImageViewerApp />;
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
      style={{
        backgroundImage: `url('${wallpaper}')`,
      }}
    >
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      <AnimatePresence>
        {isLocked ? (
          <LockScreen key="lock-screen" />
        ) : (
          <React.Fragment key="desktop">
            <MenuBar />
            <main className="relative w-full h-full pt-7 pb-20">
              <AnimatePresence>
                {windows.map((win) => (
                  <WindowFrame key={win.id} window={win}>
                    {renderAppContent(win.appType)}
                  </WindowFrame>
                ))}
              </AnimatePresence>
            </main>
            <Dock />
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
}