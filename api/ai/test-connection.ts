import type { IncomingMessage, ServerResponse } from 'http';
import { resolveApiKey, resolveEndpoint, sendJson } from '../_utils';
import { TestConnectionRequestSchema } from '../../src/shared/schemas';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const rawBody = (req as any).body || {};
    const parsed = TestConnectionRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return sendJson(res, 400, { error: parsed.error.errors[0]?.message || 'Invalid request body' });
    }

    const baseUrl = resolveEndpoint(req, parsed.data.baseUrl);
    const apiKey = resolveApiKey(req, parsed.data.apiKey);

    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const targetUrl = `${baseUrl}/models`;
    let response: Response;

    try {
      response = await fetch(targetUrl, {
        method: 'GET',
        headers,
        signal: controller.signal
      });
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        return sendJson(res, 504, {
          success: false,
          error: `Connection timed out connecting to ${targetUrl}`
        });
      }
      return sendJson(res, 502, {
        success: false,
        error: `Endpoint unreachable at ${baseUrl}: ${err.message}`
      });
    }

    clearTimeout(timeout);

    if (response.status === 401 || response.status === 403) {
      return sendJson(res, 401, {
        success: false,
        error: 'Authentication failed: Invalid or missing API key for 9Router'
      });
    }

    if (!response.ok) {
      const errText = await response.text();
      return sendJson(res, response.status, {
        success: false,
        error: `9Router responded with HTTP ${response.status}: ${errText.slice(0, 200)}`
      });
    }

    const data: any = await response.json().catch(() => ({}));
    const modelCount = Array.isArray(data?.data) ? data.data.length : 0;

    return sendJson(res, 200, {
      success: true,
      message: `Successfully connected to 9Router! Discovered ${modelCount} models.`,
      modelCount,
      baseUrl
    });
  } catch (err: any) {
    return sendJson(res, 500, {
      success: false,
      error: err.message || 'Internal error testing connection'
    });
  }
}
