import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Copy, FileSearch, ExternalLink, ChevronRight, HardDrive } from 'lucide-react';
import { useOSStore } from '@/stores/use-os-store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
export function AboutApp() {
  const [showReport, setShowReport] = useState(false);
  const openApp = useOSStore(s => s.openApp);
  const systemSpecs = [
    { label: 'Processor', value: '3.2 GHz Cloudflare V8 Isolate' },
    { label: 'Memory', value: '16 GB Sandboxed Runtime' },
    { label: 'Graphics', value: 'WebGL Hardware Acceleration' },
    { label: 'Serial Number', value: 'WD-2025-CF-DO' },
    { label: 'Uptime', value: '100% (Serverless)' },
  ];
  const copyToClipboard = async () => {
    const text = `WebDash Cloud OS\nVersion 1.1.0\n${systemSpecs.map(s => `${s.label}: ${s.value}`).join('\n')}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast.success('System configuration copied');
        return;
      }
      throw new Error('Clipboard API unavailable');
    } catch (err) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) toast.success('Copied (Legacy Fallback)');
        else throw new Error('Fallback failed');
      } catch (fallbackErr) {
        toast.error('Failed to copy system info');
      }
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
                  <div className="w-24 h-24 rounded-[1.4rem] bg-gradient-to-br from-indigo-500 via-blue-600 to-sky-400 flex items-center justify-center shadow-2xl">
                    <Monitor className="w-12 h-12 text-white" strokeWidth={1.5} />
                  </div>
                </motion.div>
                <div className="text-center space-y-1 mb-8">
                  <h1 className="text-3xl font-bold tracking-tight">WebDash</h1>
                  <p className="text-[13px] text-muted-foreground font-medium">Version 1.1.0 (Production)</p>
                </div>
                <div className="w-full max-w-[280px] space-y-2 mb-6">
                  {systemSpecs.slice(0, 4).map((spec) => (
                    <div key={spec.label} className="flex justify-between items-baseline gap-4 border-b border-black/5 dark:border-white/5 pb-1">
                      <span className="text-[11px] font-bold text-foreground/60">{spec.label}</span>
                      <span className="text-[11px] text-muted-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowReport(true)} className="h-7 text-[11px] px-3 font-bold uppercase tracking-widest bg-white/5">
                    More Info...
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyToClipboard} className="h-7 text-[11px] px-3 font-bold uppercase tracking-widest bg-white/5">
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Software Resources</h3>
                    <div className="grid gap-2">
                      <div className="p-3 glass rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <HardDrive className="w-5 h-5 text-blue-500" />
                          <div className="text-left">
                            <p className="text-[11px] font-bold">Virtual File System</p>
                            <p className="text-[10px] text-muted-foreground">Active Persistence</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-500">Connected</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Architecture</h3>
                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl text-[11px] font-medium leading-relaxed">
                      WebDash operates on the Cloudflare Global Network. UI rendered via React 18. Draggable components powered by dnd-kit. State managed via Zustand. Persistent data stored in Durable Objects.
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