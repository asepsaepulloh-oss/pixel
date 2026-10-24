import { DEFAULT_BASE_URL, DEFAULT_MODEL_ID } from './constants';
import type { ChatMessage, ModelItem } from './types';

export interface ChatStreamCallbacks {
  onToken: (token: string) => void;
  onError: (error: Error) => void;
  onDone: () => void;
}

export class ApiClient {
  private static instance: ApiClient;

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private getAuthHeaders(baseUrl?: string, apiKey?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (baseUrl) {
      headers['x-9router-base-url'] = baseUrl;
    }
    if (apiKey && apiKey.trim().length > 0) {
      headers['authorization'] = `Bearer ${apiKey.trim()}`;
    }
    return headers;
  }

  public async checkHealth(): Promise<{ status: string; timestamp: number; message: string }> {
    const res = await fetch('/api/health');
    if (!res.ok) {
      throw new Error(`Health check failed with status: ${res.status}`);
    }
    return res.json();
  }

  public async testConnection(baseUrl: string, apiKey?: string): Promise<{ success: boolean; message: string; modelCount?: number }> {
    const res = await fetch('/api/ai/test-connection', {
      method: 'POST',
      headers: this.getAuthHeaders(baseUrl, apiKey),
      body: JSON.stringify({ baseUrl, apiKey })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Connection test failed (${res.status})`);
    }
    return data;
  }

  public async fetchModels(baseUrl?: string, apiKey?: string): Promise<ModelItem[]> {
    const res = await fetch('/api/ai/models', {
      method: 'GET',
      headers: this.getAuthHeaders(baseUrl, apiKey)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Failed to fetch models (${res.status})`);
    }

    if (Array.isArray(data.models)) {
      return data.models;
    }
    if (Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  }

  public async sendChat(
    messages: ChatMessage[],
    options: {
      model?: string;
      baseUrl?: string;
      apiKey?: string;
      temperature?: number;
      signal?: AbortSignal;
    }
  ): Promise<string> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: this.getAuthHeaders(options.baseUrl, options.apiKey),
      signal: options.signal,
      body: JSON.stringify({
        model: options.model || DEFAULT_MODEL_ID,
        messages,
        temperature: options.temperature,
        stream: false
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Chat request failed (${res.status})`);
    }

    return data.content || data.choices?.[0]?.message?.content || '';
  }

  public async streamChat(
    messages: ChatMessage[],
    options: {
      model?: string;
      baseUrl?: string;
      apiKey?: string;
      temperature?: number;
      signal?: AbortSignal;
    },
    callbacks: ChatStreamCallbacks
  ): Promise<void> {
    try {
      const res = await fetch('/api/ai/chat-stream', {
        method: 'POST',
        headers: this.getAuthHeaders(options.baseUrl, options.apiKey),
        signal: options.signal,
        body: JSON.stringify({
          model: options.model || DEFAULT_MODEL_ID,
          messages,
          temperature: options.temperature,
          stream: true
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Streaming request failed with status: ${res.status}`);
      }

      if (!res.body) {
        throw new Error('Response body is empty, streaming not supported by endpoint');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === '[DONE]') {
              callbacks.onDone();
              return;
            }

            try {
              const parsed = JSON.parse(dataStr);
              // Extract OpenAI format delta content or raw string
              const delta = parsed.choices?.[0]?.delta?.content || parsed.content || '';
              if (delta) {
                callbacks.onToken(delta);
              }
            } catch {
              // In case server sends plain text tokens
              if (dataStr) {
                callbacks.onToken(dataStr);
              }
            }
          }
        }
      }

      if (buffer.trim()) {
        const trimmed = buffer.trim();
        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.slice(6).trim();
          if (dataStr !== '[DONE]') {
            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices?.[0]?.delta?.content || parsed.content || '';
              if (delta) callbacks.onToken(delta);
            } catch {
              callbacks.onToken(dataStr);
            }
          }
        }
      }

      callbacks.onDone();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        callbacks.onDone();
        return;
      }
      callbacks.onError(err);
    }
  }
}
