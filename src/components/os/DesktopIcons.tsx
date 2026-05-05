import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Folder, 
  File, 
  ImageIcon, 
  FileText, 
  FolderPlus, 
  FilePlus, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  ExternalLink,
  Play
} from 'lucide-react';
import { api } from '@/lib/api-client';
import type { VFSItem } from '@shared/types';
import { useOSStore } from '@/stores/use-os-store';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { toast } from 'sonner';
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
export function DesktopIcons() {
  const [items, setItems] = useState<VFSItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const desktopId = useOSStore(s => s.desktopId);
  const openApp = useOSStore(s => s.openApp);
  const vfsNonce = useOSStore(s => s.vfsNonce);
  const notifyVfsChange = useOSStore(s => s.notifyVfsChange);
  const retryCount = useRef(0);
  const fetchDesktopItems = useCallback(async () => {
    try {
      const targetParent = desktopId || 'root-desktop';
      const data = await api<VFSItem[]>(`/api/vfs?parentId=${targetParent}`);
      if (Array.isArray(data)) {
        setItems(data);
        retryCount.current = 0;
      } else {
        setItems([]);
      }
    } catch (err) {
      if (retryCount.current < 3) {
        retryCount.current++;
        const delay = Math.pow(2, retryCount.current) * 1000;
        setTimeout(fetchDesktopItems, delay);
      } else {
        console.error('[DesktopIcons] Failed to sync volume');
      }
    } finally {
      setIsLoading(false);
    }
  }, [desktopId]);
  useEffect(() => {
    fetchDesktopItems();
  }, [fetchDesktopItems, vfsNonce]);
  const handleOpen = (item: VFSItem) => {
    if (item.type === 'folder') {
      openApp('finder', item.name, { navigateTo: item.id });
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
  const handleCreate = async (type: 'file' | 'folder') => {
    const name = prompt(`Enter ${type} name:`, `New ${type}${type === 'file' ? '.txt' : ''}`);
    if (!name) return;
    try {
      await api('/api/vfs', {
        method: 'POST',
        body: JSON.stringify({ name, type, parentId: desktopId || 'root-desktop' })
      });
      notifyVfsChange();
      toast.success(`${type === 'folder' ? 'Folder' : 'File'} created`);
    } catch (err) {
      toast.error('Failed to create item');
    }
  };
  const handleRename = async (item: VFSItem) => {
    const newName = prompt('Rename item:', item.name);
    if (!newName || newName === item.name) return;
    try {
      await api(`/api/vfs/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: newName })
      });
      notifyVfsChange();
      toast.success('Item renamed');
    } catch (err) {
      toast.error('Failed to rename item');
    }
  };
  const handleDelete = async (item: VFSItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    try {
      await api(`/api/vfs/${item.id}`, { method: 'DELETE' });
      notifyVfsChange();
      toast.success('Item deleted');
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };
  const renderIcon = (item: VFSItem) => {
    if (item.type === 'folder') return <Folder className="w-10 h-10 text-blue-400 fill-blue-400/20" />;
    const isImage = IMAGE_EXTENSIONS.some(ext => item.name.toLowerCase().endsWith(ext));
    if (isImage) return <ImageIcon className="w-10 h-10 text-pink-400 fill-pink-400/10" />;
    if (item.name.endsWith('.txt')) return <FileText className="w-10 h-10 text-emerald-400 fill-emerald-400/10" />;
    return <File className="w-10 h-10 text-white/80" />;
  };
  return (
    <ContextMenu>
      {/* Background trigger covering the whole desktop */}
      <ContextMenuTrigger className="absolute inset-0 z-0 pointer-events-auto">
        <div className="w-full h-full" />
      </ContextMenuTrigger>
      <div className="absolute top-10 right-4 bottom-24 w-32 pointer-events-none z-10">
        <div className="flex flex-col items-center gap-6 p-4">
          {isLoading && items.length === 0 && (
            <div className="text-[10px] text-white/40 animate-pulse font-medium uppercase tracking-tighter">Syncing...</div>
          )}
          {items.map((item) => (
            <ContextMenu key={item.id}>
              <ContextMenuTrigger className="pointer-events-auto">
                <motion.div
                  onDoubleClick={() => handleOpen(item)}
                  className="flex flex-col items-center gap-1 group cursor-default select-none"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative p-2 rounded-lg group-hover:bg-white/10 group-active:bg-white/20 transition-colors">
                    {renderIcon(item)}
                  </div>
                  <span className="text-[11px] font-medium text-white text-center break-words w-24 line-clamp-2 [text-shadow:_0_1px_2px_rgb(0_0_0_/_60%)]">
                    {item.name}
                  </span>
                </motion.div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-52 glass border-white/20">
                <ContextMenuItem onClick={() => handleOpen(item)} className="gap-2">
                  <Play className="w-4 h-4" /> Open
                </ContextMenuItem>
                <ContextMenuItem onClick={() => openApp('finder', 'Finder', { navigateTo: desktopId || 'root-desktop' })} className="gap-2">
                  <ExternalLink className="w-4 h-4" /> Show in Finder
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => handleRename(item)} className="gap-2">
                  <Edit3 className="w-4 h-4" /> Rename
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleDelete(item)} className="gap-2 text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4" /> Move to Trash
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
          {!isLoading && items.length === 0 && (
            <div className="flex flex-col items-center gap-2 opacity-20 mt-4">
              <Folder className="w-8 h-8 text-white" />
              <span className="text-[9px] text-white uppercase font-bold tracking-widest text-center">Empty</span>
            </div>
          )}
        </div>
      </div>
      <ContextMenuContent className="w-56 glass border-white/20">
        <ContextMenuItem onClick={() => handleCreate('folder')} className="gap-2">
          <FolderPlus className="w-4 h-4" /> New Folder
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleCreate('file')} className="gap-2">
          <FilePlus className="w-4 h-4" /> New File
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => notifyVfsChange()} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh Desktop
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => openApp('settings', 'Settings')} className="gap-2">
          <Play className="w-4 h-4" /> Change Wallpaper...
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}