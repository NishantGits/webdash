import React from 'react';
import { useOSStore, WindowState } from '@/stores/use-os-store';
import { ImageIcon } from 'lucide-react';
export function ImageViewerApp() {
  const activeId = useOSStore(s => s.activeWindowId);
  const windows = useOSStore(s => s.windows);
  const currentWindow = windows.find(w => w.id === activeId) as WindowState | undefined;
  const imageUrl = currentWindow?.metadata?.url;
  if (!imageUrl) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 bg-black/5">
        <ImageIcon className="w-16 h-16 opacity-20" />
        <p className="text-sm italic">No image selected</p>
      </div>
    );
  }
  return (
    <div className="h-full w-full flex items-center justify-center bg-[#1a1a1a] p-4 overflow-hidden">
      <img
        src={imageUrl}
        alt="View"
        className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
      />
    </div>
  );
}