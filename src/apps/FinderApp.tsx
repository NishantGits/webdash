import React, { useState, useEffect, useCallback } from 'react';
import { Folder, File, ChevronRight, Home, ArrowLeft, Plus, Trash2, FolderPlus, ImageIcon, Search, Edit2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { VFSItem } from '@shared/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOSStore } from '@/stores/use-os-store';
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
export function FinderApp() {
  const [items, setItems] = useState<VFSItem[]>([]);
  const [currentPath, setCurrentPath] = useState<VFSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const activeWindowId = useOSStore(s => s.activeWindowId);
  const updateWindowTitle = useOSStore(s => s.updateWindowTitle);
  const openApp = useOSStore(s => s.openApp);
  const currentParentId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<VFSItem[]>(`/api/vfs?parentId=${currentParentId ?? 'null'}`);
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch VFS items', err);
    } finally {
      setLoading(false);
    }
  }, [currentParentId]);
  useEffect(() => {
    fetchItems();
    if (activeWindowId) {
      const title = currentPath.length > 0 ? currentPath[currentPath.length - 1].name : 'Finder';
      updateWindowTitle(activeWindowId, title);
    }
  }, [currentParentId, currentPath, activeWindowId, updateWindowTitle, fetchItems]);
  const handleItemClick = (item: VFSItem) => {
    if (item.type === 'folder') {
      setCurrentPath([...currentPath, item]);
    } else {
      const isImage = IMAGE_EXTENSIONS.some(ext => item.name.toLowerCase().endsWith(ext));
      if (isImage) {
        openApp('image-viewer', `Image - ${item.name}`, { url: item.content });
      } else {
        openApp('terminal', `Terminal - ${item.name}`);
      }
    }
  };
  const jumpToFolder = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };
  const renameItem = async (id: string, currentName: string) => {
    const newName = prompt('Rename to:', currentName);
    if (!newName || newName === currentName) return;
    try {
      await api(`/api/vfs/${id}`, { method: 'PUT', body: JSON.stringify({ name: newName }) });
      fetchItems();
    } catch (err) {
      alert('Failed to rename item');
    }
  };
  const createItem = async (type: 'file' | 'folder') => {
    const name = prompt(`Enter ${type} name:`, `New ${type}${type === 'file' ? '.txt' : ''}`);
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
  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const renderIcon = (item: VFSItem) => {
    if (item.type === 'folder') return <Folder className="w-12 h-12 text-blue-400 fill-blue-400/20" />;
    const isImage = IMAGE_EXTENSIONS.some(ext => item.name.toLowerCase().endsWith(ext));
    if (isImage) return <ImageIcon className="w-12 h-12 text-pink-400 fill-pink-400/10" />;
    return <File className="w-12 h-12 text-gray-400 fill-gray-400/10" />;
  };
  return (
    <div className="flex h-full bg-background text-foreground select-none">
      <div className="w-48 border-r bg-muted/20 p-4 space-y-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 pb-1">Favorites</p>
          <button
            onClick={() => setCurrentPath([])}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
              !currentParentId ? "bg-primary text-primary-foreground" : "hover:bg-accent/50"
            )}
          >
            <Home className="w-4 h-4" />
            <span>AirDrop</span>
          </button>
          <button className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm hover:bg-accent/50">
            <File className="w-4 h-4 text-blue-500" />
            <span>Recents</span>
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-12 border-b flex items-center justify-between px-4 bg-background/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentPath(currentPath.slice(0, -1))} disabled={currentPath.length === 0}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center text-[13px] gap-1 overflow-hidden">
              <button onClick={() => setCurrentPath([])} className="hover:underline text-muted-foreground">VFS Root</button>
              {currentPath.map((p, i) => (
                <React.Fragment key={p.id}>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <button onClick={() => jumpToFolder(i)} className={cn("hover:underline whitespace-nowrap", i === currentPath.length - 1 ? "font-bold text-foreground" : "text-muted-foreground")}>
                    {p.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-40">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search" 
                className="h-7 pl-8 text-xs bg-muted/40" 
              />
            </div>
            <div className="h-6 w-[1px] bg-border mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => createItem('folder')}>
              <FolderPlus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => createItem('file')}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground/50 animate-pulse">Scanning volume...</div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              <Search className="w-12 h-12 opacity-10" />
              <p className="text-sm italic">No items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-8">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onDoubleClick={() => handleItemClick(item)}
                  className="group flex flex-col items-center gap-2 w-20 text-center relative"
                >
                  <div className="relative p-2 rounded-xl group-hover:bg-accent/50 transition-colors">
                    {renderIcon(item)}
                    <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); renameItem(item.id, item.name); }}
                        className="bg-primary text-primary-foreground rounded-full p-1 hover:scale-110"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                        className="bg-destructive text-destructive-foreground rounded-full p-1 hover:scale-110"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium leading-tight truncate w-full px-1">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}