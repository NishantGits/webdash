import React, { useState } from 'react';
import { Monitor, Palette, Info, Check, Cpu, HardDrive, ShieldCheck } from 'lucide-react';
import { useOSStore } from '@/stores/use-os-store';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
    <div className="flex h-full bg-background/80 backdrop-blur-3xl text-foreground select-none">
      {/* Sidebar */}
      <div className="w-56 border-r bg-muted/10 p-4 space-y-1">
        <button
          onClick={() => setActiveTab('appearance')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
            activeTab === 'appearance' ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-accent/50"
          )}
        >
          <Palette className="w-4 h-4" />
          Appearance
        </button>
        <button
          onClick={() => setActiveTab('wallpaper')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
            activeTab === 'wallpaper' ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-accent/50"
          )}
        >
          <Monitor className="w-4 h-4" />
          Wallpaper
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
            activeTab === 'about' ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-accent/50"
          )}
        >
          <Info className="w-4 h-4" />
          About
        </button>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-10">
          {activeTab === 'appearance' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-3xl font-bold tracking-tight">Appearance</h2>
              <div className="grid gap-4">
                <div className="p-5 rounded-2xl border bg-card/50 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-base">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark system interface</p>
                  </div>
                  <Switch checked={isDark} onCheckedChange={toggleTheme} />
                </div>
              </div>
            </div>
          )}
          {activeTab === 'wallpaper' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-3xl font-bold tracking-tight">Wallpaper</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {WALLPAPERS.map((wp) => (
                  <div
                    key={wp}
                    onClick={() => setWallpaper(wp)}
                    className={cn(
                      "relative aspect-[16/10] rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-[1.02]",
                      currentWallpaper === wp ? "border-primary shadow-xl ring-2 ring-primary/20" : "border-transparent opacity-80 hover:opacity-100"
                    )}
                  >
                    <img src={wp} alt="Wallpaper" className="w-full h-full object-cover" />
                    {currentWallpaper === wp && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="bg-primary text-primary-foreground rounded-full p-1.5">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'about' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl flex items-center justify-center">
                  <Monitor className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black">WebDash OS</h1>
                  <p className="text-lg text-muted-foreground">Version 1.1.0-alpha (Build 2025)</p>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/20">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Processor</p>
                    <p className="font-medium">Cloudflare Workers Runtime (V8 Isolates)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/20">
                  <HardDrive className="w-5 h-5 text-emerald-400" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Storage</p>
                    <p className="font-medium">Transactional Durable Objects (Encrypted)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/20">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Security</p>
                    <p className="font-medium">Sandboxed WebAssembly execution environment</p>
                  </div>
                </div>
              </div>
              <div className="text-center pt-8 border-t">
                <p className="text-sm text-muted-foreground italic">"Cloud-native computing, redefined for the browser."</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}