import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { loadEnv } from '../src/config/env';

describe('GET /api/health', () => {
  it('reports ok', async () => {
    const app = createApp({ env: loadEnv({ NODE_ENV: 'test' }) });
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
