import React, { useState, useEffect, useCallback } from 'react';
import { useOSStore } from '@/stores/use-os-store';
import { useVfsStore } from '@/stores/use-vfs-store';
import { Loader2, Save, FileText } from 'lucide-react';
export function TextEditorApp() {
  const activeId = useOSStore(s => s.activeWindowId);
  const windows = useOSStore(s => s.windows);
  const win = windows.find(w => w.id === activeId);
  const fileId = win?.metadata?.fileId;
  const allItems = useVfsStore(s => s.items);
  const updateItem = useVfsStore(s => s.updateItem);
  const [content, setContent] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  useEffect(() => {
    if (!fileId) {
      setLoading(false);
      return;
    }
    const file = allItems.find(i => i.id === fileId);
    if (file) {
      const text = file.content || '';
      setContent(text);
      setInitialContent(text);
    }
    setLoading(false);
  }, [fileId, allItems]);
  const saveFile = useCallback((newContent: string) => {
    if (!fileId || newContent === initialContent) return;
    setSaving(true);
    updateItem(fileId, { content: newContent });
    setInitialContent(newContent);
    setLastSaved(new Date());
    setSaving(false);
  }, [fileId, initialContent, updateItem]);
  useEffect(() => {
    if (loading || !fileId || content === initialContent) return;
    const timer = setTimeout(() => {
      saveFile(content);
    }, 1500);
    return () => clearTimeout(timer);
  }, [content, loading, saveFile, fileId, initialContent]);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-xs font-medium uppercase tracking-widest">Opening Document</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full bg-white/50 dark:bg-black/20">
      <div className="flex-1 p-0 relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full p-8 bg-transparent outline-none resize-none font-mono text-[14px] leading-relaxed custom-scrollbar"
          placeholder="Start typing..."
          spellCheck={false}
        />
      </div>
      <div className="h-9 border-t bg-muted/30 px-4 flex items-center justify-between text-[11px] text-muted-foreground select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            <FileText className="w-3.5 h-3.5" />
            <span>{content.length} chars</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saving ? (
            <div className="flex items-center gap-2 text-primary animate-pulse font-bold uppercase tracking-tighter">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Saving</span>
            </div>
          ) : lastSaved ? (
            <div className="flex items-center gap-1.5 text-emerald-500 font-medium">
              <Save className="w-3 h-3" />
              <span>Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ) : (
            <span className="font-medium">{content === initialContent ? 'Locally Synced' : 'Changes Pending'}</span>
          )}
        </div>
      </div>
    </div>
  );
}