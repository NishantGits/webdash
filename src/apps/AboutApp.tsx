import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Copy, FileSearch, ExternalLink, ChevronRight, HardDrive, Cpu, Activity } from 'lucide-react';
import { useOSStore } from '@/stores/use-os-store';
import { useVfsStore } from '@/stores/use-vfs-store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
export function AboutApp() {
  const [showReport, setShowReport] = useState(false);
  const [startTime] = useState(Date.now());
  const [uptime, setUptime] = useState('0s');
  const openApp = useOSStore(s => s.openApp);
  const items = useVfsStore(s => s.items);
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime) / 1000);
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setUptime(m > 0 ? `${m}m ${s}s` : `${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);
  const storageStats = useMemo(() => {
    const totalSize = items.reduce((acc, curr) => acc + (curr.size || 0), 0);
    const fileCount = items.filter(i => i.type === 'file').length;
    const folderCount = items.filter(i => i.type === 'folder').length;
    // Mock capacity for visualization
    const capacity = 1024 * 1024; // 1MB virtual quota
    const percent = Math.min((totalSize / capacity) * 100, 100);
    return {
      totalSize: (totalSize / 1024).toFixed(2) + ' KB',
      fileCount,
      folderCount,
      percent,
      capacity: '1.00 MB'
    };
  }, [items]);
  const systemSpecs = [
    { label: 'Processor', value: '3.2 GHz Cloudflare V8 Isolate' },
    { label: 'Memory', value: '16 GB Sandboxed Runtime' },
    { label: 'Graphics', value: 'WebGL Hardware Acceleration' },
    { label: 'Uptime', value: uptime },
    { label: 'Storage Used', value: storageStats.totalSize },
  ];
  const copyToClipboard = async () => {
    const text = `WebDash Cloud OS\nVersion 1.1.0\n${systemSpecs.map(s => `${s.label}: ${s.value}`).join('\n')}\nFiles: ${storageStats.fileCount}\nFolders: ${storageStats.folderCount}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('System configuration copied');
    } catch (err) {
      toast.error('Failed to copy system info');
    }
  };
  return (
    <ContextMenu>
      <ContextMenuTrigger className="h-full w-full">
        <div className="h-full flex flex-col bg-white/50 dark:bg-[#0c0c0c]/50 text-foreground select-none overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!showReport ? (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col items-center justify-center p-8"
              >
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="mb-6">
                  <div className="w-24 h-24 rounded-[1.4rem] bg-gradient-to-br from-indigo-500 via-blue-600 to-sky-400 flex items-center justify-center shadow-2xl relative group">
                    <Monitor className="w-12 h-12 text-white" strokeWidth={1.5} />
                    <motion.div 
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 bg-white/20 rounded-[1.4rem] blur-xl group-hover:opacity-100 transition-opacity" 
                    />
                  </div>
                </motion.div>
                <div className="text-center space-y-1 mb-8">
                  <h1 className="text-3xl font-bold tracking-tight">WebDash</h1>
                  <p className="text-[13px] text-muted-foreground font-medium">Version 1.1.0 (Stable)</p>
                </div>
                <div className="w-full max-w-[280px] space-y-2 mb-6">
                  {systemSpecs.slice(0, 4).map((spec) => (
                    <div key={spec.label} className="flex justify-between items-baseline gap-4 border-b border-black/5 dark:border-white/5 pb-1">
                      <span className="text-[11px] font-bold text-foreground/60">{spec.label}</span>
                      <span className="text-[11px] text-muted-foreground tabular-nums">{spec.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowReport(true)} className="h-7 text-[11px] px-3 font-bold uppercase tracking-widest bg-white/5 border-white/20">
                    System Report
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyToClipboard} className="h-7 text-[11px] px-3 font-bold uppercase tracking-widest bg-white/5 border-white/20">
                    <Copy className="w-3 h-3 mr-1.5" /> Copy
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="report"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar"
              >
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setShowReport(false)} className="text-primary text-xs font-bold hover:underline">About</button>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-bold text-muted-foreground">System Report</span>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-blue-500" />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Storage Management</h3>
                    </div>
                    <div className="p-4 glass rounded-xl space-y-3">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span>Local VFS (IndexedDB)</span>
                        <span className="text-muted-foreground">{storageStats.totalSize} / {storageStats.capacity}</span>
                      </div>
                      <Progress value={storageStats.percent} className="h-2 bg-black/10 dark:bg-white/10" />
                      <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                        <span>{storageStats.fileCount} Files</span>
                        <span>{storageStats.folderCount} Folders</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Live Metrics</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Heap Used</p>
                        <p className="text-lg font-mono font-bold">~4.2MB</p>
                      </div>
                      <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Latency</p>
                        <p className="text-lg font-mono font-bold">0.4ms</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-orange-500" />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Architecture</h3>
                    </div>
                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl text-[11px] font-medium leading-relaxed border border-white/5">
                      WebDash operates on the Cloudflare Global Network. UI rendered via React 18. Draggable components powered by dnd-kit. State managed via Zustand. Persistent data stored in IndexedDB.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="p-4 border-t border-white/10 bg-black/5 flex flex-col items-center">
            <p className="text-[10px] text-muted-foreground/60 text-center font-medium leading-tight">
              ™ and © 2024-2025 WebDash Corporation.<br />
              All Rights Reserved.
            </p>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 glass border-white/20">
        <ContextMenuItem onClick={() => setShowReport(true)} className="gap-2">
          <FileSearch className="w-4 h-4" /> Detailed Report
        </ContextMenuItem>
        <ContextMenuItem onClick={copyToClipboard} className="gap-2">
          <Copy className="w-4 h-4" /> Copy System Info
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => openApp('finder', 'Finder')} className="gap-2">
          <ExternalLink className="w-4 h-4" /> Show in Finder
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}