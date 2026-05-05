import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Copy, FileSearch, ExternalLink } from 'lucide-react';
import { useOSStore } from '@/stores/use-os-store';
import { toast } from 'sonner';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
export function AboutApp() {
  const openApp = useOSStore(s => s.openApp);
  const systemSpecs = [
    { label: 'Processor', value: '3.2 GHz Cloudflare V8 Isolate' },
    { label: 'Memory', value: '16 GB Sandboxed Runtime' },
    { label: 'Graphics', value: 'WebGL Hardware Acceleration' },
    { label: 'Serial Number', value: 'WD-2025-CF-DO' },
  ];
  const copyToClipboard = async () => {
    const text = `WebDash Cloud OS\nVersion 1.1.0\n${systemSpecs.map(s => `${s.label}: ${s.value}`).join('\n')}`;
    try {
      // Primary modern approach
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
        return;
      }
      throw new Error('Clipboard API unavailable');
    } catch (err) {
      // Robust Legacy Fallback
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        // Ensure textarea is not visible but part of DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          toast.success('Copied (Legacy Fallback)');
        } else {
          throw new Error('Fallback failed');
        }
      } catch (fallbackErr) {
        console.error('Final copy failure:', fallbackErr);
        toast.error('Failed to copy system information');
      }
    }
  };
  const showSystemReport = () => {
    toast.info('Generating System Report...', {
      description: 'Check terminal for detailed hardware logs.',
    });
  };
  const openInFinder = () => {
    openApp('finder', 'Finder', { navigateTo: null });
  };
  return (
    <ContextMenu>
      <ContextMenuTrigger className="h-full w-full">
        <div className="h-full flex flex-col bg-white/50 dark:bg-[#0c0c0c]/50 text-foreground select-none overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6"
            >
              <div className="w-24 h-24 rounded-[1.4rem] bg-gradient-to-br from-indigo-500 via-blue-600 to-sky-400 flex items-center justify-center shadow-2xl">
                <Monitor className="w-12 h-12 text-white" strokeWidth={1.5} />
              </div>
            </motion.div>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center space-y-1 mb-8"
            >
              <h1 className="text-3xl font-bold tracking-tight">WebDash</h1>
              <p className="text-[13px] text-muted-foreground font-medium">Version 1.1.0</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-[280px] space-y-3"
            >
              {systemSpecs.map((spec) => (
                <div key={spec.label} className="flex justify-between items-baseline gap-4">
                  <span className="text-[11px] font-bold text-foreground/80 whitespace-nowrap">{spec.label}</span>
                  <span className="text-[11px] text-muted-foreground text-right">{spec.value}</span>
                </div>
              ))}
            </motion.div>
          </div>
          <div className="p-6 border-t border-white/10 bg-black/5 flex flex-col items-center gap-4">
            <button
              onClick={showSystemReport}
              className="text-[11px] font-semibold bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md border border-white/10 transition-colors"
            >
              System Report...
            </button>
            <p className="text-[10px] text-muted-foreground/60 text-center font-medium leading-tight">
              ™ and © 2024-2025 WebDash Corporation.<br />
              All Rights Reserved.
            </p>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 glass border-white/20">
        <ContextMenuItem onClick={showSystemReport} className="gap-2">
          <FileSearch className="w-4 h-4" /> System Report...
        </ContextMenuItem>
        <ContextMenuItem onClick={copyToClipboard} className="gap-2">
          <Copy className="w-4 h-4" /> Copy System Info
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={openInFinder} className="gap-2">
          <ExternalLink className="w-4 h-4" /> Show in Finder
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}