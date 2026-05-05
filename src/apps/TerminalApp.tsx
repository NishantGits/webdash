import React, { useState, useRef, useEffect } from 'react';
interface Log {
  type: 'cmd' | 'resp';
  text: string;
}
export function TerminalApp() {
  const [logs, setLogs] = useState<Log[]>([
    { type: 'resp', text: 'WebDash OS v1.0.0 (tty0)' },
    { type: 'resp', text: 'Type "help" to see available commands.' },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);
  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const cmd = input.trim().toLowerCase();
    const newLogs: Log[] = [...logs, { type: 'cmd', text: input }];
    switch (cmd) {
      case 'help':
        newLogs.push({ type: 'resp', text: 'Available commands: help, clear, date, echo [text], whoami, ls, neofetch' });
        break;
      case 'clear':
        setLogs([]);
        setInput('');
        return;
      case 'date':
        newLogs.push({ type: 'resp', text: new Date().toString() });
        break;
      case 'whoami':
        newLogs.push({ type: 'resp', text: 'guest@webdash' });
        break;
      case 'ls':
        newLogs.push({ type: 'resp', text: 'Desktop  Documents  Downloads  Library' });
        break;
      case 'neofetch':
        newLogs.push({ type: 'resp', text: 'OS: WebDash Cloud OS\nKernel: Cloudflare Workers\nShell: Hono/React\nUptime: 2 mins\nPackages: 42 (bun)' });
        break;
      default:
        if (cmd.startsWith('echo ')) {
          newLogs.push({ type: 'resp', text: input.slice(5) });
        } else {
          newLogs.push({ type: 'resp', text: `zsh: command not found: ${cmd}` });
        }
    }
    setLogs(newLogs);
    setInput('');
  };
  return (
    <div className="flex flex-col h-full bg-black/90 text-emerald-400 font-mono text-sm p-4 overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-1">
        {logs.map((log, i) => (
          <div key={i} className="whitespace-pre-wrap break-all">
            {log.type === 'cmd' ? (
              <span className="flex gap-2">
                <span className="text-blue-400">guest@webdash:~$</span>
                <span className="text-white">{log.text}</span>
              </span>
            ) : (
              <span>{log.text}</span>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleCommand} className="mt-2 flex gap-2">
        <span className="text-blue-400 shrink-0">guest@webdash:~$</span>
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