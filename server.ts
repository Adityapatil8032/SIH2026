import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes.ts';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Body parser for JSON
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API routes mounted FIRST
  app.use('/api', apiRouter);

  // OAuth callback route for Google OAuth popup
  app.get(['/auth/callback', '/auth/callback/'], (req, res) => {
    const { code, error } = req.query;
    res.send(`<!DOCTYPE html>
<html>
  <head>
    <title>APNA ROUTE - Authentication</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        background: #0a0a0a;
        color: #f1f5f9;
        font-family: system-ui, -apple-system, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
      }
      .card {
        background: #111625;
        border: 1px solid #1e293b;
        border-radius: 12px;
        padding: 24px;
        text-align: center;
        max-width: 360px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      }
      .spinner {
        width: 24px;
        height: 24px;
        border: 3px solid #334155;
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 16px;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="spinner"></div>
      <h3 style="margin:0 0 8px;font-size:16px;">APNA ROUTE Authentication</h3>
      <p style="margin:0;font-size:13px;color:#94a3b8;">
        ${error ? 'Authentication error occurred.' : 'Connecting your account securely. Closing window...'}
      </p>
    </div>
    <script>
      if (window.opener) {
        window.opener.postMessage({
          type: 'OAUTH_AUTH_SUCCESS',
          code: ${JSON.stringify(code || '')},
          error: ${JSON.stringify(error || '')}
        }, '*');
        setTimeout(() => { window.close(); }, 400);
      } else {
        window.location.href = '/';
      }
    </script>
  </body>
</html>`);
  });

  // Vite middleware for development vs static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Ensure index.html is served and transformed by Vite for client-side routing
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.startsWith('/auth/callback')) {
        return next();
      }
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  ✨ Apna Route is running!`);
    console.log(`  ➜ Local:   http://localhost:${PORT}`);
    console.log(`  ➜ Network: http://127.0.0.1:${PORT}\n`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
