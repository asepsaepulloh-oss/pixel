import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-dev-middleware',
      configureServer(server) {
        server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          if (!req.url?.startsWith('/api/')) {
            return next();
          }

          try {
            const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            const pathname = url.pathname;

            let handlerModule: any;
            if (pathname === '/api/health') {
              handlerModule = await server.ssrLoadModule('/api/health.ts');
            } else if (pathname === '/api/ai/models') {
              handlerModule = await server.ssrLoadModule('/api/ai/models.ts');
            } else if (pathname === '/api/ai/test-connection') {
              handlerModule = await server.ssrLoadModule('/api/ai/test-connection.ts');
            } else if (pathname === '/api/ai/chat') {
              handlerModule = await server.ssrLoadModule('/api/ai/chat.ts');
            } else if (pathname === '/api/ai/chat-stream') {
              handlerModule = await server.ssrLoadModule('/api/ai/chat-stream.ts');
            } else {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Endpoint not found' }));
              return;
            }

            // Buffer body for POST/PUT
            if (req.method === 'POST' || req.method === 'PUT') {
              const chunks: any[] = [];
              for await (const chunk of req) {
                chunks.push(chunk);
              }
              const rawBody = Buffer.concat(chunks).toString();
              if (rawBody && req.headers['content-type']?.includes('application/json')) {
                try {
                  (req as any).body = JSON.parse(rawBody);
                } catch {
                  (req as any).body = rawBody;
                }
              } else {
                (req as any).body = rawBody;
              }
            }

            // Execute handler
            const handler = handlerModule.default || handlerModule;
            await handler(req, res);
          } catch (err: any) {
            console.error('API middleware error:', err);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Internal dev server error' }));
            }
          }
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared')
    }
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
          react: ['react', 'react-dom']
        }
      }
    }
  }
});
