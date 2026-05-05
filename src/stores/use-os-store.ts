import { create } from 'zustand';
export type AppType = 'terminal' | 'about' | 'browser' | 'settings' | 'finder' | 'image-viewer' | 'text-editor';
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
  prevRect?: { x: number; y: number; width: number; height: number };
  metadata?: any;
}
interface OSStore {
  windows: WindowState[];
  activeWindowId: string | null;
  zIndexCounter: number;
  isLocked: boolean;
  wallpaper: string;
  desktopId: string;
  vfsNonce: number;
  isSpotlightOpen: boolean;
  isDockVisible: boolean;
  isVfsDragging: boolean;
  openApp: (appType: AppType, title: string, metadata?: any) => void;
  closeApp: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  minimizeAll: () => void;
  toggleMaximize: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
  updateWindowTitle: (id: string, title: string) => void;
  updateWindowMetadata: (id: string, metadata: any) => void;
  unlock: () => void;
  lock: () => void;
  setWallpaper: (url: string) => void;
  notifyVfsChange: () => void;
  toggleSpotlight: () => void;
  setSpotlight: (open: boolean) => void;
  setDockVisible: (visible: boolean) => void;
  setVfsDragging: (dragging: boolean) => void;
}
const Z_INDEX_CEILING = 9000;
const Z_INDEX_START = 10;
export const useOSStore = create<OSStore>((set) => ({
  windows: [],
  activeWindowId: null,
  zIndexCounter: Z_INDEX_START,
  isLocked: true,
  wallpaper: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop',
  desktopId: 'root-desktop',
  vfsNonce: 0,
  isSpotlightOpen: false,
  isDockVisible: true,
  isVfsDragging: false,
  openApp: (appType, title, metadata) => set((state) => {
    const canMultiple = ['image-viewer', 'text-editor'].includes(appType);
    const existing = !canMultiple ? state.windows.find(w => w.appType === appType) : null;
    let nextZ = state.zIndexCounter + 1;
    let windows = state.windows;
    if (nextZ >= Z_INDEX_CEILING) {
      windows = [...state.windows].sort((a, b) => a.zIndex - b.zIndex).map((w, i) => ({ ...w, zIndex: Z_INDEX_START + i }));
      nextZ = Z_INDEX_START + windows.length + 1;
    }
    if (existing) {
      return {
        activeWindowId: existing.id,
        zIndexCounter: nextZ,
        windows: windows.map(w => 
          w.id === existing.id 
            ? { 
                ...w, 
                isMinimized: false, 
                zIndex: nextZ,
                metadata: metadata ? { ...w.metadata, ...metadata } : w.metadata 
              } 
            : w
        )
      };
    }
    const id = Math.random().toString(36).substring(7);
    const newWindow: WindowState = {
      id,
      title,
      appType,
      x: 100 + (state.windows.length * 40) % 300,
      y: 100 + (state.windows.length * 40) % 300,
      width: appType === 'finder' ? 800 : appType === 'browser' ? 900 : appType === 'text-editor' ? 700 : 600,
      height: appType === 'finder' ? 500 : appType === 'browser' ? 600 : appType === 'text-editor' ? 500 : 400,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZ,
      metadata,
    };
    return {
      windows: [...windows, newWindow],
      activeWindowId: id,
      zIndexCounter: nextZ,
    };
  }),
  closeApp: (id) => set((state) => ({
    windows: state.windows.filter(w => w.id !== id),
    activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
  })),
  focusWindow: (id) => set((state) => {
    const target = state.windows.find(w => w.id === id);
    if (state.activeWindowId === id && target && !target.isMinimized) return {};
    let nextZ = state.zIndexCounter + 1;
    let windows = state.windows;
    if (nextZ >= Z_INDEX_CEILING) {
      windows = [...state.windows].sort((a, b) => a.zIndex - b.zIndex).map((w, i) => ({ ...w, zIndex: Z_INDEX_START + i }));
      nextZ = Z_INDEX_START + windows.length + 1;
    }
    return {
      activeWindowId: id,
      zIndexCounter: nextZ,
      windows: windows.map(w => 
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
  minimizeAll: () => set((state) => ({
    windows: state.windows.map(w => ({ ...w, isMinimized: true })),
    activeWindowId: null,
  })),
  toggleMaximize: (id) => set((state) => ({
    windows: state.windows.map(w => {
      if (w.id !== id) return w;
      if (w.isMaximized) {
        return {
          ...w,
          isMaximized: false,
          x: w.prevRect?.x ?? w.x,
          y: w.prevRect?.y ?? w.y,
          width: w.prevRect?.width ?? w.width,
          height: w.prevRect?.height ?? w.height,
        };
      } else {
        return {
          ...w,
          isMaximized: true,
          prevRect: { x: w.x, y: w.y, width: w.width, height: w.height },
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight - 28,
        };
      }
    })
  })),
  updateWindowPosition: (id, x, y) => set((state) => ({
    windows: state.windows.map(w => w.id === id && !w.isMaximized ? { ...w, x, y } : w),
  })),
  updateWindowSize: (id, width, height) => set((state) => ({
    windows: state.windows.map(w => w.id === id && !w.isMaximized ? { ...w, width, height } : w),
  })),
  updateWindowTitle: (id, title) => set((state) => ({
    windows: state.windows.map(w => w.id === id ? { ...w, title } : w),
  })),
  updateWindowMetadata: (id, metadata) => set((state) => ({
    windows: state.windows.map(w => 
      w.id === id ? { ...w, metadata: metadata ? { ...w.metadata, ...metadata } : w.metadata } : w
    ),
  })),
  unlock: () => set({ isLocked: false }),
  lock: () => set({ isLocked: true }),
  setWallpaper: (url) => set({ wallpaper: url }),
  notifyVfsChange: () => set((state) => ({ vfsNonce: state.vfsNonce + 1 })),
  toggleSpotlight: () => set((state) => ({ isSpotlightOpen: !state.isSpotlightOpen })),
  setSpotlight: (open) => set({ isSpotlightOpen: open }),
  setDockVisible: (visible) => set({ isDockVisible: visible }),
  setVfsDragging: (dragging) => set({ isVfsDragging: dragging }),
}));