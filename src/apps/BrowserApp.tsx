import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Globe, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
export function BrowserApp() {
  const [url, setUrl] = useState('https://www.google.com/search?igu=1');
  const [inputUrl, setInputUrl] = useState('https://www.google.com');
  const [key, setKey] = useState(0);
  const navigate = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = inputUrl.trim();
    if (!finalUrl.startsWith('http')) {
      if (finalUrl.includes('.')) {
        finalUrl = 'https://' + finalUrl;
      } else {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}&igu=1`;
      }
    }
    setUrl(finalUrl);
    setInputUrl(finalUrl);
  };
  const reload = () => setKey(prev => prev + 1);
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e]">
      {/* Browser Bar */}
      <div className="h-10 border-b flex items-center px-4 gap-4 bg-muted/30">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-8 h-8 opacity-50"><ArrowLeft className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 opacity-50"><ArrowRight className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={reload}><RotateCw className="w-4 h-4" /></Button>
        </div>
        <form onSubmit={navigate} className="flex-1 flex items-center bg-background border rounded-md px-2 h-7 group">
          <Globe className="w-3.5 h-3.5 text-muted-foreground mr-2" />
          <input
            className="flex-1 bg-transparent text-xs outline-none"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
          />
          <Search className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </form>
      </div>
      {/* Viewport */}
      <div className="flex-1 bg-white relative">
        <iframe
          key={key}
          src={url}
          className="w-full h-full border-none"
          title="Browser Viewport"
          sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
}