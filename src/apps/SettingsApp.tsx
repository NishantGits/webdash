import React, { useState } from 'react';
import { Monitor, Palette, Check, Layout, Zap, Settings as SettingsIcon, RefreshCw, Smartphone } from 'lucide-react';
import { useOSStore, DockPosition } from '@/stores/use-os-store';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
const WALLPAPERS = [
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070',
  'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070',
  'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=2070',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070',
];
export function SettingsApp() {
  const [activeTab, setActiveTab] = useState<'appearance' | 'wallpaper' | 'dock' | 'animations' | 'general'>('appearance');
  const currentWallpaper = useOSStore(s => s.wallpaper);
  const setWallpaper = useOSStore(s => s.setWallpaper);
  const dockPosition = useOSStore(s => s.dockPosition);
  const setDockPosition = useOSStore(s => s.setDockPosition);
  const dockMagnification = useOSStore(s => s.dockMagnification);
  const setDockMagnification = useOSStore(s => s.setDockMagnification);
  const dockAutoHide = useOSStore(s => s.dockAutoHide);
  const setDockAutoHide = useOSStore(s => s.setDockAutoHide);
  const reduceMotion = useOSStore(s => s.reduceMotion);
  const setReduceMotion = useOSStore(s => s.setReduceMotion);
  const resetSettings = useOSStore(s => s.resetSettings);
  const { isDark, toggleTheme } = useTheme();
  const handleReset = () => {
    if (confirm("Reset all system settings to defaults? This will clear wallpaper and behavior preferences.")) {
      resetSettings();
      toast.success("Settings restored to factory defaults");
    }
  };
  return (
    <div className="flex h-full bg-background/80 backdrop-blur-3xl text-foreground select-none">
      {/* Sidebar */}
      <div className="w-56 border-r bg-muted/10 p-4 space-y-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 pb-2 pt-1">System</p>
        <button
          onClick={() => setActiveTab('appearance')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
            activeTab === 'appearance' ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-accent/50"
          )}
        >
          <Palette className="w-4 h-4" /> Appearance
        </button>
        <button
          onClick={() => setActiveTab('wallpaper')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
            activeTab === 'wallpaper' ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-accent/50"
          )}
        >
          <Monitor className="w-4 h-4" /> Wallpaper
        </button>
        <button
          onClick={() => setActiveTab('dock')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
            activeTab === 'dock' ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-accent/50"
          )}
        >
          <Layout className="w-4 h-4" /> Dock & Menu
        </button>
        <button
          onClick={() => setActiveTab('animations')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
            activeTab === 'animations' ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-accent/50"
          )}
        >
          <Zap className="w-4 h-4" /> Animations
        </button>
        <div className="pt-4" />
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 pb-2">Device</p>
        <button
          onClick={() => setActiveTab('general')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
            activeTab === 'general' ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-accent/50"
          )}
        >
          <SettingsIcon className="w-4 h-4" /> General
        </button>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto px-8 py-10">
          {activeTab === 'appearance' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-3xl font-bold tracking-tight">Appearance</h2>
              <div className="p-5 rounded-2xl border bg-card/50 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-semibold">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Prefer dark colors for windows and menus</p>
                </div>
                <Switch checked={isDark} onCheckedChange={toggleTheme} />
              </div>
            </div>
          )}
          {activeTab === 'wallpaper' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-3xl font-bold tracking-tight">Wallpaper</h2>
              <div className="aspect-video relative rounded-2xl overflow-hidden border shadow-2xl mb-8 group">
                <img src={currentWallpaper} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Preview" />
                <div className="absolute inset-0 bg-black/20 flex items-end p-6">
                  <div className="glass px-4 py-2 rounded-lg text-xs font-bold text-white uppercase tracking-widest">Active Background</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {WALLPAPERS.map((wp) => (
                  <button
                    key={wp}
                    onClick={() => setWallpaper(wp)}
                    className={cn(
                      "relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all hover:ring-4 hover:ring-primary/20",
                      currentWallpaper === wp ? "border-primary shadow-xl scale-[0.98]" : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    <img src={wp} alt="Wall" className="w-full h-full object-cover" />
                    {currentWallpaper === wp && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center"><Check className="w-6 h-6 text-white" strokeWidth={3} /></div>}
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'dock' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-3xl font-bold tracking-tight">Dock & Menu</h2>
              <div className="space-y-4">
                <div className="p-5 rounded-2xl border bg-card/50 space-y-4">
                  <p className="font-semibold">Position on screen</p>
                  <div className="flex gap-2">
                    {(['left', 'bottom', 'right'] as DockPosition[]).map(pos => (
                      <Button 
                        key={pos}
                        variant={dockPosition === pos ? 'default' : 'outline'}
                        className="flex-1 capitalize h-10"
                        onClick={() => setDockPosition(pos)}
                      >
                        {pos}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="p-5 rounded-2xl border bg-card/50 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold">Magnification</p>
                    <p className="text-xs text-muted-foreground">Scale icons when hovering over the dock</p>
                  </div>
                  <Switch checked={dockMagnification} onCheckedChange={setDockMagnification} />
                </div>
                <div className="p-5 rounded-2xl border bg-card/50 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold">Automatically hide and show</p>
                    <p className="text-xs text-muted-foreground">Only show dock when mouse is at screen edge</p>
                  </div>
                  <Switch checked={dockAutoHide} onCheckedChange={setDockAutoHide} />
                </div>
              </div>
            </div>
          )}
          {activeTab === 'animations' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-3xl font-bold tracking-tight">Animations</h2>
              <div className="p-5 rounded-2xl border bg-card/50 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-semibold">Reduce Motion</p>
                  <p className="text-xs text-muted-foreground">Disables window spring physics and bouncy dock scaling</p>
                </div>
                <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} />
              </div>
            </div>
          )}
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-3xl font-bold tracking-tight">General</h2>
              <div className="p-5 rounded-2xl border bg-card/50 space-y-4">
                <div className="flex items-center gap-4 text-destructive">
                  <RefreshCw className="w-5 h-5" />
                  <div>
                    <p className="font-bold">System Reset</p>
                    <p className="text-xs opacity-70">Clear all local storage preferences and return to factory state.</p>
                  </div>
                </div>
                <Button variant="destructive" className="w-full" onClick={handleReset}>Factory Reset</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}