import React, { useState, useRef, useEffect } from 'react';
import type { WindowState } from '../../shared/types';
import { useDesktop } from '../context/DesktopContext';
import { Minus, Square, Copy, X } from 'lucide-react';

interface WindowFrameProps {
  window: WindowState;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ window: win, icon, children }) => {
  const { focusApp, closeApp, minimizeApp, maximizeApp, updateWindowPos, activeWindowId } = useDesktop();
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0
  });

  const isActive = activeWindowId === win.id;

  const handleMouseDown = (e: React.MouseEvent) => {
    focusApp(win.id);
    if (win.isMaximized) return;

    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: win.position.x,
      initialY: win.position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || win.isMaximized) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      const newX = Math.max(10, Math.min(window.innerWidth - 120, dragRef.current.initialX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, dragRef.current.initialY + dy));

      updateWindowPos(win.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, win.id, win.isMaximized]);

  if (!win.isOpen || win.isMinimized) {
    return null;
  }

  const containerStyle: React.CSSProperties = win.isMaximized
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 38,
        width: '100%',
        height: 'calc(100% - 38px)',
        zIndex: win.zIndex
      }
    : {
        position: 'absolute',
        left: `${win.position.x}px`,
        top: `${win.position.y}px`,
        width: `min(${win.size.width}px, calc(100vw - 20px))`,
        height: `min(${win.size.height}px, calc(100vh - 70px))`,
        zIndex: win.zIndex
      };

  return (
    <div
      style={containerStyle}
      onClick={() => focusApp(win.id)}
      className={`flex flex-col bg-[#1e2029] border-2 rounded-sm select-none shadow-pixel-lg overflow-hidden transition-shadow ${
        isActive
          ? 'border-[#ffb347] ring-1 ring-[#ffb347]/40 shadow-2xl'
          : 'border-[#3b3f51] opacity-95'
      }`}
    >
      {/* Window Title Bar */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={() => maximizeApp(win.id)}
        className={`flex items-center justify-between px-2.5 py-1.5 cursor-move ${
          isActive
            ? 'bg-gradient-to-r from-[#2b303c] via-[#373e4f] to-[#2b303c] text-white border-b border-[#4c566a]'
            : 'bg-[#181a20] text-gray-400 border-b border-[#2d313d]'
        }`}
      >
        <div className="flex items-center space-x-2 overflow-hidden pr-2">
          <span className="text-[#ffb347] flex-shrink-0">{icon}</span>
          <span className="text-xs font-mono font-bold tracking-wide truncate">
            {win.title}
          </span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center space-x-1 flex-shrink-0" onMouseDown={e => e.stopPropagation()}>
          <button
            onClick={() => minimizeApp(win.id)}
            title="Minimize"
            className="w-5 h-5 flex items-center justify-center bg-[#282c34] hover:bg-[#3e4451] active:bg-[#4c566a] border border-[#4c566a] rounded-xs text-gray-300 text-xs"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => maximizeApp(win.id)}
            title={win.isMaximized ? 'Restore' : 'Maximize'}
            className="w-5 h-5 flex items-center justify-center bg-[#282c34] hover:bg-[#3e4451] active:bg-[#4c566a] border border-[#4c566a] rounded-xs text-gray-300 text-xs"
          >
            {win.isMaximized ? <Copy className="w-2.5 h-2.5" /> : <Square className="w-2.5 h-2.5" />}
          </button>
          <button
            onClick={() => closeApp(win.id)}
            title="Close"
            className="w-5 h-5 flex items-center justify-center bg-[#8b2626] hover:bg-[#b91c1c] active:bg-[#dc2626] border border-[#dc2626] rounded-xs text-white text-xs"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Window Body Content */}
      <div className="flex-1 bg-[#16181f] text-gray-200 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
};
