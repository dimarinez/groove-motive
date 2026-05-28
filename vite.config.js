import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { sendOpenDecksEmail } from './api/send-open-decks-email.js';

function openDecksEmailDevMiddleware(env) {
  return {
    name: 'open-decks-email-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/send-open-decks-email', async (request, response) => {
        if (request.method !== 'POST') {
          response.statusCode = 405;
          response.setHeader('Allow', 'POST');
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify({ error: 'Method not allowed.' }));
          return;
        }

        const chunks = [];

        request.on('data', (chunk) => {
          chunks.push(chunk);
        });

        request.on('end', async () => {
          try {
            const rawBody = Buffer.concat(chunks).toString('utf8');
            const submission = rawBody ? JSON.parse(rawBody) : {};
            const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || env.VITE_RESEND_API_KEY;
            const result = await sendOpenDecksEmail(submission, apiKey);

            response.statusCode = result.status;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(result.body));
          } catch (error) {
            console.error('Open Decks email failed:', error);
            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ error: 'Email failed to send.' }));
          }
        });
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), openDecksEmailDevMiddleware(env)],
    assetsInclude: ['**/*.glb', '**/*.otf'],
    base: '/',
    server: {
      mimeTypes: {
        '.jsx': 'text/javascript'
      },
      historyApiFallback: true
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    }
  };
});
