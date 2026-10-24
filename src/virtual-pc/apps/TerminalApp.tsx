import React, { useState, useRef, useEffect } from 'react';
import { useDesktop } from '../context/DesktopContext';
import { SoundFx } from '../../game/SoundFx';
import { DEFAULT_MODEL_ID } from '../../shared/constants';

interface CommandOutput {
  command: string;
  output: string[];
}

export const TerminalApp: React.FC = () => {
  const { settings } = useDesktop();
  const [history, setHistory] = useState<CommandOutput[]>([
    {
      command: 'init',
      output: [
        'PIXEL-OS Shell v1.0.4-release (x86_64-pixel-pc)',
        'Type "help" to see available simulated shell commands.',
        'Type "about" for system build information.'
      ]
    }
  ]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = currentInput.trim();
    if (!cmd) return;

    SoundFx.playKeyClick();
    const parts = cmd.split(' ');
    const op = parts[0].toLowerCase();
    const args = parts.slice(1);

    let output: string[] = [];

    switch (op) {
      case 'help':
        output = [
          'Safe Simulated Terminal Commands:',
          '  help          - Display this command manual',
          '  clear         - Clear terminal output buffer',
          '  date          - Show simulated UTC time and date',
          '  about         - Display Pixel PC architecture and build details',
          '  ls            - List contents of current simulated directory',
          '  cat <file>    - Print simulated file contents',
          '  model         - Print active 9Router AI model',
          '  ping <host>   - Simulate ICMP echo latency check',
          '  echo <text>   - Echo text to terminal stdout',
          '  whoami        - Display active user session'
        ];
        break;

      case 'clear':
        setHistory([]);
        setCurrentInput('');
        return;

      case 'date':
        output = [new Date().toUTCString()];
        break;

      case 'about':
        output = [
          'Pixel PC v1.0.0',
          'Kernel: PixelKernel 5.15.0-pixel-virt',
          'Shell: safe-sh (non-executing isolated environment)',
          'AI Gateway: 9Router (OpenAI-compatible protocol)',
          'Engine: Phaser 3 + React 18 + Vite',
          'Target: Vercel Serverless / Electron Desktop'
        ];
        break;

      case 'whoami':
        output = ['guest@pixel-bedroom'];
        break;

      case 'model':
        output = [
          `Configured Model: ${settings.selectedModel || DEFAULT_MODEL_ID}`,
          `9Router Endpoint: ${settings.baseUrl}`
        ];
        break;

      case 'ls':
        output = [
          'drwxr-xr-x  2 user  wheel   64 Oct 24  system/',
          'drwxr-xr-x  4 user  wheel  128 Oct 24  prompts/',
          'drwxr-xr-x  2 user  wheel   64 Oct 24  notes/',
          '-rw-r--r--  1 user  wheel  412 Oct 24  readme.txt',
          '-rw-r--r--  1 user  wheel  184 Oct 24  9router.conf'
        ];
        break;

      case 'cat':
        if (!args[0]) {
          output = ['cat: missing operand. Usage: cat <filename>'];
        } else if (args[0] === 'readme.txt') {
          output = [
            '=== PIXEL PC README ===',
            'Welcome to your personal computer inside the pixel bedroom!',
            'Walk to the computer desk with WASD / Arrow Keys, then press E.',
            'Open Settings to configure your 9Router gateway key.'
          ];
        } else if (args[0] === '9router.conf') {
          output = [
            '# 9Router Configuration',
            `ENDPOINT=${settings.baseUrl}`,
            `DEFAULT_MODEL=${DEFAULT_MODEL_ID}`,
            `AUTH_CONFIGURED=${settings.apiKey ? 'true' : 'false'}`
          ];
        } else {
          output = [`cat: ${args[0]}: No such file or directory`];
        }
        break;

      case 'ping':
        const target = args[0] || '127.0.0.1';
        output = [
          `PING ${target} (56 data bytes)`,
          `64 bytes from ${target}: icmp_seq=1 ttl=64 time=1.42 ms`,
          `64 bytes from ${target}: icmp_seq=2 ttl=64 time=1.38 ms`,
          `--- ${target} ping statistics ---`,
          '2 packets transmitted, 2 received, 0% packet loss'
        ];
        break;

      case 'echo':
        output = [args.join(' ')];
        break;

      default:
        output = [`sh: command not found: ${op}. Type 'help' for available commands.`];
        break;
    }

    setHistory(prev => [...prev, { command: cmd, output }]);
    setCurrentInput('');
  };

  return (
    <div className="flex-1 bg-[#0c0d12] p-3 font-mono text-xs text-[#4ade80] overflow-y-auto flex flex-col select-text">
      <div className="flex-1 space-y-3">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            {item.command !== 'init' && (
              <div className="flex items-center space-x-2 text-gray-400">
                <span className="text-[#ffb347]">pixel@bedroom:~$</span>
                <span className="text-white font-bold">{item.command}</span>
              </div>
            )}
            <div className="leading-relaxed space-y-0.5 pl-1">
              {item.output.map((line, lIdx) => (
                <div key={lIdx} className="text-[#4ade80]/90">
                  {line}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Input line */}
      <form onSubmit={handleExecute} className="mt-2 flex items-center space-x-2 pt-2 border-t border-[#222733]">
        <span className="text-[#ffb347] flex-shrink-0">pixel@bedroom:~$</span>
        <input
          type="text"
          value={currentInput}
          onChange={e => setCurrentInput(e.target.value)}
          placeholder="Type 'help'..."
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-[#4ade80] font-mono text-xs caret-[#4ade80]"
        />
      </form>
    </div>
  );
};
