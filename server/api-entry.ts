import 'dotenv/config';
import express, { Request, Response } from 'express';
import apiRouter from './routes.ts';

const app = express();

// Trust proxy for secure HTTPS protocol resolution on Vercel edge
app.set('trust proxy', 1);

// JSON and URL-encoded body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// OAuth callback route for Google OAuth popup
app.get(['/auth/callback', '/auth/callback/', '/api/auth/callback'], (req: Request, res: Response) => {
  const { code, error } = req.query;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
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

// Health check endpoint
app.get(['/health', '/api/health'], (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount API router under /api and root fallback
app.use('/api', apiRouter);
app.use(apiRouter);

export default app;
