import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import type { VFSItem } from '@shared/types';
/**
 * Custom storage engine using idb-keyval for IndexedDB persistence.
 * createJSONStorage handles stringification/parsing of the whole state, 
 * so we treat values as raw strings to avoid double serialization.
 */
const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await get(name);
    // idb-keyval returns undefined if missing; Zustand expects null
    return (value as string) ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    // value is already a stringified JSON from createJSONStorage
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};
interface VFSState {
  items: VFSItem[];
  initialized: boolean;
}
interface VFSActions {
  createItem: (params: { name: string; type: 'file' | 'folder'; parentId: string | null; content?: string }) => VFSItem;
  updateItem: (id: string, updates: Partial<VFSItem>) => void;
  deleteItem: (id: string) => void;
  moveItem: (id: string, newParentId: string | null) => void;
  seed: () => void;
}
export const useVfsStore = create<VFSState & VFSActions>()(
  persist(
    (set, get) => ({
      items: [],
      initialized: false,
      seed: () => {
        if (get().items.length > 0) return;
        const defaultItems: VFSItem[] = [
          { id: "root-docs", name: "Documents", type: "folder", parentId: null, size: 0, updatedAt: Date.now() },
          { id: "root-desktop", name: "Desktop", type: "folder", parentId: null, size: 0, updatedAt: Date.now() },
          { id: "root-downloads", name: "Downloads", type: "folder", parentId: null, size: 0, updatedAt: Date.now() },
          { id: "welcome-txt", name: "Welcome.txt", type: "file", parentId: "root-docs", content: "Welcome to WebDash Cloud OS!", size: 28, updatedAt: Date.now() },
          { id: "desktop-readme", name: "Read Me.txt", type: "file", parentId: "root-desktop", content: "This is your cloud desktop. Drag files here to persist them across sessions.", size: 78, updatedAt: Date.now() }
        ];
        set({ items: defaultItems, initialized: true });
      },
      createItem: ({ name, type, parentId, content = "" }) => {
        const newItem: VFSItem = {
          id: Math.random().toString(36).substring(7),
          name,
          type,
          parentId: parentId === "null" ? null : parentId,
          content,
          size: content.length,
          updatedAt: Date.now(),
        };
        set((state) => ({ items: [...state.items, newItem] }));
        return newItem;
      },
      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...updates,
                  updatedAt: Date.now(),
                  size: updates.content !== undefined ? updates.content.length : item.size,
                }
              : item
          ),
        }));
      },
      deleteItem: (id) => {
        const itemsToDelete = new Set<string>([id]);
        const state = get();
        // Recursive helper to find all children
        const findChildren = (parentId: string) => {
          state.items.forEach(item => {
            if (item.parentId === parentId) {
              itemsToDelete.add(item.id);
              if (item.type === 'folder') findChildren(item.id);
            }
          });
        };
        const target = state.items.find(i => i.id === id);
        if (target?.type === 'folder') findChildren(id);
        set((state) => ({
          items: state.items.filter((item) => !itemsToDelete.has(item.id)),
        }));
      },
      moveItem: (id, newParentId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, parentId: newParentId === "null" ? null : newParentId, updatedAt: Date.now() } : item
          ),
        }));
      },
    }),
    {
      name: 'webdash-vfs',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);