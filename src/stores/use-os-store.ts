import { create } from 'zustand';
export type AppType = 'terminal' | 'about' | 'browser' | 'settings' | 'finder';
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
}
interface OSStore {
  windows: WindowState[];
  activeWindowId: string | null;
  zIndexCounter: number;
  openApp: (appType: AppType, title: string) => void;
  closeApp: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
}
export const useOSStore = create<OSStore>((set) => ({
  windows: [],
  activeWindowId: null,
  zIndexCounter: 10,
  openApp: (appType, title) => set((state) => {
    const existing = state.windows.find(w => w.appType === appType);
    if (existing) {
      const nextZ = state.zIndexCounter + 1;
      return {
        activeWindowId: existing.id,
        zIndexCounter: nextZ,
        windows: state.windows.map(w => 
          w.id === existing.id ? { ...w, isMinimized: false, zIndex: nextZ } : w
        )
      };
    }
    const id = Math.random().toString(36).substring(7);
    const nextZ = state.zIndexCounter + 1;
    const newWindow: WindowState = {
      id,
      title,
      appType,
      x: 100 + (state.windows.length * 30),
      y: 100 + (state.windows.length * 30),
      width: 600,
      height: 400,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZ,
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
}));