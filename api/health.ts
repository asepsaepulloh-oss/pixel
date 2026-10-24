import type { IncomingMessage, ServerResponse } from 'http';
import { sendJson } from './_utils';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  return sendJson(res, 200, {
    status: 'healthy',
    timestamp: Date.now(),
    service: 'Pixel PC Game Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
}
