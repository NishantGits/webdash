import React, { useState, useEffect } from 'react';
import { Folder, File, ChevronRight, Home, ArrowLeft, Plus, Trash2, FolderPlus } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { VFSItem } from '@shared/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useOSStore } from '@/stores/use-os-store';
export function FinderApp() {
  const [items, setItems] = useState<VFSItem[]>([]);
  const [currentPath, setCurrentPath] = useState<VFSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const currentParentId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;
  const updateWindowTitle = useOSStore(s => s.updateWindowTitle);
  const activeWindowId = useOSStore(s => s.activeWindowId);
  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await api<VFSItem[]>(`/api/vfs?parentId=${currentParentId ?? 'null'}`);
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch VFS items', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchItems();
    const title = currentPath.length > 0 ? currentPath[currentPath.length - 1].name : 'Finder';
    if (activeWindowId) updateWindowTitle(activeWindowId, title);
  }, [currentParentId]);
  const handleFolderClick = (item: VFSItem) => {
    if (item.type === 'folder') {
      setCurrentPath([...currentPath, item]);
    }
  };
  const handleBack = () => {
    setCurrentPath(currentPath.slice(0, -1));
  };
  const createItem = async (type: 'file' | 'folder') => {
    const name = prompt(`Enter ${type} name:`, `New ${type}`);
    if (!name) return;
    try {
      await api('/api/vfs', {
        method: 'POST',
        body: JSON.stringify({ name, type, parentId: currentParentId })
      });
      fetchItems();
    } catch (err) {
      alert('Failed to create item');
    }
  };
  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      await api(`/api/vfs/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (err) {
      alert('Failed to delete item');
    }
  };
  return (
    <div className="flex h-full bg-background text-foreground select-none">
      {/* Sidebar */}
      <div className="w-44 border-r bg-muted/30 p-4 space-y-6">
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2">Favorites</p>
          <div 
            onClick={() => setCurrentPath([])}
            className={cn("flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm", !currentParentId ? "bg-accent text-accent-foreground" : "hover:bg-accent/50")}
          >
            <Home className="w-4 h-4 text-blue-500" />
            <span>Root</span>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-12 border-b flex items-center justify-between px-4 bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleBack} disabled={currentPath.length === 0}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center text-sm gap-1 overflow-hidden">
              <span className="text-muted-foreground">Macintosh HD</span>
              {currentPath.map((p, i) => (
                <React.Fragment key={p.id}>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className={i === currentPath.length - 1 ? "font-semibold" : ""}>{p.name}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => createItem('folder')}>
              <FolderPlus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => createItem('file')}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {/* File Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground animate-pulse">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground italic">Folder is empty</div>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
              {items.map((item) => (
                <div 
                  key={item.id}
                  onDoubleClick={() => handleFolderClick(item)}
                  className="group flex flex-col items-center gap-2 w-20 text-center relative"
                >
                  <div className="relative">
                    {item.type === 'folder' ? (
                      <Folder className="w-12 h-12 text-blue-400 fill-blue-400/20" />
                    ) : (
                      <File className="w-12 h-12 text-gray-400 fill-gray-400/10" />
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-xs font-medium truncate w-full px-1">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}