import type { IncomingMessage, ServerResponse } from 'http';
import { resolveApiKey, resolveEndpoint, sendJson } from '../_utils';
import { ChatRequestSchema } from '../../src/shared/schemas';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const rawBody = (req as any).body || {};
    const validation = ChatRequestSchema.safeParse(rawBody);

    if (!validation.success) {
      return sendJson(res, 400, {
        error: validation.error.errors[0]?.message || 'Invalid chat request schema'
      });
    }

    const { model, messages, temperature, max_tokens, customBaseUrl, customApiKey } = validation.data;
    const baseUrl = resolveEndpoint(req, customBaseUrl);
    const apiKey = resolveApiKey(req, customApiKey);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const payload: Record<string, any> = {
      model,
      messages,
      stream: false
    };
    if (typeof temperature === 'number') payload.temperature = temperature;
    if (typeof max_tokens === 'number') payload.max_tokens = max_tokens;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

    let upstreamRes: Response;
    try {
      upstreamRes = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        return sendJson(res, 504, { error: 'Chat completion request timed out' });
      }
      return sendJson(res, 502, { error: `Failed to connect to 9Router: ${err.message}` });
    }

    clearTimeout(timeout);

    const rawResponse = await upstreamRes.text();
    let data: any;
    try {
      data = JSON.parse(rawResponse);
    } catch {
      return sendJson(res, 502, {
        error: `Invalid response from upstream: ${rawResponse.slice(0, 300)}`
      });
    }

    if (!upstreamRes.ok) {
      const errMsg = data?.error?.message || data?.message || `Upstream error HTTP ${upstreamRes.status}`;
      return sendJson(res, upstreamRes.status, { error: errMsg });
    }

    const content = data.choices?.[0]?.message?.content || '';
    return sendJson(res, 200, {
      id: data.id,
      model: data.model || model,
      content,
      usage: data.usage
    });
  } catch (err: any) {
    return sendJson(res, 500, { error: err.message || 'Internal server error during chat' });
  }
}
