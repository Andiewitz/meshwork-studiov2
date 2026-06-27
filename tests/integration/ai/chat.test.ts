import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import aiRoutes from '@server/modules/ai/routes';

// We removed the AuthModule mock and rely on registry mock inside setupTestApp

// Mock DB calls for getting API keys to return nothing, forcing the route to use the ENV fallback
vi.mock('@server/modules/ai/db', () => ({
  getApiKeyWithPlaintext: vi.fn().mockResolvedValue(null),
  getActiveKeyForProvider: vi.fn().mockResolvedValue(null),
  getUserApiKeys: vi.fn().mockResolvedValue([]),
}));

const setupTestApp = () => {
  const app = express();
  app.use(express.json());
  
  const mockContext = {
    registry: {
      get: (key: string) => {
        if (key === 'isAuthenticated') {
          return (req: any, res: any, next: any) => {
            if (req.headers['x-test-user-id']) {
              req.user = { id: Number(req.headers['x-test-user-id']) };
              next();
            } else {
              res.status(401).json({ message: "Not authenticated" });
            }
          };
        }
        return null;
      }
    },
    eventBus: {
      emit: vi.fn(),
      emitAsync: vi.fn(),
    }
  } as any;

  app.use('/api/v1/ai', aiRoutes(mockContext));
  return app;
};

describe('AI Chat Route Integration Tests', () => {
  let app: express.Express;

  beforeEach(() => {
    app = setupTestApp();
    vi.clearAllMocks();
  });

  describe('POST /api/ai/chat', () => {
    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('x-test-user-id', '1')
        .send({ provider: 'openrouter' }); // missing model and messages

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('provider, model, and messages are required');
    });

    it('should return 404 if no API key is found in DB or ENV', async () => {
      // Temporarily remove ENV variable
      const originalKey = process.env.OPENROUTER_API_KEY;
      delete process.env.OPENROUTER_API_KEY;

      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('x-test-user-id', '1')
        .send({
          provider: 'openrouter',
          model: 'google/gemma-4-31b-it:free',
          messages: [{ role: 'user', content: 'Hello' }]
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('No API key found for provider: openrouter');

      // Restore ENV
      if (originalKey) process.env.OPENROUTER_API_KEY = originalKey;
    });

    it('LIVE TEST: should get a real response from OpenRouter if ENV key is set', async () => {
      // Skip if no real API key is set in environment
      if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your-openrouter-api-key') {
        console.log('Skipping live OpenRouter test because OPENROUTER_API_KEY is not set');
        return;
      }

      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('x-test-user-id', '1')
        .send({
          provider: 'openrouter',
          model: 'google/gemma-4-31b-it:free',
          messages: [{ role: 'user', content: 'Say the word "Meshwork"' }],
          stream: false
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('choices');
      expect(res.body.choices.length).toBeGreaterThan(0);
      
      const content = res.body.choices[0].message.content;
      console.log('Live AI Response:', content);
      
      expect(typeof content).toBe('string');
      expect(content.toLowerCase()).toContain('meshwork');
    }, 15000); // 15s timeout for real API call
  });

  describe('POST /api/ai/suggestions', () => {
    it('should return fallback suggestions if no key is found', async () => {
      // Temporarily remove ENV variable
      const originalKey = process.env.OPENROUTER_API_KEY;
      delete process.env.OPENROUTER_API_KEY;

      const res = await request(app)
        .post('/api/v1/ai/suggestions')
        .set('x-test-user-id', '1')
        .send({
          canvas: { nodes: [], edges: [] }
        });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(4);
      expect(res.body[0]).toBe("Design a scalable Kubernetes microservices architecture");

      // Restore ENV
      if (originalKey) process.env.OPENROUTER_API_KEY = originalKey;
    });
  });
});
