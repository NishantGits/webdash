import React, { useState, useRef, useEffect } from 'react';
import { useVfsStore } from '@/stores/use-vfs-store';
interface Log {
  type: 'cmd' | 'resp';
  text: string;
}
export function TerminalApp() {
  const [logs, setLogs] = useState<Log[]>([
    { type: 'resp', text: 'WebDash Local Shell v2.0.0 (Privacy First)' },
    { type: 'resp', text: 'Type "help" for commands.' },
  ]);
  const [input, setInput] = useState('');
  const [currentDirId, setCurrentDirId] = useState<string | null>(null);
  const [currentPathName, setCurrentPathName] = useState('~');
  const bottomRef = useRef<HTMLDivElement>(null);
  const allItems = useVfsStore(s => s.items);
  const createItem = useVfsStore(s => s.createItem);
  const deleteItem = useVfsStore(s => s.deleteItem);
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);
  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const rawInput = input.trim();
    if (!rawInput) return;
    setLogs(prev => [...prev, { type: 'cmd', text: rawInput }]);
    const parts = rawInput.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');
    try {
      switch (cmd) {
        case 'help':
          setLogs(prev => [...prev, { type: 'resp', text: 'Commands: ls, cd, cat, mkdir, touch, rm, pwd, clear, neofetch' }]);
          break;
        case 'ls': {
          const filtered = allItems.filter(i => i.parentId === currentDirId);
          const display = filtered.map(i => `${i.type === 'folder' ? '📁' : '📄'} ${i.name}`).join('\n') || '(empty)';
          setLogs(prev => [...prev, { type: 'resp', text: display }]);
          break;
        }
        case 'cd': {
          if (!args || args === '~' || args === '/') {
            setCurrentDirId(null);
            setCurrentPathName('~');
          } else if (args === '..') {
            if (currentDirId) {
              const current = allItems.find(i => i.id === currentDirId);
              if (current?.parentId) {
                const parent = allItems.find(i => i.id === current.parentId);
                setCurrentDirId(parent?.id || null);
                setCurrentPathName(parent?.name || '~');
              } else {
                setCurrentDirId(null);
                setCurrentPathName('~');
              }
            }
          } else {
            const target = allItems.find(i => i.parentId === currentDirId && i.name === args && i.type === 'folder');
            if (target) {
              setCurrentDirId(target.id);
              setCurrentPathName(target.name);
            } else {
              setLogs(prev => [...prev, { type: 'resp', text: `cd: no such directory: ${args}` }]);
            }
          }
          break;
        }
        case 'cat': {
          const file = allItems.find(i => i.parentId === currentDirId && i.name === args && i.type === 'file');
          if (file) {
            setLogs(prev => [...prev, { type: 'resp', text: file.content || '(empty)' }]);
          } else {
            setLogs(prev => [...prev, { type: 'resp', text: `cat: no such file: ${args}` }]);
          }
          break;
        }
        case 'mkdir':
          if (!args) throw new Error('mkdir: missing operand');
          createItem({ name: args, type: 'folder', parentId: currentDirId });
          break;
        case 'touch':
          if (!args) throw new Error('touch: missing operand');
          createItem({ name: args, type: 'file', parentId: currentDirId });
          break;
        case 'rm': {
          const targetItem = allItems.find(i => i.parentId === currentDirId && i.name === args);
          if (targetItem) {
            deleteItem(targetItem.id);
          } else {
            setLogs(prev => [...prev, { type: 'resp', text: `rm: cannot remove '${args}': No such file or directory` }]);
          }
          break;
        }
        case 'pwd':
          setLogs(prev => [...prev, { type: 'resp', text: `vfs://${currentPathName === '~' ? '/' : '/' + currentPathName}` }]);
          break;
        case 'clear':
          setLogs([]);
          break;
        case 'neofetch':
          setLogs(prev => [...prev, { type: 'resp', text: 'OS: WebDash Local OS\nPrivacy: 100% Client-Side\nKernel: Zustand + IndexedDB\nShell: React VFS-Shell 2.0' }]);
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