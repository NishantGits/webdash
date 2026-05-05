import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Cpu, HardDrive, ShieldCheck, Zap, Layers, ExternalLink } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
export function AboutApp() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };
  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0c0c0c] text-foreground select-none overflow-hidden">
      {/* Header Section */}
      <div className="pt-10 pb-6 flex flex-col items-center shrink-0">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative group mb-4"
        >
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 flex items-center justify-center shadow-2xl relative z-10"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 -z-10 group-hover:bg-blue-500/40 transition-colors" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black tracking-tight"
        >
          WebDash
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[13px] text-muted-foreground font-medium"
        >
          Version 1.1.0-alpha • Build 2025.04
        </motion.p>
      </div>
      {/* Metrics Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex-1 px-8 py-4 overflow-y-auto custom-scrollbar space-y-4"
      >
        <motion.div variants={item} className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-blue-500">
              <Cpu className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Processor</span>
            </div>
            <div>
              <p className="text-sm font-semibold">8-Core Cloud Compute</p>
              <p className="text-[11px] text-muted-foreground">V8 Isolate Runtime</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-purple-500">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Memory</span>
            </div>
            <div>
              <p className="text-sm font-semibold">16GB Virtual LPDDR5</p>
              <p className="text-[11px] text-muted-foreground">Sandboxed Allocation</p>
            </div>
          </div>
        </motion.div>
        <motion.div variants={item} className="p-5 rounded-2xl bg-muted/30 border border-border/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-500">
              <HardDrive className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">System Storage</span>
            </div>
            <span className="text-[11px] font-bold text-muted-foreground">4.2 GB / 128 GB</span>
          </div>
          <div className="space-y-2">
            <Progress value={3.2} className="h-2" />
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
              <span>Used: 4.2 GB</span>
              <span>Available: 123.8 GB</span>
            </div>
          </div>
        </motion.div>
        <motion.div variants={item} className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold">System Integrity</p>
              <p className="text-[10px] text-muted-foreground">All services operational</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 text-[11px] gap-1.5">
            System Report <ExternalLink className="w-3 h-3" />
          </Button>
        </motion.div>
      </motion.div>
      {/* Footer */}
      <div className="p-6 border-t bg-muted/10 shrink-0">
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed font-medium">
          ™ and © 2024-2025 WebDash Corporation.<br />
          Distributed under the Cloud-Native Open License.
        </p>
      </div>
    </div>
  );
}