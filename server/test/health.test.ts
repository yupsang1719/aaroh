import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { makeApp } from './helpers';

describe('GET /api/health', () => {
  it('reports ok without touching the database', async () => {
    const res = await request(makeApp()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('returns JSON 404 for unknown API routes', async () => {
    const res = await request(makeApp()).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('sets security headers', async () => {
    const res = await request(makeApp()).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toContain('youtube-nocookie.com');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
