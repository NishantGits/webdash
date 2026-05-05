import { create } from 'zustand';
export type AppType = 'terminal' | 'about' | 'browser' | 'settings' | 'finder' | 'image-viewer';
export interface WindowState {
  id: string;
  title: string;
  appType: AppType;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  metadata?: any;
}
interface OSStore {
  windows: WindowState[];
  activeWindowId: string | null;
  zIndexCounter: number;
  isLocked: boolean;
  wallpaper: string;
  openApp: (appType: AppType, title: string, metadata?: any) => void;
  closeApp: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
  updateWindowTitle: (id: string, title: string) => void;
  unlock: () => void;
  lock: () => void;
  setWallpaper: (url: string) => void;
}
export const useOSStore = create<OSStore>((set) => ({
  windows: [],
  activeWindowId: null,
  zIndexCounter: 10,
  isLocked: true,
  wallpaper: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop',
  openApp: (appType, title, metadata) => set((state) => {
    const existing = state.windows.find(w => w.appType === appType && appType !== 'image-viewer');
    if (existing) {
      const nextZ = state.zIndexCounter + 1;
      return {
        activeWindowId: existing.id,
        zIndexCounter: nextZ,
        windows: state.windows.map(w =>
          w.id === existing.id ? { ...w, isMinimized: false, zIndex: nextZ, metadata: metadata ?? w.metadata } : w
        )
      };
    }
    const id = Math.random().toString(36).substring(7);
    const nextZ = state.zIndexCounter + 1;
    const newWindow: WindowState = {
      id,
      title,
      appType,
      x: 100 + (state.windows.length * 40),
      y: 100 + (state.windows.length * 40),
      width: appType === 'finder' ? 800 : appType === 'browser' ? 900 : 600,
      height: appType === 'finder' ? 500 : appType === 'browser' ? 600 : 400,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZ,
      metadata,
    };
    return {
      windows: [...state.windows, newWindow],
      activeWindowId: id,
      zIndexCounter: nextZ,
    };
  }),
  closeApp: (id) => set((state) => ({
    windows: state.windows.filter(w => w.id !== id),
    activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
  })),
  focusWindow: (id) => set((state) => {
    if (state.activeWindowId === id) return {};
    const nextZ = state.zIndexCounter + 1;
    return {
      activeWindowId: id,
      zIndexCounter: nextZ,
      windows: state.windows.map(w =>
        w.id === id ? { ...w, zIndex: nextZ, isMinimized: false } : w
      ),
    };
  }),
  minimizeWindow: (id) => set((state) => ({
    windows: state.windows.map(w =>
      w.id === id ? { ...w, isMinimized: true } : w
    ),
    activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
  })),
  updateWindowPosition: (id, x, y) => set((state) => ({
    windows: state.windows.map(w => w.id === id ? { ...w, x, y } : w),
  })),
  updateWindowSize: (id, width, height) => set((state) => ({
    windows: state.windows.map(w => w.id === id ? { ...w, width, height } : w),
  })),
  updateWindowTitle: (id, title) => set((state) => ({
    windows: state.windows.map(w => w.id === id ? { ...w, title } : w),
  })),
  unlock: () => set({ isLocked: false }),
  lock: () => set({ isLocked: true }),
  setWallpaper: (url) => set({ wallpaper: url }),
}));