import React from 'react';
import { MenuBar } from '@/components/os/MenuBar';
import { Dock } from '@/components/os/Dock';
import { WindowFrame } from '@/components/os/WindowFrame';
import { useOSStore } from '@/stores/use-os-store';
import { TerminalApp } from '@/apps/TerminalApp';
import { AboutApp } from '@/apps/AboutApp';
import { AnimatePresence } from 'framer-motion';
export function HomePage() {
  const windows = useOSStore(s => s.windows);
  const renderAppContent = (type: string) => {
    switch (type) {
      case 'terminal': return <TerminalApp />;
      case 'about': return <AboutApp />;
      default: return (
        <div className="flex items-center justify-center h-full text-muted-foreground p-10 text-center">
          This app is under development in a future phase.
        </div>
      );
    }
  };
  return (
    <div 
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-cover bg-center bg-no-repeat select-none"
      style={{ 
        backgroundImage: `url('https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop')`,
      }}
    >
      {/* OS Shell Overlay */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      <MenuBar />
      {/* Desktop Canvas */}
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
    </div>
  );
}