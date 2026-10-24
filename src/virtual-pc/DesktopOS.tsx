import React, { useEffect } from 'react';
import { useDesktop } from './context/DesktopContext';
import { DesktopIcons } from './components/DesktopIcons';
import { Taskbar } from './components/Taskbar';
import { WindowFrame } from './components/WindowFrame';
import { CrtOverlay } from './components/CrtOverlay';
import { AIChatApp } from './apps/AIChatApp';
import { SettingsApp } from './apps/SettingsApp';
import { TerminalApp } from './apps/TerminalApp';
import { FileExplorerApp } from './apps/FileExplorerApp';
import { NotesApp } from './apps/NotesApp';
import { SysMonitorApp } from './apps/SysMonitorApp';
import { Bot, Settings, Terminal, Folder, FileText, Activity } from 'lucide-react';

export const DesktopOS: React.FC = () => {
  const { windows, closePc } = useDesktop();

  // Listen for Escape key to close the PC and return to bedroom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePc();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closePc]);

  const appIcons: Record<string, React.ReactNode> = {
    'ai-chat': <Bot className="w-4 h-4 text-[#38bdf8]" />,
    settings: <Settings className="w-4 h-4 text-[#ffb300]" />,
    terminal: <Terminal className="w-4 h-4 text-[#4ade80]" />,
    files: <Folder className="w-4 h-4 text-[#e0a97a]" />,
    notes: <FileText className="w-4 h-4 text-[#f472b6]" />,
    sysmon: <Activity className="w-4 h-4 text-[#a78bfa]" />
  };

  const appComponents: Record<string, React.ReactNode> = {
    'ai-chat': <AIChatApp />,
    settings: <SettingsApp />,
    terminal: <TerminalApp />,
    files: <FileExplorerApp />,
    notes: <NotesApp />,
    sysmon: <SysMonitorApp />
  };

  return (
    <div className="relative w-full h-full bg-[#1e222b] overflow-hidden select-none font-mono">
      {/* Retro Desktop Wallpaper */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, #2b3346 0%, #171922 100%),
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 24px 24px, 24px 24px'
        }}
      />

      {/* Subtle Wallpaper Watermark */}
      <div className="absolute right-6 bottom-14 text-right pointer-events-none select-none opacity-20">
        <div className="text-4xl font-black text-white tracking-widest font-mono">PIXEL PC</div>
        <div className="text-xs text-[#ffb347]">9Router AI Edition</div>
      </div>

      {/* Desktop App Icons */}
      <DesktopIcons />

      {/* Windows Layer */}
      {windows.map(win => (
        <WindowFrame key={win.id} window={win} icon={appIcons[win.id]}>
          {appComponents[win.id]}
        </WindowFrame>
      ))}

      {/* Bottom Taskbar */}
      <Taskbar />

      {/* CRT Scanline Filter */}
      <CrtOverlay />
    </div>
  );
};
