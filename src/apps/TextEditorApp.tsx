import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { useOSStore } from '@/stores/use-os-store';
import type { VFSItem } from '@shared/types';
import { Loader2, Save, FileText } from 'lucide-react';
export function TextEditorApp() {
  const activeId = useOSStore(s => s.activeWindowId);
  const windows = useOSStore(s => s.windows);
  const notifyVfsChange = useOSStore(s => s.notifyVfsChange);
  const win = windows.find(w => w.id === activeId);
  const fileId = win?.metadata?.fileId;
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
    const fetchFile = async () => {
      try {
        const file = await api<VFSItem>(`/api/vfs/${fileId}`);
        if (file) {
          const text = file.content || '';
          setContent(text);
          setInitialContent(text);
        }
      } catch (err) {
        console.error('Failed to load file', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [fileId]);
  const saveFile = useCallback(async (newContent: string) => {
    if (!fileId || newContent === initialContent) return;
    setSaving(true);
    try {
      await api(`/api/vfs/${fileId}`, {
        method: 'PUT',
        body: JSON.stringify({ content: newContent })
      });
      setInitialContent(newContent);
      setLastSaved(new Date());
      notifyVfsChange();
    } catch (err) {
      console.error('Failed to save file', err);
    } finally {
      setSaving(false);
    }
  }, [fileId, notifyVfsChange, initialContent]);
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
          placeholder="Start typing your document..."
          spellCheck={false}
        />
      </div>
      <div className="h-9 border-t bg-muted/30 px-4 flex items-center justify-between text-[11px] text-muted-foreground select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            <FileText className="w-3.5 h-3.5" />
            <span>{content.length} chars</span>
          </div>
          <span className="opacity-50">|</span>
          <span>{content.split(/\s+/).filter(Boolean).length} words</span>
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
            <span className="font-medium">{content === initialContent ? 'System Synced' : 'Changes Pending'}</span>
          )}
        </div>
      </div>
    </div>
  );
}