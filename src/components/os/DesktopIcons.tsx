import React, { useMemo } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
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
import type { VFSItem } from '@shared/types';
import { useOSStore } from '@/stores/use-os-store';
import { useVfsStore } from '@/stores/use-vfs-store';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
interface DesktopIconProps {
  item: VFSItem;
  onOpen: (item: VFSItem) => void;
  onRename: (item: VFSItem) => void;
  onDelete: (item: VFSItem) => void;
}
function DesktopIcon({ item, onOpen, onRename, onDelete }: DesktopIconProps) {
  const openApp = useOSStore(s => s.openApp);
  const desktopId = useOSStore(s => s.desktopId);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: item.id,
    disabled: item.type !== 'folder',
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;
  const renderIcon = () => {
    if (item.type === 'folder') return <Folder className="w-10 h-10 text-blue-400 fill-blue-400/20" />;
    const isImage = IMAGE_EXTENSIONS.some(ext => item.name.toLowerCase().endsWith(ext));
    if (isImage) return <ImageIcon className="w-10 h-10 text-pink-400 fill-pink-400/10" />;
    if (item.name.endsWith('.txt')) return <FileText className="w-10 h-10 text-emerald-400 fill-emerald-400/10" />;
    return <File className="w-10 h-10 text-white/80" />;
  };
  return (
    <ContextMenu>
      <ContextMenuTrigger className="pointer-events-auto">
        <div
          ref={(node) => { setNodeRef(node); setDropRef(node); }}
          style={style}
          {...listeners}
          {...attributes}
          onDoubleClick={() => onOpen(item)}
          className={cn(
            "flex flex-col items-center gap-1 group cursor-default select-none transition-all duration-200",
            isDragging && "opacity-0 scale-90",
            isOver && item.type === 'folder' && "bg-blue-500/20 ring-2 ring-blue-500/40 rounded-xl"
          )}
        >
          <div className="relative p-2 rounded-lg group-hover:bg-white/10 group-active:bg-white/20 transition-colors">
            {renderIcon()}
          </div>
          <span className="text-[11px] font-medium text-white text-center break-words w-24 line-clamp-2 [text-shadow:_0_1px_2px_rgb(0_0_0_/_60%)]">
            {item.name}
          </span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52 glass border-white/20">
        <ContextMenuItem onClick={() => onOpen(item)} className="gap-2">
          <Play className="w-4 h-4" /> Open
        </ContextMenuItem>
        <ContextMenuItem onClick={() => openApp('finder', 'Finder', { navigateTo: desktopId || 'root-desktop' })} className="gap-2">
          <ExternalLink className="w-4 h-4" /> Show in Finder
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onRename(item)} className="gap-2">
          <Edit3 className="w-4 h-4" /> Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onDelete(item)} className="gap-2 text-destructive focus:text-destructive">
          <Trash2 className="w-4 h-4" /> Move to Trash
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
export function DesktopIcons() {
  const desktopId = useOSStore(s => s.desktopId);
  const openApp = useOSStore(s => s.openApp);
  const allItems = useVfsStore(s => s.items);
  const createItem = useVfsStore(s => s.createItem);
  const updateItem = useVfsStore(s => s.updateItem);
  const deleteItem = useVfsStore(s => s.deleteItem);
  const desktopItems = useMemo(() => {
    return allItems.filter(i => i.parentId === (desktopId || 'root-desktop'));
  }, [allItems, desktopId]);
  const { setNodeRef } = useDroppable({ id: desktopId || 'root-desktop' });
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
  const handleCreate = (type: 'file' | 'folder') => {
    const name = prompt(`Enter ${type} name:`, `New ${type}${type === 'file' ? '.txt' : ''}`);
    if (!name) return;
    createItem({ name, type, parentId: desktopId || 'root-desktop' });
    toast.success(`${type} created`);
  };
  const handleRename = (item: VFSItem) => {
    const newName = prompt('Rename item:', item.name);
    if (!newName || newName === item.name) return;
    updateItem(item.id, { name: newName });
    toast.success('Renamed');
  };
  const handleDelete = (item: VFSItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    deleteItem(item.id);
    toast.success('Deleted');
  };
  return (
    <div ref={setNodeRef} className="absolute inset-0 z-0 pointer-events-auto overflow-hidden">
      <ContextMenu>
        <ContextMenuTrigger className="w-full h-full block" />
        <div className="absolute top-10 right-4 bottom-24 w-32 pointer-events-none z-10">
          <div className="flex flex-col items-center gap-6 p-4">
            {desktopItems.map((item) => (
              <DesktopIcon
                key={item.id}
                item={item}
                onOpen={handleOpen}
                onRename={handleRename}
                onDelete={handleDelete}
              />
            ))}
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
          <ContextMenuItem onClick={() => openApp('settings', 'Settings')} className="gap-2">
            <Play className="w-4 h-4" /> Change Wallpaper...
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}