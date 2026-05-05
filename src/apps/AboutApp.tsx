import React from 'react';
import { Sparkles, Cloud, ShieldCheck } from 'lucide-react';
export function AboutApp() {
  return (
    <div className="p-8 h-full flex flex-col items-center justify-center text-center space-y-6 bg-white dark:bg-black/20">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl">
        <Sparkles className="w-12 h-12 text-white" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">WebDash OS</h1>
        <p className="text-muted-foreground text-sm">Version 1.0.0 (Public Alpha)</p>
      </div>
      <div className="max-w-xs space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
          <Cloud className="w-5 h-5 text-sky-500" />
          <div className="text-left">
            <p className="text-xs font-semibold">Compute Engine</p>
            <p className="text-[11px] text-muted-foreground">Cloudflare Workers Runtime</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <div className="text-left">
            <p className="text-xs font-semibold">Persistence</p>
            <p className="text-[11px] text-muted-foreground">Durable Objects Transactional Storage</p>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground pt-4">
        © 2024 WebDash Corporation. All rights reserved.<br/>
        Designed with precision in the cloud.
      </p>
    </div>
  );
}