import { describe, it, expect } from 'vitest';
import {
  ChatRequestSchema,
  ChatMessageSchema,
  SettingsSchema,
  TestConnectionRequestSchema
} from '../src/shared/schemas';
import { DEFAULT_BASE_URL, DEFAULT_MODEL_ID } from '../src/shared/constants';

describe('Shared Schemas & Defaults', () => {
  it('enforces DEFAULT_MODEL_ID exactly as ag/gemini-3.8-flash-medium', () => {
    expect(DEFAULT_MODEL_ID).toBe('ag/gemini-3.8-flash-medium');
  });

  it('enforces DEFAULT_BASE_URL as http://127.0.0.1:20128/v1', () => {
    expect(DEFAULT_BASE_URL).toBe('http://127.0.0.1:20128/v1');
  });

  it('validates chat messages with correct roles and lengths', () => {
    const valid = ChatMessageSchema.safeParse({
      role: 'user',
      content: 'Hello Pixel AI!'
    });
    expect(valid.success).toBe(true);

    const invalidRole = ChatMessageSchema.safeParse({
      role: 'invalid_role',
      content: 'Test'
    });
    expect(invalidRole.success).toBe(false);

    const emptyContent = ChatMessageSchema.safeParse({
      role: 'user',
      content: ''
    });
    expect(emptyContent.success).toBe(false);
  });

  it('validates chat request schemas with default model', () => {
    const req = ChatRequestSchema.safeParse({
      messages: [{ role: 'user', content: 'What is 2+2?' }]
    });
    expect(req.success).toBe(true);
    if (req.success) {
      expect(req.data.model).toBe('ag/gemini-3.8-flash-medium');
      expect(req.data.stream).toBe(false);
    }
  });

  it('validates settings schema defaults', () => {
    const settings = SettingsSchema.safeParse({
      systemPrompt: 'Custom prompt'
    });
    expect(settings.success).toBe(true);
    if (settings.success) {
      expect(settings.data.provider).toBe('9Router');
      expect(settings.data.baseUrl).toBe(DEFAULT_BASE_URL);
      expect(settings.data.selectedModel).toBe(DEFAULT_MODEL_ID);
    }
  });

  it('validates test-connection request schema', () => {
    const valid = TestConnectionRequestSchema.safeParse({
      baseUrl: 'http://127.0.0.1:20128/v1',
      apiKey: 'sk-test1234'
    });
    expect(valid.success).toBe(true);

    const invalidUrl = TestConnectionRequestSchema.safeParse({
      baseUrl: 'not-a-valid-url'
    });
    expect(invalidUrl.success).toBe(false);
  });
});
