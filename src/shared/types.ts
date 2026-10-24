import { z } from 'zod';
import {
  ChatMessageSchema,
  ChatRequestSchema,
  SettingsSchema,
  GameSaveSchema,
  ModelItemSchema
} from './schemas';

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type GameSave = z.infer<typeof GameSaveSchema>;
export type ModelItem = z.infer<typeof ModelItemSchema>;

export type AppId = 'ai-chat' | 'settings' | 'terminal' | 'files' | 'notes' | 'sysmon';

export interface WindowState {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  createdAt: number;
  messages: ChatMessage[];
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  size?: string;
  updatedAt: string;
}
