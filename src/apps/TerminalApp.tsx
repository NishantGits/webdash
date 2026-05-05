import React, { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useOSStore } from '@/stores/use-os-store';
import type { VFSItem } from '@shared/types';
interface Log {
  type: 'cmd' | 'resp';
  text: string;
}
export function TerminalApp() {
  const [logs, setLogs] = useState<Log[]>([
    { type: 'resp', text: 'WebDash Shell v1.2.0' },
    { type: 'resp', text: 'Type "help" for a list of commands.' },
  ]);
  const [input, setInput] = useState('');
  const [currentDirId, setCurrentDirId] = useState<string | null>(null);
  const [currentPathName, setCurrentPathName] = useState('~');
  const bottomRef = useRef<HTMLDivElement>(null);
  const notifyVfsChange = useOSStore(s => s.notifyVfsChange);
  useEffect(() => {
    if (bottomRef.current) {
      const scrollTimeout = setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return () => clearTimeout(scrollTimeout);
    }
  }, [logs]);
  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawInput = input.trim();
    if (!rawInput) return;
    setLogs(prev => [...prev, { type: 'cmd', text: rawInput }]);
    const parts = rawInput.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    const fullArgs = args.join(' ');
    try {
      switch (cmd) {
        case 'help': {
          setLogs(prev => [...prev, { type: 'resp', text: 'Available commands: ls, cd [dir|..], cat [file], mkdir [name], touch [name], rm [id], pwd, clear, neofetch' }]);
          break;
        }
        case 'ls': {
          const items = await api<VFSItem[]>(`/api/vfs?parentId=${currentDirId ?? 'null'}`);
          const display = items.map(i => `${i.type === 'folder' ? '📁' : '📄'} ${i.name} [${i.id}]`).join('\n');
          setLogs(prev => [...prev, { type: 'resp', text: display || '(empty directory)' }]);
          break;
        }
        case 'cd': {
          if (!fullArgs || fullArgs === '~') {
            setCurrentDirId(null);
            setCurrentPathName('~');
          } else if (fullArgs === '..') {
            if (currentDirId) {
              const item = await api<VFSItem>(`/api/vfs/${currentDirId}`);
              setCurrentDirId(item.parentId);
              if (item.parentId) {
                const parent = await api<VFSItem>(`/api/vfs/${item.parentId}`);
                setCurrentPathName(parent.name);
              } else {
                setCurrentPathName('~');
              }
            }
          } else {
            const items = await api<VFSItem[]>(`/api/vfs?parentId=${currentDirId ?? 'null'}`);
            const target = items.find(i => (i.name === fullArgs || i.id === fullArgs) && i.type === 'folder');
            if (target) {
              setCurrentDirId(target.id);
              setCurrentPathName(target.name);
            } else {
              throw new Error(`cd: no such directory: ${fullArgs}`);
            }
          }
          break;
        }
        case 'cat': {
          if (!fullArgs) throw new Error('cat: missing operand');
          const items = await api<VFSItem[]>(`/api/vfs?parentId=${currentDirId ?? 'null'}`);
          const target = items.find(i => (i.name === fullArgs || i.id === fullArgs) && i.type === 'file');
          if (target) {
            setLogs(prev => [...prev, { type: 'resp', text: target.content || '(empty file)' }]);
          } else {
            throw new Error(`cat: ${fullArgs}: No such file`);
          }
          break;
        }
        case 'mkdir': {
          if (!fullArgs) throw new Error('mkdir: missing operand');
          await api('/api/vfs', { method: 'POST', body: JSON.stringify({ name: fullArgs, type: 'folder', parentId: currentDirId }) });
          notifyVfsChange();
          break;
        }
        case 'touch': {
          if (!fullArgs) throw new Error('touch: missing operand');
          await api('/api/vfs', { method: 'POST', body: JSON.stringify({ name: fullArgs, type: 'file', parentId: currentDirId, content: '' }) });
          notifyVfsChange();
          break;
        }
        case 'rm': {
          if (!fullArgs) throw new Error('rm: missing operand');
          const items = await api<VFSItem[]>(`/api/vfs?parentId=${currentDirId ?? 'null'}`);
          const target = items.find(i => i.name === fullArgs || i.id === fullArgs);
          const idToDelete = target ? target.id : fullArgs;
          await api(`/api/vfs/${idToDelete}`, { method: 'DELETE' });
          notifyVfsChange();
          break;
        }
        case 'pwd': {
          setLogs(prev => [...prev, { type: 'resp', text: `vfs://${currentPathName} (${currentDirId ?? 'root'})` }]);
          break;
        }
        case 'clear': {
          setLogs([]);
          break;
        }
        case 'neofetch': {
          setLogs(prev => [...prev, { type: 'resp', text: 'OS: WebDash Cloud OS\nHost: Cloudflare Runtime\nKernel: Hono Worker + Durable Objects\nShell: React VFS-Shell 1.2\nUptime: 100% (Serverless)' }]);
          break;
        }
        default: {
          setLogs(prev => [...prev, { type: 'resp', text: `sh: command not found: ${cmd}` }]);
        }
      }
    } catch (err: any) {
      setLogs(prev => [...prev, { type: 'resp', text: `error: ${err.message}` }]);
    }
    setInput('');
  };
  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] text-[#e0e0e0] font-mono text-[13px] p-4 overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar scroll-smooth">
        {logs.map((log, i) => (
          <div key={i} className="whitespace-pre-wrap break-all leading-relaxed">
            {log.type === 'cmd' ? (
              <div className="flex gap-2">
                <span className="text-[#4caf50] font-bold">user@webdash</span>
                <span className="text-white/40">:</span>
                <span className="text-[#2196f3] font-medium">{currentPathName}</span>
                <span className="text-white/60">$</span>
                <span className="text-white">{log.text}</span>
              </div>
            ) : (
              <div className="text-white/70 pl-2 border-l border-white/5">{log.text}</div>
            )}
          </div>
        ))}
        <div ref={bottomRef} className="h-1" />
      </div>
      <form onSubmit={handleCommand} className="mt-2 flex gap-2 border-t border-white/5 pt-3">
        <span className="text-[#4caf50] font-bold shrink-0">user@webdash</span>
        <span className="text-[#2196f3] font-medium shrink-0">{currentPathName} $</span>
        <input
          autoFocus
          className="bg-transparent border-none outline-none text-white w-full"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
      </form>
    </div>
  );
}