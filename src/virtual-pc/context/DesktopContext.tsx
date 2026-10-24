import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppId, Conversation, NoteItem, Settings, WindowState } from '../../shared/types';
import { StorageManager, defaultSave, defaultSettings } from '../../shared/storage';
import { SoundFx } from '../../game/SoundFx';
import { DEFAULT_MODEL_ID } from '../../shared/constants';

interface DesktopContextType {
  windows: WindowState[];
  activeWindowId: AppId | null;
  settings: Settings;
  notes: NoteItem[];
  chatHistory: Conversation[];
  openApp: (id: AppId) => void;
  closeApp: (id: AppId) => void;
  minimizeApp: (id: AppId) => void;
  maximizeApp: (id: AppId) => void;
  focusApp: (id: AppId) => void;
  updateWindowPos: (id: AppId, pos: { x: number; y: number }) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  saveNote: (note: NoteItem) => void;
  deleteNote: (id: string) => void;
  saveConversation: (conv: Conversation) => void;
  deleteConversation: (id: string) => void;
  closePc: () => void;
}

const initialWindows: WindowState[] = [
  {
    id: 'ai-chat',
    title: 'Pixel AI Chat — 9Router',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    position: { x: 40, y: 30 },
    size: { width: 680, height: 490 },
    zIndex: 10
  },
  {
    id: 'settings',
    title: 'System Settings & 9Router Config',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: { x: 120, y: 70 },
    size: { width: 560, height: 460 },
    zIndex: 1
  },
  {
    id: 'terminal',
    title: 'Safe Terminal (sh)',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: { x: 90, y: 60 },
    size: { width: 520, height: 360 },
    zIndex: 1
  },
  {
    id: 'files',
    title: 'File Explorer',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: { x: 140, y: 90 },
    size: { width: 520, height: 380 },
    zIndex: 1
  },
  {
    id: 'notes',
    title: 'Cozy Notes',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: { x: 160, y: 110 },
    size: { width: 480, height: 380 },
    zIndex: 1
  },
  {
    id: 'sysmon',
    title: 'System Activity Monitor',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: { x: 200, y: 130 },
    size: { width: 440, height: 340 },
    zIndex: 1
  }
];

const DesktopContext = createContext<DesktopContextType | null>(null);

export const DesktopProvider: React.FC<{
  children: React.ReactNode;
  onClosePc: () => void;
}> = ({ children, onClosePc }) => {
  const [windows, setWindows] = useState<WindowState[]>(initialWindows);
  const [activeWindowId, setActiveWindowId] = useState<AppId | null>('ai-chat');
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [notes, setNotes] = useState<NoteItem[]>(defaultSave.notes);
  const [chatHistory, setChatHistory] = useState<Conversation[]>(defaultSave.chatHistory);

  // Load saved state on mount
  useEffect(() => {
    const saved = StorageManager.loadGame();
    if (saved) {
      if (saved.settings) setSettings(saved.settings);
      if (saved.notes) setNotes(saved.notes);
      if (saved.chatHistory) setChatHistory(saved.chatHistory);
      SoundFx.isMuted = !saved.settings.soundEnabled;
    }
  }, []);

  const getTopZIndex = () => {
    return Math.max(...windows.map(w => w.zIndex), 0) + 1;
  };

  const focusApp = (id: AppId) => {
    setActiveWindowId(id);
    const nextZ = getTopZIndex();
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, zIndex: nextZ, isMinimized: false } : w))
    );
  };

  const openApp = (id: AppId) => {
    SoundFx.playWindowOpen();
    const nextZ = getTopZIndex();
    setWindows(prev =>
      prev.map(w =>
        w.id === id
          ? { ...w, isOpen: true, isMinimized: false, zIndex: nextZ }
          : w
      )
    );
    setActiveWindowId(id);
  };

  const closeApp = (id: AppId) => {
    SoundFx.playWindowClose();
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isOpen: false, isMaximized: false } : w))
    );
    if (activeWindowId === id) {
      const remaining = windows.filter(w => w.id !== id && w.isOpen && !w.isMinimized);
      if (remaining.length > 0) {
        const top = remaining.sort((a, b) => b.zIndex - a.zIndex)[0];
        setActiveWindowId(top.id);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const minimizeApp = (id: AppId) => {
    SoundFx.playKeyClick();
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (activeWindowId === id) {
      const remaining = windows.filter(w => w.id !== id && w.isOpen && !w.isMinimized);
      if (remaining.length > 0) {
        const top = remaining.sort((a, b) => b.zIndex - a.zIndex)[0];
        setActiveWindowId(top.id);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const maximizeApp = (id: AppId) => {
    SoundFx.playKeyClick();
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
    focusApp(id);
  };

  const updateWindowPos = (id: AppId, pos: { x: number; y: number }) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, position: pos } : w))
    );
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    StorageManager.saveSettings(updated);
    if (newSettings.soundEnabled !== undefined) {
      SoundFx.isMuted = !newSettings.soundEnabled;
    }
  };

  const saveNote = (note: NoteItem) => {
    setNotes(prev => {
      const exists = prev.some(n => n.id === note.id);
      const next = exists ? prev.map(n => (n.id === note.id ? note : n)) : [note, ...prev];
      StorageManager.saveGame({ notes: next });
      return next;
    });
  };

  const deleteNote = (id: string) => {
    setNotes(prev => {
      const next = prev.filter(n => n.id !== id);
      StorageManager.saveGame({ notes: next });
      return next;
    });
  };

  const saveConversation = (conv: Conversation) => {
    setChatHistory(prev => {
      const exists = prev.some(c => c.id === conv.id);
      const next = exists ? prev.map(c => (c.id === conv.id ? conv : c)) : [conv, ...prev];
      StorageManager.saveGame({ chatHistory: next });
      return next;
    });
  };

  const deleteConversation = (id: string) => {
    setChatHistory(prev => {
      const next = prev.filter(c => c.id !== id);
      StorageManager.saveGame({ chatHistory: next });
      return next;
    });
  };

  return (
    <DesktopContext.Provider
      value={{
        windows,
        activeWindowId,
        settings,
        notes,
        chatHistory,
        openApp,
        closeApp,
        minimizeApp,
        maximizeApp,
        focusApp,
        updateWindowPos,
        updateSettings,
        saveNote,
        deleteNote,
        saveConversation,
        deleteConversation,
        closePc: onClosePc
      }}
    >
      {children}
    </DesktopContext.Provider>
  );
};

export const useDesktop = (): DesktopContextType => {
  const ctx = useContext(DesktopContext);
  if (!ctx) throw new Error('useDesktop must be used within a DesktopProvider');
  return ctx;
};
