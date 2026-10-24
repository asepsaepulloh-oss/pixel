import type { IncomingMessage, ServerResponse } from 'http';

export function resolveEndpoint(req: IncomingMessage, customBaseUrl?: string): string {
  const headerUrl = (req.headers['x-router-base-url'] || req.headers['x-9router-base-url']) as string | undefined;
  const envUrl =
    process.env.ROUTER_BASE_URL ||
    process.env.GATEWAY_BASE_URL ||
    process.env.AI_BASE_URL ||
    process.env.NINE_ROUTER_BASE_URL ||
    process.env['9ROUTER_BASE_URL'];
  const rawUrl = headerUrl || customBaseUrl || envUrl || 'http://127.0.0.1:20128/v1';

  try {
    const parsed = new URL(rawUrl);
    // Security check: prevent cloud metadata IP traversal
    if (parsed.hostname === '169.254.169.254' || parsed.hostname === 'metadata.google.internal') {
      throw new Error('Access to cloud metadata endpoints is prohibited');
    }
    // Remove trailing slashes
    return rawUrl.replace(/\/+$/, '');
  } catch (err: any) {
    throw new Error(`Invalid 9Router Base URL: ${err.message}`);
  }
}

export function resolveApiKey(req: IncomingMessage, customKey?: string): string | undefined {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  if (customKey && customKey.trim().length > 0) {
    return customKey.trim();
  }
  return (
    process.env.ROUTER_API_KEY ||
    process.env.GATEWAY_API_KEY ||
    process.env.AI_API_KEY ||
    process.env.NINE_ROUTER_API_KEY ||
    process.env['9ROUTER_API_KEY'] ||
    undefined
  );
}

export function maskSecret(secret?: string): string {
  if (!secret) return 'none';
  if (secret.length <= 8) return '****';
  return `${secret.slice(0, 3)}...${secret.slice(-4)}`;
}

export function sendJson(res: ServerResponse, statusCode: number, data: any): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.end(JSON.stringify(data));
}
