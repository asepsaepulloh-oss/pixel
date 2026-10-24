import type { IncomingMessage, ServerResponse } from 'http';
import { resolveApiKey, resolveEndpoint, sendJson } from '../_utils';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const baseUrl = resolveEndpoint(req);
    const apiKey = resolveApiKey(req);

    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const upstreamUrl = `${baseUrl}/models`;
    let upstreamRes: Response;

    try {
      upstreamRes = await fetch(upstreamUrl, {
        method: 'GET',
        headers,
        signal: controller.signal
      });
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      if (fetchErr.name === 'AbortError') {
        return sendJson(res, 504, {
          error: `Connection to 9Router timed out after 10s at ${baseUrl}`
        });
      }
      return sendJson(res, 502, {
        error: `Could not reach 9Router endpoint at ${baseUrl}: ${fetchErr.message}`
      });
    }

    clearTimeout(timeout);

    const rawText = await upstreamRes.text();
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      return sendJson(res, 502, {
        error: `Invalid JSON response from 9Router at ${upstreamUrl} (HTTP ${upstreamRes.status})`
      });
    }

    if (!upstreamRes.ok) {
      const errMsg = data?.error?.message || data?.message || `Upstream returned status ${upstreamRes.status}`;
      return sendJson(res, upstreamRes.status, {
        error: `9Router error: ${errMsg}`,
        status: upstreamRes.status
      });
    }

    // Standard OpenAI response format: { data: [{ id: "...", ... }] }
    const modelList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

    return sendJson(res, 200, {
      models: modelList,
      count: modelList.length,
      endpoint: baseUrl
    });
  } catch (err: any) {
    return sendJson(res, 500, { error: err.message || 'Internal server error while fetching models' });
  }
}
