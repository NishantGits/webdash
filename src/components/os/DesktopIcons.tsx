import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Folder, File, ImageIcon, FileText } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { VFSItem } from '@shared/types';
import { useOSStore } from '@/stores/use-os-store';
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
export function DesktopIcons() {
  const [items, setItems] = useState<VFSItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const desktopId = useOSStore(s => s.desktopId);
  const openApp = useOSStore(s => s.openApp);
  const vfsNonce = useOSStore(s => s.vfsNonce);
  const retryCount = useRef(0);
  const fetchDesktopItems = useCallback(async () => {
    try {
      // Use "null" as string if ID is missing to match worker logic
      const targetParent = desktopId || 'root-desktop';
      const data = await api<VFSItem[]>(`/api/vfs?parentId=${targetParent}`);
      if (Array.isArray(data)) {
        setItems(data);
        retryCount.current = 0;
      } else {
        setItems([]);
      }
    } catch (err) {
      // Graceful error handling for cold starts/network blips
      if (retryCount.current < 3) {
        retryCount.current++;
        // Exponential backoff
        const delay = Math.pow(2, retryCount.current) * 1000;
        setTimeout(fetchDesktopItems, delay);
      } else {
        console.error('[DesktopIcons] Failed to sync volume after retries');
      }
    } finally {
      setIsLoading(false);
    }
  }, [desktopId]);
  useEffect(() => {
    fetchDesktopItems();
  }, [fetchDesktopItems, vfsNonce]);
  const handleDoubleClick = (item: VFSItem) => {
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
  const renderIcon = (item: VFSItem) => {
    if (item.type === 'folder') return <Folder className="w-10 h-10 text-blue-400 fill-blue-400/20" />;
    const isImage = IMAGE_EXTENSIONS.some(ext => item.name.toLowerCase().endsWith(ext));
    if (isImage) return <ImageIcon className="w-10 h-10 text-pink-400 fill-pink-400/10" />;
    if (item.name.endsWith('.txt')) return <FileText className="w-10 h-10 text-emerald-400 fill-emerald-400/10" />;
    return <File className="w-10 h-10 text-white/80" />;
  };
  return (
    <div className="absolute top-10 right-4 bottom-24 w-32 pointer-events-none">
      <div className="flex flex-col items-center gap-6 p-4">
        {isLoading && items.length === 0 && (
          <div className="text-[10px] text-white/40 animate-pulse font-medium uppercase tracking-tighter">Syncing...</div>
        )}
        {items.map((item) => (
          <motion.div
            key={item.id}
            onDoubleClick={() => handleDoubleClick(item)}
            className="flex flex-col items-center gap-1 group cursor-default pointer-events-auto select-none"
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
        ))}
        {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 opacity-20 mt-4">
            <Folder className="w-8 h-8 text-white" />
            <span className="text-[9px] text-white uppercase font-bold tracking-widest text-center">Empty Desktop</span>
          </div>
        )}
      </div>
    </div>
  );
}