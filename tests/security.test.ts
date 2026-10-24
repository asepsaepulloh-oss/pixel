import { describe, it, expect } from 'vitest';
import { maskSecret, resolveEndpoint, resolveApiKey } from '../api/_utils';
import type { IncomingMessage } from 'http';

describe('Security & URL Resolution', () => {
  it('masks sensitive API keys properly', () => {
    expect(maskSecret('sk-1234567890abcdef')).toBe('sk-...cdef');
    expect(maskSecret('short')).toBe('****');
    expect(maskSecret(undefined)).toBe('none');
  });

  it('rejects SSRF cloud metadata IP attempts', () => {
    const fakeReq = { headers: {} } as IncomingMessage;
    expect(() => {
      resolveEndpoint(fakeReq, 'http://169.254.169.254/latest/meta-data/');
    }).toThrow(/prohibited/i);

    expect(() => {
      resolveEndpoint(fakeReq, 'http://metadata.google.internal/computeMetadata/v1/');
    }).toThrow(/prohibited/i);
  });

  it('correctly resolves custom base URL from request header or argument', () => {
    const fakeReqWithHeader = {
      headers: {
        'x-9router-base-url': 'https://my-router.domain.com/v1/'
      }
    } as unknown as IncomingMessage;

    const resolved = resolveEndpoint(fakeReqWithHeader);
    expect(resolved).toBe('https://my-router.domain.com/v1');
  });

  it('extracts Bearer API key securely from authorization header', () => {
    const fakeReq = {
      headers: {
        authorization: 'Bearer 9router-secret-token-xyz'
      }
    } as unknown as IncomingMessage;

    const key = resolveApiKey(fakeReq);
    expect(key).toBe('9router-secret-token-xyz');
  });

  it('supports environment variables without numbers for Vercel compatibility', () => {
    const fakeReq = { headers: {} } as IncomingMessage;
    
    process.env.ROUTER_BASE_URL = 'https://my-gateway.domain.com/v1/';
    expect(resolveEndpoint(fakeReq)).toBe('https://my-gateway.domain.com/v1');
    delete process.env.ROUTER_BASE_URL;

    process.env.ROUTER_API_KEY = 'sk-secret-from-env';
    expect(resolveApiKey(fakeReq)).toBe('sk-secret-from-env');
    delete process.env.ROUTER_API_KEY;
  });
});
