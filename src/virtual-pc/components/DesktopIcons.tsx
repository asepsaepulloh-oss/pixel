import React, { useState } from 'react';
import { useDesktop } from '../context/DesktopContext';
import { Bot, Settings, Terminal, Folder, FileText, Activity } from 'lucide-react';
import type { AppId } from '../../shared/types';
import { SoundFx } from '../../game/SoundFx';

interface DesktopIconDef {
  id: AppId;
  label: string;
  icon: React.ReactNode;
  color: string;
}

export const DesktopIcons: React.FC = () => {
  const { openApp } = useDesktop();
  const [selectedId, setSelectedId] = useState<AppId | null>(null);

  const icons: DesktopIconDef[] = [
    {
      id: 'ai-chat',
      label: 'AI Chat',
      icon: <Bot className="w-8 h-8" />,
      color: 'text-[#38bdf8]'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-8 h-8" />,
      color: 'text-[#ffb300]'
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: <Terminal className="w-8 h-8" />,
      color: 'text-[#4ade80]'
    },
    {
      id: 'files',
      label: 'Files',
      icon: <Folder className="w-8 h-8" />,
      color: 'text-[#e0a97a]'
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: <FileText className="w-8 h-8" />,
      color: 'text-[#f472b6]'
    },
    {
      id: 'sysmon',
      label: 'Sys Monitor',
      icon: <Activity className="w-8 h-8" />,
      color: 'text-[#a78bfa]'
    }
  ];

  const handleClick = (id: AppId) => {
    setSelectedId(id);
    SoundFx.playKeyClick();
  };

  const handleDoubleClick = (id: AppId) => {
    openApp(id);
  };

  return (
    <div className="absolute top-4 left-4 grid grid-cols-1 gap-4 z-0 select-none">
      {icons.map(item => {
        const isSelected = selectedId === item.id;
        return (
          <div
            key={item.id}
            onClick={() => handleClick(item.id)}
            onDoubleClick={() => handleDoubleClick(item.id)}
            className={`flex flex-col items-center justify-center w-20 p-2 rounded cursor-pointer group transition-all ${
              isSelected
                ? 'bg-[#3b4252]/80 ring-1 ring-[#ffb347]'
                : 'hover:bg-[#2e3440]/60'
            }`}
          >
            <div
              className={`p-2 rounded bg-[#1e2029]/80 border border-[#3b3f51] shadow-pixel group-hover:scale-105 transition-transform ${item.color}`}
            >
              {item.icon}
            </div>
            <span
              className={`mt-1 text-[11px] font-mono text-center tracking-wide px-1 rounded truncate max-w-full ${
                isSelected
                  ? 'bg-[#ffb347] text-black font-semibold'
                  : 'text-gray-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
              }`}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
