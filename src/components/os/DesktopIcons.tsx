import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Folder, File, ImageIcon, FileText } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { VFSItem } from '@shared/types';
import { useOSStore } from '@/stores/use-os-store';
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
export function DesktopIcons() {
  const [items, setItems] = useState<VFSItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const desktopId = useOSStore(s => s.desktopId);
  const openApp = useOSStore(s => s.openApp);
  const vfsNonce = useOSStore(s => s.vfsNonce);
  const fetchDesktopItems = useCallback(async () => {
    try {
      // Small delay to ensure worker is ready on initial load
      const data = await api<VFSItem[]>(`/api/vfs?parentId=${desktopId || 'root-desktop'}`);
      if (Array.isArray(data)) {
        setItems(data);
        setError(null);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.warn('[DesktopIcons] VFS fetch failed, retrying in 2s...', err);
      setError(err instanceof Error ? err.message : 'Fetch error');
      // Retry logic
      setTimeout(fetchDesktopItems, 2000);
    }
  }, [desktopId]);
  useEffect(() => {
    fetchDesktopItems();
  }, [fetchDesktopItems, vfsNonce]);
  const handleDoubleClick = (item: VFSItem) => {
    if (item.type === 'folder') {
      openApp('finder', item.name, { initialPath: item.id });
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
        {items.length === 0 && !error && (
          <div className="text-[10px] text-white/40 animate-pulse">Syncing...</div>
        )}
        {items.map((item) => (
          <motion.div
            key={item.id}
            onDoubleClick={() => handleDoubleClick(item)}
            className="flex flex-col items-center gap-1 group cursor-default pointer-events-auto select-none"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative p-2 rounded-lg group-hover:bg-white/10 group-active:bg-white/20 transition-colors">
              {renderIcon(item)}
            </div>
            <span className="text-[11px] font-medium text-white text-center break-words w-24 [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
              {item.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}