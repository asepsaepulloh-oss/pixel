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
        error: validation.error.errors[0]?.message || 'Invalid chat stream request schema'
      });
    }

    const { model, messages, temperature, max_tokens, customBaseUrl, customApiKey } = validation.data;
    const baseUrl = resolveEndpoint(req, customBaseUrl);
    const apiKey = resolveApiKey(req, customApiKey);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const payload: Record<string, any> = {
      model,
      messages,
      stream: true
    };
    if (typeof temperature === 'number') payload.temperature = temperature;
    if (typeof max_tokens === 'number') payload.max_tokens = max_tokens;

    const controller = new AbortController();

    // Abort upstream when client disconnects
    req.on('close', () => {
      controller.abort();
    });

    let upstreamRes: Response;
    try {
      upstreamRes = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      return sendJson(res, 502, { error: `Failed to connect to 9Router stream: ${err.message}` });
    }

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text();
      let errMsg = `Upstream error HTTP ${upstreamRes.status}`;
      try {
        const parsed = JSON.parse(errText);
        errMsg = parsed.error?.message || parsed.message || errMsg;
      } catch {
        if (errText) errMsg = errText.slice(0, 200);
      }
      return sendJson(res, upstreamRes.status, { error: errMsg });
    }

    if (!upstreamRes.body) {
      return sendJson(res, 502, { error: 'Upstream did not return a streamable response body' });
    }

    // Set streaming SSE response headers
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const reader = upstreamRes.body.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          res.write(Buffer.from(value));
          // If response supports flush, flush it
          if (typeof (res as any).flush === 'function') {
            (res as any).flush();
          }
        }
      }
    } catch (streamErr: any) {
      if (streamErr.name !== 'AbortError') {
        console.error('Error during upstream stream pipe:', streamErr);
      }
    } finally {
      res.end();
    }
  } catch (err: any) {
    if (!res.headersSent) {
      return sendJson(res, 500, { error: err.message || 'Stream handler internal error' });
    }
    res.end();
  }
}
