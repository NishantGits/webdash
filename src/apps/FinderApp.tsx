import React, { useState, useEffect, useMemo } from 'react';
import { Folder, File, ChevronRight, Home, ArrowLeft, Plus, Trash2, FolderPlus, ImageIcon, Search, FileText, Loader2 } from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { VFSItem } from '@shared/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOSStore } from '@/stores/use-os-store';
import { useVfsStore } from '@/stores/use-vfs-store';
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
interface FinderItemProps {
  item: VFSItem;
  onClick: (item: VFSItem) => void;
  onDelete: (id: string) => void;
}
function FinderItem({ item, onClick, onDelete }: FinderItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: item.id,
    disabled: item.type !== 'folder',
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 100,
  } : undefined;
  const renderIcon = () => {
    if (item.type === 'folder') return <Folder className="w-12 h-12 text-blue-400 fill-blue-400/20" />;
    const isImage = IMAGE_EXTENSIONS.some(ext => item.name.toLowerCase().endsWith(ext));
    if (isImage) return <ImageIcon className="w-12 h-12 text-pink-400 fill-pink-400/10" />;
    if (item.name.endsWith('.txt')) return <FileText className="w-12 h-12 text-emerald-400 fill-emerald-400/10" />;
    return <File className="w-12 h-12 text-gray-400 fill-gray-400/10" />;
  };
  return (
    <div
      ref={(node) => { setNodeRef(node); setDropRef(node); }}
      style={style}
      {...listeners}
      {...attributes}
      onDoubleClick={() => onClick(item)}
      className={cn(
        "group flex flex-col items-center gap-2 w-full text-center relative p-2 rounded-xl transition-all duration-200",
        isDragging && "opacity-20 scale-90",
        isOver && item.type === 'folder' && "bg-blue-500/20 ring-2 ring-blue-500/40"
      )}
    >
      <div className="relative p-2 rounded-xl group-hover:bg-accent/50 transition-colors">
        {renderIcon()}
        <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
            className="bg-destructive text-destructive-foreground rounded-full p-1 hover:scale-110 shadow-lg"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      <span className="text-[11px] font-medium leading-tight truncate w-full px-1">{item.name}</span>
    </div>
  );
}
export function FinderApp() {
  const [currentPath, setCurrentPath] = useState<VFSItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const allItems = useVfsStore(s => s.items);
  const createItem = useVfsStore(s => s.createItem);
  const deleteItem = useVfsStore(s => s.deleteItem);
  const activeId = useOSStore(s => s.activeWindowId);
  const windows = useOSStore(s => s.windows);
  const updateWindowTitle = useOSStore(s => s.updateWindowTitle);
  const updateWindowMetadata = useOSStore(s => s.updateWindowMetadata);
  const openApp = useOSStore(s => s.openApp);
  const win = windows.find(w => w.id === activeId);
  const currentParentId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;
  const displayItems = useMemo(() => {
    return allItems.filter(item => item.parentId === currentParentId);
  }, [allItems, currentParentId]);
  useEffect(() => {
    if (win?.id) {
      const title = currentPath.length > 0 ? currentPath[currentPath.length - 1].name : 'Finder';
      updateWindowTitle(win.id, title);
    }
  }, [currentPath, win?.id, updateWindowTitle]);
  useEffect(() => {
    const navigateTo = win?.metadata?.navigateTo;
    if (navigateTo !== undefined) {
      if (navigateTo === null) {
        setCurrentPath([]);
      } else {
        const target = allItems.find(i => i.id === navigateTo);
        if (target && target.type === 'folder') {
          const chain: VFSItem[] = [target];
          let parentId = target.parentId;
          while (parentId) {
            const parent = allItems.find(i => i.id === parentId);
            if (!parent) break;
            chain.unshift(parent);
            parentId = parent.parentId;
          }
          setCurrentPath(chain);
        }
      }
      if (win?.id) updateWindowMetadata(win.id, { navigateTo: undefined });
    }
  }, [win?.metadata?.navigateTo, win?.id, updateWindowMetadata, allItems]);
  const handleItemClick = (item: VFSItem) => {
    if (item.type === 'folder') {
      setCurrentPath(prev => [...prev, item]);
      setSearchQuery('');
    } else {
      const isImage = IMAGE_EXTENSIONS.some(ext => item.name.toLowerCase().endsWith(ext));
      if (isImage) {
        openApp('image-viewer', `Image - ${item.name}`, { url: item.content });
      } else if (item.name.endsWith('.txt') || !item.name.includes('.')) {
        openApp('text-editor', `Edit - ${item.name}`, { fileId: item.id });
      } else {
        openApp('terminal', `Terminal - ${item.name}`);
      }
    }
  };
  const jumpToFolder = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
    setSearchQuery('');
  };
  const handleCreate = (type: 'file' | 'folder') => {
    const name = prompt(`Enter ${type} name:`, `New ${type}${type === 'file' ? '.txt' : ''}`);
    if (!name) return;
    createItem({ name, type, parentId: currentParentId });
  };
  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    deleteItem(id);
  };
  const filteredItems = displayItems.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const { setNodeRef: setGridDropRef, isOver: isGridOver } = useDroppable({
    id: currentParentId || 'root-desktop',
  });
  return (
    <div className="flex h-full bg-background text-foreground select-none">
      <div className="w-48 border-r bg-muted/20 p-4 space-y-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 pb-1">Favorites</p>
          <button
            onClick={() => { setCurrentPath([]); setSearchQuery(''); }}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
              !currentParentId ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-accent/50"
            )}
          >
            <Home className="w-4 h-4" />
            <span>VFS Root</span>
          </button>
        </div>
      </div>
      <div ref={setGridDropRef} className={cn("flex-1 flex flex-col min-w-0 transition-colors duration-300", isGridOver && "bg-primary/5")}>
        <div className="h-12 border-b flex items-center justify-between px-4 bg-background/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setCurrentPath(prev => prev.slice(0, -1))} disabled={currentPath.length === 0}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center text-[13px] gap-1 overflow-hidden">
              <button onClick={() => { setCurrentPath([]); setSearchQuery(''); }} className="hover:underline text-muted-foreground">Root</button>
              {currentPath.map((p, i) => (
                <React.Fragment key={p.id}>
                  <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                  <button onClick={() => jumpToFolder(i)} className={cn("hover:underline whitespace-nowrap truncate", i === currentPath.length - 1 ? "font-bold text-foreground" : "text-muted-foreground")}>
                    {p.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <div className="relative w-32 md:w-40">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="h-7 pl-8 text-xs bg-muted/40 border-none"
              />
            </div>
            <div className="h-6 w-[1px] bg-border mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCreate('folder')}>
              <FolderPlus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCreate('file')}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 gap-4">
              <div className="p-8 rounded-full bg-muted/20 border border-dashed border-border/50">
                <Search className="w-12 h-12" />
              </div>
              <p className="text-sm font-medium">No items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-x-4 gap-y-8">
              {filteredItems.map((item) => (
                <FinderItem
                  key={item.id}
                  item={item}
                  onClick={handleItemClick}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}