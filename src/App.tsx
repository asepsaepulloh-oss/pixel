import React, { useEffect, useState, useRef } from 'react';
import { GameManager } from './game/GameManager';
import { DesktopProvider } from './virtual-pc/context/DesktopContext';
import { DesktopOS } from './virtual-pc/DesktopOS';
import { SoundFx } from './game/SoundFx';
import { Monitor, Volume2, VolumeX, Sparkles, HelpCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [isPcOpen, setIsPcOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const phaserContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Phaser game
    const game = GameManager.getInstance().initGame('phaser-game-container', {
      onOpenPc: () => {
        setIsPcOpen(true);
      }
    });

    return () => {
      GameManager.getInstance().destroy();
    };
  }, []);

  const handleClosePc = () => {
    SoundFx.playWindowClose();
    setIsPcOpen(false);
    GameManager.getInstance().setPcOpen(false);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    GameManager.getInstance().setMuted(nextMuted);
  };

  return (
    <div className="relative w-screen h-screen bg-[#0e1015] overflow-hidden flex flex-col font-mono select-none">
      {/* Top Game HUD Bar */}
      <header className="h-10 bg-[#161820] border-b border-[#2d313d] flex items-center justify-between px-3 z-20 text-xs text-gray-300">
        <div className="flex items-center space-x-2">
          <Monitor className="w-4 h-4 text-[#ffb347]" />
          <span className="font-bold text-white tracking-wider">PIXEL PC</span>
          <span className="hidden sm:inline-block text-[11px] text-gray-500">• Cozy AI Bedroom Simulation</span>
        </div>

        {/* Controls hint */}
        <div className="hidden md:flex items-center space-x-3 text-[11px] text-gray-400">
          <span>Move: <strong className="text-gray-200">WASD / Arrows</strong></span>
          <span>Interact: <strong className="text-[#ffb347]">E</strong></span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHelp(prev => !prev)}
            className="p-1.5 bg-[#20232c] hover:bg-[#2b303c] border border-[#3b3f51] rounded text-gray-300"
            title="Help / Controls"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleMute}
            className={`p-1.5 rounded border transition-colors ${
              isMuted
                ? 'bg-[#2b1f1f] text-red-400 border-red-800'
                : 'bg-[#20232c] hover:bg-[#2b303c] border-[#3b3f51] text-[#ffb347]'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Quick PC open button */}
          <button
            onClick={() => {
              if (!isPcOpen) {
                GameManager.getInstance().setPcOpen(true);
                SoundFx.playPcBoot();
                setIsPcOpen(true);
              }
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#ffb347] hover:bg-[#ffa726] active:bg-[#ff9800] text-black font-bold rounded shadow-pixel"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open PC</span>
          </button>
        </div>
      </header>

      {/* Main Canvas / Bedroom Container */}
      <main className="flex-1 relative flex items-center justify-center bg-[#0c0d12]">
        <div
          id="phaser-game-container"
          ref={phaserContainerRef}
          className="w-full h-full flex items-center justify-center"
        />

        {/* Virtual Desktop Overlay when PC is Open */}
        {isPcOpen && (
          <div className="absolute inset-0 z-30 animate-in fade-in zoom-in-95 duration-200">
            <DesktopProvider onClosePc={handleClosePc}>
              <DesktopOS />
            </DesktopProvider>
          </div>
        )}

        {/* Help Modal */}
        {showHelp && (
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            onClick={() => setShowHelp(false)}
          >
            <div
              className="max-w-md w-full bg-[#1e2029] border-2 border-[#ffb347] rounded p-4 space-y-3 shadow-2xl text-xs text-gray-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-[#3b3f51] pb-2 font-bold text-white text-sm">
                <span>How to Play Pixel PC</span>
                <button onClick={() => setShowHelp(false)} className="hover:text-red-400">
                  ✕
                </button>
              </div>

              <div className="space-y-2 leading-relaxed">
                <p>1. <strong>Explore:</strong> Use WASD or Arrow Keys to walk around your cozy pixel bedroom.</p>
                <p>2. <strong>Interact:</strong> Walk over to the computer desk and press <strong className="text-[#ffb347]">E</strong> (or click "Open PC").</p>
                <p>3. <strong>Virtual OS:</strong> You can drag, resize, minimize, and maximize windows inside Pixel PC OS.</p>
                <p>4. <strong>AI Chat:</strong> Launch the AI Chat app. It is pre-configured with default model <code className="text-[#38bdf8]">ag/gemini-3.8-flash-medium</code>.</p>
                <p>5. <strong>Settings:</strong> Open Settings to test your 9Router connection at <code className="text-[#4ade80]">http://127.0.0.1:20128/v1</code> or enter your custom endpoint and API key.</p>
                <p>6. <strong>Exit PC:</strong> Press <strong className="text-red-300">Escape</strong> or click Exit on the taskbar to return to walking around the bedroom.</p>
              </div>

              <div className="pt-2 border-t border-[#3b3f51] flex justify-end">
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-3 py-1 bg-[#ffb347] text-black font-bold rounded"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
