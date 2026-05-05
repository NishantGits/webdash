import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Folder, File, ImageIcon } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { VFSItem } from '@shared/types';
import { useOSStore } from '@/stores/use-os-store';
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
export function DesktopIcons() {
  const [items, setItems] = useState<VFSItem[]>([]);
  const desktopId = useOSStore(s => s.desktopId);
  const openApp = useOSStore(s => s.openApp);
  useEffect(() => {
    const fetchDesktopItems = async () => {
      try {
        const data = await api<VFSItem[]>(`/api/vfs?parentId=${desktopId}`);
        setItems(data);
      } catch (err) {
        console.error('Failed to fetch desktop icons', err);
      }
    };
    fetchDesktopItems();
  }, [desktopId]);
  const handleDoubleClick = (item: VFSItem) => {
    if (item.type === 'folder') {
      openApp('finder', item.name, { initialPath: item.id });
    } else {
      const isImage = IMAGE_EXTENSIONS.some(ext => item.name.toLowerCase().endsWith(ext));
      if (isImage) {
        openApp('image-viewer', `Image - ${item.name}`, { url: item.content });
      } else {
        openApp('terminal', `Terminal - ${item.name}`);
      }
    }
  };
  const renderIcon = (item: VFSItem) => {
    if (item.type === 'folder') return <Folder className="w-10 h-10 text-blue-400 fill-blue-400/20" />;
    const isImage = IMAGE_EXTENSIONS.some(ext => item.name.toLowerCase().endsWith(ext));
    if (isImage) return <ImageIcon className="w-10 h-10 text-pink-400 fill-pink-400/10" />;
    return <File className="w-10 h-10 text-white/80" />;
  };
  return (
    <div className="absolute top-10 right-4 bottom-24 w-32 pointer-events-none">
      <div className="flex flex-col items-center gap-6 p-4">
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