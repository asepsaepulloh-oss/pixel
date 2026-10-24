import React, { useState } from 'react';
import { useDesktop } from '../context/DesktopContext';
import { SoundFx } from '../../game/SoundFx';
import { Plus, Trash2, Save, FileText } from 'lucide-react';
import type { NoteItem } from '../../shared/types';

export const NotesApp: React.FC = () => {
  const { notes, saveNote, deleteNote } = useDesktop();
  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const handleCreateNote = () => {
    SoundFx.playKeyClick();
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: 'Untitled Note',
      content: '',
      updatedAt: Date.now()
    };
    saveNote(newNote);
    setActiveNoteId(newNote.id);
  };

  const handleTitleChange = (val: string) => {
    if (!activeNote) return;
    saveNote({ ...activeNote, title: val, updatedAt: Date.now() });
  };

  const handleContentChange = (val: string) => {
    if (!activeNote) return;
    saveNote({ ...activeNote, content: val, updatedAt: Date.now() });
  };

  return (
    <div className="flex h-full font-mono text-xs select-none">
      {/* Sidebar Note List */}
      <div className="w-44 bg-[#14151b] border-r border-[#2d313d] flex flex-col">
        <div className="p-2 border-b border-[#2d313d]">
          <button
            onClick={handleCreateNote}
            className="w-full flex items-center justify-center space-x-1.5 py-1 bg-[#252834] hover:bg-[#323646] text-[#ffb347] border border-[#ffb347]/40 rounded text-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
          {notes.map(note => (
            <div
              key={note.id}
              onClick={() => {
                setActiveNoteId(note.id);
                SoundFx.playKeyClick();
              }}
              className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors ${
                activeNote?.id === note.id
                  ? 'bg-[#2b303c] text-[#ffb347] font-semibold'
                  : 'text-gray-400 hover:bg-[#1e2029] hover:text-gray-200'
              }`}
            >
              <span className="truncate flex-1 text-[11px]">{note.title || 'Untitled'}</span>
              {notes.length > 1 && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteNote(note.id);
                    if (activeNoteId === note.id) {
                      const remain = notes.filter(n => n.id !== note.id);
                      if (remain.length > 0) setActiveNoteId(remain[0].id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Note Editor Area */}
      {activeNote ? (
        <div className="flex-1 flex flex-col bg-[#191b22] p-3 select-text">
          <input
            type="text"
            value={activeNote.title}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="Note Title..."
            className="bg-transparent border-b border-[#3b3f51] pb-1.5 mb-2 font-bold text-sm text-[#ffb347] outline-none"
          />

          <textarea
            value={activeNote.content}
            onChange={e => handleContentChange(e.target.value)}
            placeholder="Write thoughts, ideas, prompts, or notes here..."
            className="flex-1 bg-transparent border-none outline-none resize-none font-mono text-xs text-gray-200 leading-relaxed placeholder-gray-600"
          />

          <div className="pt-2 border-t border-[#262933] flex justify-between items-center text-[10px] text-gray-500 select-none">
            <span>Autosaved locally</span>
            <span>Last updated: {new Date(activeNote.updatedAt).toLocaleTimeString()}</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          No notes selected.
        </div>
      )}
    </div>
  );
};
