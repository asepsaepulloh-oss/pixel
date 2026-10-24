import { describe, it, expect, vi } from 'vitest';
import healthHandler from '../api/health';
import modelsHandler from '../api/ai/models';
import testConnHandler from '../api/ai/test-connection';
import chatHandler from '../api/ai/chat';
import type { IncomingMessage, ServerResponse } from 'http';

function createMockResponse() {
  const res: any = {
    statusCode: 200,
    headers: {},
    data: '',
    setHeader: vi.fn((k, v) => {
      res.headers[k] = v;
    }),
    end: vi.fn((chunk?: any) => {
      if (chunk) res.data += chunk.toString();
    })
  };
  return res;
}

describe('Vercel API Route Handlers', () => {
  it('GET /api/health returns 200 healthy status without secrets', async () => {
    const req = { method: 'GET' } as IncomingMessage;
    const res = createMockResponse();

    await healthHandler(req, res as ServerResponse);

    expect(res.statusCode).toBe(200);
    const parsed = JSON.parse(res.data);
    expect(parsed.status).toBe('healthy');
    expect(parsed.service).toBe('Pixel PC Game Server');
    expect(parsed.apiKey).toBeUndefined();
  });

  it('Rejects non-GET on /api/health with 405 Method Not Allowed', async () => {
    const req = { method: 'POST' } as IncomingMessage;
    const res = createMockResponse();

    await healthHandler(req, res as ServerResponse);

    expect(res.statusCode).toBe(405);
  });

  it('POST /api/ai/test-connection rejects invalid JSON schema with 400', async () => {
    const req: any = {
      method: 'POST',
      headers: {},
      body: { baseUrl: 'not-a-url' }
    };
    const res = createMockResponse();

    await testConnHandler(req, res as ServerResponse);

    expect(res.statusCode).toBe(400);
    const parsed = JSON.parse(res.data);
    expect(parsed.error).toContain('Invalid endpoint URL');
  });

  it('POST /api/ai/chat rejects request without messages with 400', async () => {
    const req: any = {
      method: 'POST',
      headers: {},
      body: { model: 'ag/gemini-3.8-flash-medium', messages: [] }
    };
    const res = createMockResponse();

    await chatHandler(req, res as ServerResponse);

    expect(res.statusCode).toBe(400);
    const parsed = JSON.parse(res.data);
    expect(parsed.error).toContain('At least one message is required');
  });
});
