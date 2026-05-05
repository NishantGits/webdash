import React, { useState } from 'react';
import { Monitor, Palette, Info, Check } from 'lucide-react';
import { useOSStore } from '@/stores/use-os-store';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
const WALLPAPERS = [
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070',
  'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070',
  'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=2070',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070',
];
export function SettingsApp() {
  const [activeTab, setActiveTab] = useState<'appearance' | 'wallpaper' | 'about'>('appearance');
  const currentWallpaper = useOSStore(s => s.wallpaper);
  const setWallpaper = useOSStore(s => s.setWallpaper);
  const { isDark, toggleTheme } = useTheme();
  return (
    <div className="flex h-full bg-background/50 backdrop-blur-md text-foreground select-none">
      {/* Sidebar */}
      <div className="w-48 border-r bg-muted/20 p-4 space-y-1">
        <button
          onClick={() => setActiveTab('appearance')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            activeTab === 'appearance' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          )}
        >
          <Palette className="w-4 h-4" />
          Appearance
        </button>
        <button
          onClick={() => setActiveTab('wallpaper')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            activeTab === 'wallpaper' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          )}
        >
          <Monitor className="w-4 h-4" />
          Wallpaper
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            activeTab === 'about' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          )}
        >
          <Info className="w-4 h-4" />
          About
        </button>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Appearance</h2>
            <div className="p-4 rounded-xl border bg-card flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Adjust the system color theme</p>
              </div>
              <Button variant="outline" onClick={toggleTheme}>
                {isDark ? 'Switch to Light' : 'Switch to Dark'}
              </Button>
            </div>
          </div>
        )}
        {activeTab === 'wallpaper' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Wallpaper</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {WALLPAPERS.map((wp) => (
                <div
                  key={wp}
                  onClick={() => setWallpaper(wp)}
                  className={cn(
                    "relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer group transition-all",
                    currentWallpaper === wp ? "border-primary scale-105" : "border-transparent hover:border-white/50"
                  )}
                >
                  <img src={wp} alt="Wallpaper" className="w-full h-full object-cover" />
                  {currentWallpaper === wp && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'about' && (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl flex items-center justify-center">
              <Monitor className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">WebDash OS</h3>
              <p className="text-sm text-muted-foreground">Version 1.0.0-alpha</p>
            </div>
            <p className="max-w-xs text-xs text-muted-foreground leading-relaxed">
              Designed to simulate a modern cloud-native operating system using React, Hono, and Cloudflare Durable Objects.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}