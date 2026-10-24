import React, { useState, useEffect } from 'react';
import { useDesktop } from '../context/DesktopContext';
import {
  Monitor,
  Volume2,
  VolumeX,
  Tv,
  LogOut,
  Bot,
  Settings as SettingsIcon,
  Terminal as TerminalIcon,
  Folder,
  FileText,
  Activity,
  ChevronUp
} from 'lucide-react';
import type { AppId } from '../../shared/types';
import { SoundFx } from '../../game/SoundFx';

export const Taskbar: React.FC = () => {
  const {
    windows,
    activeWindowId,
    focusApp,
    minimizeApp,
    openApp,
    settings,
    updateSettings,
    closePc
  } = useDesktop();

  const [timeStr, setTimeStr] = useState<string>('');
  const [startMenuOpen, setStartMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTaskbarItemClick = (id: AppId) => {
    const win = windows.find(w => w.id === id);
    if (!win) return;

    if (win.isMinimized) {
      focusApp(id);
    } else if (activeWindowId === id) {
      minimizeApp(id);
    } else {
      focusApp(id);
    }
  };

  const toggleSound = () => {
    const nextVal = !settings.soundEnabled;
    updateSettings({ soundEnabled: nextVal });
    if (nextVal) SoundFx.playNotification();
  };

  const toggleCrt = () => {
    SoundFx.playKeyClick();
    updateSettings({ crtFilterEnabled: !settings.crtFilterEnabled });
  };

  return (
    <>
      {/* Start Menu Popup */}
      {startMenuOpen && (
        <div
          className="absolute bottom-10 left-1 w-64 bg-[#1e2029] border-2 border-[#ffb347] rounded-t shadow-2xl z-50 overflow-hidden flex flex-col font-mono"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2b303c] to-[#3a4152] p-2.5 border-b border-[#3b3f51] flex items-center space-x-2">
            <Monitor className="w-5 h-5 text-[#ffb347]" />
            <div>
              <div className="text-xs font-bold text-white tracking-wider">PIXEL PC OS</div>
              <div className="text-[10px] text-gray-400">9Router Simulation v1.0</div>
            </div>
          </div>

          {/* App list */}
          <div className="p-1.5 space-y-0.5 text-xs text-gray-200">
            <button
              onClick={() => {
                openApp('ai-chat');
                setStartMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2.5 px-2.5 py-2 hover:bg-[#2e3440] hover:text-[#ffb347] rounded text-left transition-colors"
            >
              <Bot className="w-4 h-4 text-[#38bdf8]" />
              <span>AI Chat (9Router)</span>
            </button>

            <button
              onClick={() => {
                openApp('settings');
                setStartMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2.5 px-2.5 py-2 hover:bg-[#2e3440] hover:text-[#ffb347] rounded text-left transition-colors"
            >
              <SettingsIcon className="w-4 h-4 text-[#ffb300]" />
              <span>AI & System Settings</span>
            </button>

            <button
              onClick={() => {
                openApp('terminal');
                setStartMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2.5 px-2.5 py-2 hover:bg-[#2e3440] hover:text-[#ffb347] rounded text-left transition-colors"
            >
              <TerminalIcon className="w-4 h-4 text-[#4ade80]" />
              <span>Safe Terminal</span>
            </button>

            <button
              onClick={() => {
                openApp('files');
                setStartMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2.5 px-2.5 py-2 hover:bg-[#2e3440] hover:text-[#ffb347] rounded text-left transition-colors"
            >
              <Folder className="w-4 h-4 text-[#e0a97a]" />
              <span>File Explorer</span>
            </button>

            <button
              onClick={() => {
                openApp('notes');
                setStartMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2.5 px-2.5 py-2 hover:bg-[#2e3440] hover:text-[#ffb347] rounded text-left transition-colors"
            >
              <FileText className="w-4 h-4 text-[#f472b6]" />
              <span>Cozy Notes</span>
            </button>

            <button
              onClick={() => {
                openApp('sysmon');
                setStartMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2.5 px-2.5 py-2 hover:bg-[#2e3440] hover:text-[#ffb347] rounded text-left transition-colors"
            >
              <Activity className="w-4 h-4 text-[#a78bfa]" />
              <span>System Monitor</span>
            </button>
          </div>

          {/* Footer: Exit / Shutdown to Bedroom */}
          <div className="p-1.5 border-t border-[#3b3f51] bg-[#16181f]">
            <button
              onClick={() => {
                setStartMenuOpen(false);
                closePc();
              }}
              className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 bg-[#4c1d1d] hover:bg-[#7f1d1d] active:bg-[#991b1b] text-red-200 rounded text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Return to Bedroom (Esc)</span>
            </button>
          </div>
        </div>
      )}

      {/* Taskbar Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[38px] bg-[#191b22] border-t-2 border-[#3b3f51] flex items-center justify-between px-2 z-40 select-none shadow-pixel">
        {/* Left: Start Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              SoundFx.playKeyClick();
              setStartMenuOpen(prev => !prev);
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold border transition-colors ${
              startMenuOpen
                ? 'bg-[#ffb347] text-black border-[#ffb347]'
                : 'bg-[#282c34] text-white border-[#4c566a] hover:bg-[#383f4f] hover:border-[#ffb347]'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-current" />
            <span>START</span>
            <ChevronUp className="w-3 h-3 opacity-70" />
          </button>

          {/* Open App Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto max-w-[calc(100vw-340px)]">
            {windows
              .filter(w => w.isOpen)
              .map(w => {
                const isActive = activeWindowId === w.id && !w.isMinimized;
                return (
                  <button
                    key={w.id}
                    onClick={() => handleTaskbarItemClick(w.id)}
                    className={`flex items-center space-x-1.5 px-2 py-1 rounded text-xs font-mono max-w-[140px] truncate border transition-colors ${
                      isActive
                        ? 'bg-[#2c3242] text-[#ffb347] border-[#ffb347] font-semibold'
                        : w.isMinimized
                        ? 'bg-[#181a20] text-gray-500 border-gray-700 hover:text-gray-300'
                        : 'bg-[#21242d] text-gray-300 border-[#3b3f51] hover:bg-[#2c3242]'
                    }`}
                  >
                    <span className="truncate">{w.title.split('—')[0]}</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Right: System Tray & Clock */}
        <div className="flex items-center space-x-2 text-xs font-mono text-gray-300">
          {/* CRT scanline toggle */}
          <button
            onClick={toggleCrt}
            title={settings.crtFilterEnabled ? 'Disable CRT Scanline Filter' : 'Enable CRT Scanline Filter'}
            className={`p-1 rounded border transition-colors ${
              settings.crtFilterEnabled
                ? 'bg-[#2b352b] text-[#4ade80] border-[#4ade80]'
                : 'bg-[#21242d] text-gray-500 border-gray-700 hover:text-gray-300'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
          </button>

          {/* Sound Mute/Unmute */}
          <button
            onClick={toggleSound}
            title={settings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className={`p-1 rounded border transition-colors ${
              settings.soundEnabled
                ? 'bg-[#2c3242] text-[#ffb347] border-[#ffb347]'
                : 'bg-[#21242d] text-gray-500 border-gray-700 hover:text-gray-300'
            }`}
          >
            {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Clock */}
          <div className="px-2 py-0.5 bg-[#121318] border border-[#2d313d] rounded text-[11px] text-gray-300 font-mono tracking-wider">
            {timeStr || '12:00:00'}
          </div>

          {/* Quick Exit Button */}
          <button
            onClick={closePc}
            title="Leave PC (Escape)"
            className="flex items-center space-x-1 px-2 py-1 bg-[#3a1a1a] hover:bg-[#592222] border border-[#7f2626] rounded text-red-200 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">EXIT</span>
          </button>
        </div>
      </div>
    </>
  );
};
