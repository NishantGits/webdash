import React, { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api-client';
import type { VFSItem } from '@shared/types';
interface Log {
  type: 'cmd' | 'resp';
  text: string;
}
export function TerminalApp() {
  const [logs, setLogs] = useState<Log[]>([
    { type: 'resp', text: 'WebDash Shell v1.1.0' },
    { type: 'resp', text: 'Interacting with Virtual File System...' },
  ]);
  const [input, setInput] = useState('');
  const [currentDirId, setCurrentDirId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);
  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawInput = input.trim();
    if (!rawInput) return;
    setLogs(prev => [...prev, { type: 'cmd', text: rawInput }]);
    const [cmd, ...args] = rawInput.toLowerCase().split(' ');
    const fullArgs = rawInput.split(' ').slice(1).join(' ');
    try {
      switch (cmd) {
        case 'help':
          setLogs(prev => [...prev, { type: 'resp', text: 'Commands: ls, mkdir [name], touch [name], rm [id], pwd, clear, neofetch' }]);
          break;
        case 'ls':
          const items = await api<VFSItem[]>(`/api/vfs?parentId=${currentDirId ?? 'null'}`);
          const display = items.map(i => `${i.type === 'folder' ? '📁' : '📄'} ${i.name} (id: ${i.id})`).join('\n');
          setLogs(prev => [...prev, { type: 'resp', text: display || 'Directory is empty' }]);
          break;
        case 'mkdir':
          if (!fullArgs) throw new Error('mkdir: missing operand');
          await api('/api/vfs', { method: 'POST', body: JSON.stringify({ name: fullArgs, type: 'folder', parentId: currentDirId }) });
          setLogs(prev => [...prev, { type: 'resp', text: `Created folder: ${fullArgs}` }]);
          break;
        case 'touch':
          if (!fullArgs) throw new Error('touch: missing operand');
          await api('/api/vfs', { method: 'POST', body: JSON.stringify({ name: fullArgs, type: 'file', parentId: currentDirId, content: '' }) });
          setLogs(prev => [...prev, { type: 'resp', text: `Created file: ${fullArgs}` }]);
          break;
        case 'rm':
          if (!fullArgs) throw new Error('rm: missing operand (provide ID)');
          await api(`/api/vfs/${fullArgs}`, { method: 'DELETE' });
          setLogs(prev => [...prev, { type: 'resp', text: `Deleted item: ${fullArgs}` }]);
          break;
        case 'pwd':
          setLogs(prev => [...prev, { type: 'resp', text: `Current Path ID: ${currentDirId ?? '/'}` }]);
          break;
        case 'clear':
          setLogs([]);
          break;
        case 'neofetch':
          setLogs(prev => [...prev, { type: 'resp', text: 'OS: WebDash Cloud OS\nHost: Cloudflare Runtime\nShell: React VFS Shell\nMemory: 128MB (Virtual)' }]);
          break;
        default:
          setLogs(prev => [...prev, { type: 'resp', text: `sh: command not found: ${cmd}` }]);
      }
    } catch (err: any) {
      setLogs(prev => [...prev, { type: 'resp', text: `error: ${err.message}` }]);
    }
    setInput('');
  };
  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#f0f0f0] font-mono text-sm p-4 overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
        {logs.map((log, i) => (
          <div key={i} className="whitespace-pre-wrap break-all leading-relaxed">
            {log.type === 'cmd' ? (
              <div className="flex gap-2">
                <span className="text-[#569cd6]">guest@webdash</span>
                <span className="text-white">:</span>
                <span className="text-[#ce9178]">~</span>
                <span className="text-white">$</span>
                <span className="text-[#dcdcaa]">{log.text}</span>
              </div>
            ) : (
              <div className="text-[#9cdcfe] opacity-90">{log.text}</div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleCommand} className="mt-2 flex gap-2 border-t border-white/5 pt-2">
        <span className="text-[#569cd6] shrink-0">guest@webdash:~$</span>
        <input
          autoFocus
          className="bg-transparent border-none outline-none text-[#dcdcaa] w-full"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
      </form>
    </div>
  );
}