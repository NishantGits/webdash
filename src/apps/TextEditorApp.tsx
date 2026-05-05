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
        const items = await api<VFSItem[]>(`/api/vfs`);
        const file = items.find(i => i.id === fileId);
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
  // Debounced auto-save
  useEffect(() => {
    if (loading || !fileId || content === initialContent) return;
    const timer = setTimeout(() => {
      saveFile(content);
    }, 1500);
    return () => clearTimeout(timer);
  }, [content, loading, saveFile, fileId, initialContent]);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-xs">Opening document...</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full bg-white/50 dark:bg-black/20">
      <div className="flex-1 p-0 relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full p-6 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed"
          placeholder="Start typing..."
          spellCheck={false}
        />
      </div>
      <div className="h-8 border-t bg-muted/30 px-4 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3 h-3" />
            <span>{content.length} characters</span>
          </div>
          <span>{content.split(/\s+/).filter(Boolean).length} words</span>
        </div>
        <div className="flex items-center gap-2">
          {saving ? (
            <div className="flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Saving...</span>
            </div>
          ) : lastSaved ? (
            <div className="flex items-center gap-1 text-emerald-500">
              <Save className="w-3 h-3" />
              <span>Saved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ) : (
            <span>{content === initialContent ? 'Saved' : 'Unsaved changes'}</span>
          )}
        </div>
      </div>
    </div>
  );
}