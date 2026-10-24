import { z } from 'zod';
import { DEFAULT_BASE_URL, DEFAULT_MODEL_ID } from './constants';

export const ChatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1, 'Message content cannot be empty').max(32000, 'Message exceeds maximum length')
});

export const ChatRequestSchema = z.object({
  model: z.string().min(1, 'Model ID is required').default(DEFAULT_MODEL_ID),
  messages: z.array(ChatMessageSchema).min(1, 'At least one message is required'),
  stream: z.boolean().optional().default(false),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().positive().max(16384).optional(),
  // Client can optionally provide a session-specific baseUrl or apiKey in the request header or body
  customBaseUrl: z.string().url('Invalid URL format').optional(),
  customApiKey: z.string().optional()
});

export const TestConnectionRequestSchema = z.object({
  baseUrl: z.string().url('Invalid endpoint URL').default(DEFAULT_BASE_URL),
  apiKey: z.string().optional()
});

export const ModelItemSchema = z.object({
  id: z.string(),
  object: z.string().optional(),
  created: z.number().optional(),
  owned_by: z.string().optional()
});

export const ModelListResponseSchema = z.object({
  data: z.array(ModelItemSchema).or(z.array(z.any()))
});

export const SettingsSchema = z.object({
  provider: z.literal('9Router').default('9Router'),
  baseUrl: z.string().url().default(DEFAULT_BASE_URL),
  apiKey: z.string().default(''),
  selectedModel: z.string().default(DEFAULT_MODEL_ID),
  systemPrompt: z.string().max(4000),
  temperature: z.number().min(0).max(2).default(0.7),
  soundEnabled: z.boolean().default(true),
  crtFilterEnabled: z.boolean().default(true),
  autoSaveEnabled: z.boolean().default(true)
});

export const GameSaveSchema = z.object({
  version: z.number(),
  timestamp: z.number(),
  player: z.object({
    x: z.number(),
    y: z.number(),
    direction: z.enum(['up', 'down', 'left', 'right'])
  }),
  settings: SettingsSchema,
  notes: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      updatedAt: z.number()
    })
  ),
  chatHistory: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      model: z.string(),
      createdAt: z.number(),
      messages: z.array(ChatMessageSchema)
    })
  )
});
