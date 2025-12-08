/**
 * Local Development Server for API Functions
 * ShiftCheck Marketing Website
 *
 * Run with: npx tsx api-dev-server.ts
 * Or: npm run dev:api
 */

import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '.env.local') });

const app = express();
const PORT = 3005;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for local development
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, stripe-signature');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Helper to convert Express req/res to Vercel format
interface VercelRequest {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  body: any;
  query: Record<string, string | string[]>;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  setHeader: (key: string, value: string) => VercelResponse;
  end: (data?: string) => void;
}

function createVercelRequest(req: Request): VercelRequest {
  return {
    method: req.method,
    url: req.url,
    headers: req.headers as Record<string, string | string[] | undefined>,
    body: req.body,
    query: req.query as Record<string, string | string[]>,
  };
}

function createVercelResponse(res: Response): VercelResponse {
  const vercelRes: VercelResponse = {
    status: (code: number) => {
      res.status(code);
      return vercelRes;
    },
    json: (data: any) => {
      res.json(data);
    },
    setHeader: (key: string, value: string) => {
      res.setHeader(key, value);
      return vercelRes;
    },
    end: (data?: string) => {
      res.end(data);
    },
  };
  return vercelRes;
}

// API Route handlers - dynamically import
async function loadHandler(handlerPath: string) {
  try {
    const module = await import(handlerPath);
    return module.default;
  } catch (error) {
    console.error(`Failed to load handler ${handlerPath}:`, error);
    return null;
  }
}

// Route definitions - tsx handles .ts imports
const routes = [
  { path: '/api/auth/send-verification', handler: './api/auth/send-verification.ts' },
  { path: '/api/auth/verify-token', handler: './api/auth/verify-token.ts' },
  { path: '/api/webhooks/stripe', handler: './api/webhooks/stripe.ts' },
  { path: '/api/stripe/create-payment-intent', handler: './api/stripe/create-payment-intent.ts' },
  { path: '/api/email/send', handler: './api/email/send.ts' },
  { path: '/api/ai-help', handler: './api/ai-help.ts' },
];

// Register routes
routes.forEach(({ path, handler }) => {
  app.all(path, async (req, res) => {
    console.log(`[${req.method}] ${path}`);
    try {
      const handlerFn = await loadHandler(handler);
      if (!handlerFn) {
        res.status(500).json({ error: `Handler not found for ${path}` });
        return;
      }
      await handlerFn(createVercelRequest(req), createVercelResponse(res));
    } catch (error) {
      console.error(`Error in ${path}:`, error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
});

// 404 for unhandled API routes (Express 5 syntax)
app.use('/api/{*splat}', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.path}` });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 API Dev Server running at http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  routes.forEach(({ path }) => console.log(`  ${path}`));
  console.log(`\nVite is configured to proxy /api/* to this server.`);
  console.log(`Make sure to run both servers:`);
  console.log(`  Terminal 1: npm run dev:api`);
  console.log(`  Terminal 2: npm run dev\n`);
});
