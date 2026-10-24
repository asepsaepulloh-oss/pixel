import { DEFAULT_BASE_URL, DEFAULT_MODEL_ID, DEFAULT_SYSTEM_PROMPT, LOCAL_STORAGE_KEY, SAVE_SCHEMA_VERSION, SETTINGS_STORAGE_KEY } from './constants';
import type { Conversation, GameSave, NoteItem, Settings } from './types';
import { GameSaveSchema, SettingsSchema } from './schemas';

export const defaultSettings: Settings = {
  provider: '9Router',
  baseUrl: DEFAULT_BASE_URL,
  apiKey: '',
  selectedModel: DEFAULT_MODEL_ID,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  temperature: 0.7,
  soundEnabled: true,
  crtFilterEnabled: true,
  autoSaveEnabled: true
};

export const defaultSave: GameSave = {
  version: SAVE_SCHEMA_VERSION,
  timestamp: Date.now(),
  player: {
    x: 240,
    y: 160,
    direction: 'down'
  },
  settings: defaultSettings,
  notes: [
    {
      id: 'note-welcome',
      title: 'Welcome to Pixel PC!',
      content: 'Here are your system notes.\n1. Walk to the PC desk with WASD or Arrow Keys.\n2. Press E to use PC.\n3. Configure 9Router in Settings.\n4. Default Model: ag/gemini-3.8-flash-medium.',
      updatedAt: Date.now()
    }
  ],
  chatHistory: [
    {
      id: 'conv-default',
      title: 'First Chat with Pixel AI',
      model: DEFAULT_MODEL_ID,
      createdAt: Date.now(),
      messages: [
        {
          role: 'system',
          content: DEFAULT_SYSTEM_PROMPT
        },
        {
          role: 'assistant',
          content: 'Hello! I am your AI assistant inside Pixel PC. How can I assist you in your cozy workspace today?'
        }
      ]
    }
  ]
};

export class StorageManager {
  private static saveCache: GameSave | null = null;

  public static loadGame(): GameSave {
    if (this.saveCache) return this.saveCache;

    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) {
        this.saveCache = defaultSave;
        return defaultSave;
      }

      const parsed = JSON.parse(raw);
      const validated = GameSaveSchema.safeParse(parsed);
      if (validated.success) {
        this.saveCache = validated.data;
        return validated.data;
      }
      console.warn('Save data validation warning, merging with default save:', validated.error);
      const fallback: GameSave = { ...defaultSave, ...parsed };
      this.saveCache = fallback;
      return fallback;
    } catch (err) {
      console.error('Error loading game save:', err);
      this.saveCache = defaultSave;
      return defaultSave;
    }
  }

  public static saveGame(data: Partial<GameSave>): void {
    try {
      const current = this.loadGame();
      const updated: GameSave = {
        ...current,
        ...data,
        timestamp: Date.now()
      };
      this.saveCache = updated;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save game:', err);
    }
  }

  public static loadSettings(): Settings {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return defaultSettings;
      const parsed = JSON.parse(raw);
      const validated = SettingsSchema.safeParse(parsed);
      if (validated.success) return validated.data;
      return { ...defaultSettings, ...parsed };
    } catch {
      return defaultSettings;
    }
  }

  public static saveSettings(settings: Settings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      this.saveGame({ settings });
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  }
}
