import React, { useState } from 'react';
import { Folder, FileText, ChevronRight, HardDrive, FileCode } from 'lucide-react';
import { SoundFx } from '../../game/SoundFx';
import { DEFAULT_MODEL_ID } from '../../shared/constants';

interface VirtualFile {
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified?: string;
  content?: string;
  children?: VirtualFile[];
}

export const FileExplorerApp: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('~/documents');
  const [selectedFile, setSelectedFile] = useState<VirtualFile | null>(null);

  const fileTree: Record<string, VirtualFile[]> = {
    '~': [
      { name: 'documents', type: 'folder', modified: 'Oct 24, 2026' },
      { name: 'prompts', type: 'folder', modified: 'Oct 24, 2026' },
      { name: 'system', type: 'folder', modified: 'Oct 24, 2026' }
    ],
    '~/documents': [
      {
        name: 'welcome_note.txt',
        type: 'file',
        size: '1.2 KB',
        modified: 'Oct 24, 2026',
        content:
          'Welcome to Pixel PC!\n\nThis simulation combines a cozy Stardew-inspired pixel bedroom with a full retro virtual OS.\nEnjoy talking to your local or remote 9Router AI models!'
      },
      {
        name: 'bedroom_ideas.txt',
        type: 'file',
        size: '0.8 KB',
        modified: 'Oct 24, 2026',
        content:
          '- Add more house plants near the window\n- Install a record player on the bedside table\n- Keep the room cozy and warm'
      }
    ],
    '~/prompts': [
      {
        name: 'coding_assistant.prompt',
        type: 'file',
        size: '2.1 KB',
        modified: 'Oct 24, 2026',
        content:
          'You are an expert full-stack engineer. Write clean, production-ready code with complete type safety and descriptive comments.'
      },
      {
        name: 'pixel_art_ideas.prompt',
        type: 'file',
        size: '1.5 KB',
        modified: 'Oct 24, 2026',
        content:
          'Generate creative palette palettes and 16x16 tile layout ideas for cozy top-down pixel art RPG scenes.'
      }
    ],
    '~/system': [
      {
        name: '9router_manifest.json',
        type: 'file',
        size: '0.4 KB',
        modified: 'Oct 24, 2026',
        content: JSON.stringify(
          {
            gateway: '9Router',
            default_model: DEFAULT_MODEL_ID,
            protocol: 'OpenAI-Compatible',
            streaming: true
          },
          null,
          2
        )
      }
    ]
  };

  const filesInCurrentDir = fileTree[currentPath] || [];

  const handleItemClick = (item: VirtualFile) => {
    SoundFx.playKeyClick();
    if (item.type === 'folder') {
      const nextPath = currentPath === '~' ? `~/${item.name}` : `${currentPath}/${item.name}`;
      if (fileTree[nextPath]) {
        setCurrentPath(nextPath);
        setSelectedFile(null);
      }
    } else {
      setSelectedFile(item);
    }
  };

  const handleNavigateUp = () => {
    SoundFx.playKeyClick();
    if (currentPath === '~') return;
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/') || '~');
    setSelectedFile(null);
  };

  return (
    <div className="flex h-full font-mono text-xs select-none">
      {/* Sidebar Navigation */}
      <div className="w-40 bg-[#14151b] border-r border-[#2d313d] p-2 space-y-1">
        <div className="text-[10px] text-gray-500 font-bold px-2 py-1 tracking-wider uppercase">
          Places
        </div>
        <button
          onClick={() => {
            setCurrentPath('~');
            setSelectedFile(null);
          }}
          className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded transition-colors ${
            currentPath === '~' ? 'bg-[#2b303c] text-[#ffb347] font-semibold' : 'text-gray-300 hover:bg-[#1e2029]'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>Home (~)</span>
        </button>

        <button
          onClick={() => {
            setCurrentPath('~/documents');
            setSelectedFile(null);
          }}
          className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded transition-colors ${
            currentPath === '~/documents' ? 'bg-[#2b303c] text-[#ffb347] font-semibold' : 'text-gray-300 hover:bg-[#1e2029]'
          }`}
        >
          <Folder className="w-3.5 h-3.5 text-[#e0a97a]" />
          <span>Documents</span>
        </button>

        <button
          onClick={() => {
            setCurrentPath('~/prompts');
            setSelectedFile(null);
          }}
          className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded transition-colors ${
            currentPath === '~/prompts' ? 'bg-[#2b303c] text-[#ffb347] font-semibold' : 'text-gray-300 hover:bg-[#1e2029]'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Prompts</span>
        </button>
      </div>

      {/* Main File Browser Area */}
      <div className="flex-1 flex flex-col bg-[#191b22] overflow-hidden">
        {/* Breadcrumb Path Bar */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1e2029] border-b border-[#2d313d] text-gray-300">
          <button
            onClick={handleNavigateUp}
            disabled={currentPath === '~'}
            className="hover:text-[#ffb347] disabled:opacity-30 px-1"
          >
            ..
          </button>
          <span>/</span>
          <span className="text-[#ffb347] font-bold">{currentPath}</span>
        </div>

        {/* Content list & preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* File grid */}
          <div className="flex-1 p-3 grid grid-cols-3 gap-3 auto-rows-max overflow-y-auto">
            {filesInCurrentDir.map(item => (
              <div
                key={item.name}
                onClick={() => handleItemClick(item)}
                className={`flex flex-col items-center justify-center p-3 rounded border cursor-pointer transition-colors ${
                  selectedFile?.name === item.name
                    ? 'bg-[#2c3242] border-[#ffb347] ring-1 ring-[#ffb347]'
                    : 'bg-[#14151b] border-[#3b3f51] hover:bg-[#20232c]'
                }`}
              >
                {item.type === 'folder' ? (
                  <Folder className="w-8 h-8 text-[#e0a97a]" />
                ) : (
                  <FileText className="w-8 h-8 text-[#38bdf8]" />
                )}
                <span className="mt-1.5 text-center truncate max-w-full text-[11px] text-gray-200">
                  {item.name}
                </span>
                {item.size && <span className="text-[9px] text-gray-500">{item.size}</span>}
              </div>
            ))}
          </div>

          {/* File Preview Pane */}
          {selectedFile && selectedFile.content && (
            <div className="w-64 bg-[#14151b] border-l border-[#2d313d] p-3 flex flex-col select-text overflow-hidden">
              <div className="border-b border-[#2d313d] pb-2 mb-2">
                <div className="font-bold text-[#ffb347] truncate">{selectedFile.name}</div>
                <div className="text-[10px] text-gray-500">{selectedFile.size} • {selectedFile.modified}</div>
              </div>
              <div className="flex-1 overflow-y-auto bg-[#0e0f14] p-2 rounded border border-[#262933] text-gray-300 whitespace-pre-wrap font-mono text-[11px]">
                {selectedFile.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
