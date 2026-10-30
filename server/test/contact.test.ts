import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { Mailer } from '../src/services/mailer';
import { loadEnv } from '../src/config/env';
import { makeApp } from './helpers';

const valid = {
  name: 'Test Person',
  email: '  test@example.com ',
  type: 'collaboration',
  message: 'Hello, we would like to work together on a video.',
  website: '',
};

const mockMailer = () => ({ sendContact: vi.fn<Mailer['sendContact']>().mockResolvedValue() });

describe('POST /api/contact', () => {
  it('emails a valid message (trimmed, without the honeypot field)', async () => {
    const mailer = mockMailer();
    const res = await request(makeApp({ mailer })).post('/api/contact').send(valid);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ ok: true });
    expect(mailer.sendContact).toHaveBeenCalledWith({
      name: 'Test Person',
      email: 'test@example.com',
      type: 'collaboration',
      message: valid.message,
    });
  });

  it('tells the visitor when the email could not be sent', async () => {
    const mailer = { sendContact: vi.fn().mockRejectedValue(new Error('SMTP down')) };
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(makeApp({ mailer })).post('/api/contact').send(valid);
    expect(res.status).toBe(502);
    expect(res.body.error).toMatch(/could not be sent/);
    error.mockRestore();
  });

  it('rejects invalid input with field errors and sends nothing', async () => {
    const mailer = mockMailer();
    const res = await request(makeApp({ mailer }))
      .post('/api/contact')
      .send({ ...valid, email: 'not-an-email', type: 'spam', message: 'hi' });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.fieldErrors).sort()).toEqual(['email', 'message', 'type']);
    expect(mailer.sendContact).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON with 400', async () => {
    const res = await request(makeApp())
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send('{"name":');
    expect(res.status).toBe(400);
  });

  it('pretends to accept honeypot submissions but sends nothing', async () => {
    const mailer = mockMailer();
    const res = await request(makeApp({ mailer }))
      .post('/api/contact')
      .send({ ...valid, website: 'https://spam.example' });
    expect(res.status).toBe(201);
    expect(mailer.sendContact).not.toHaveBeenCalled();
  });

  it('rate limits each IP to 5 messages per window', async () => {
    const app = makeApp();
    for (let i = 0; i < 5; i++) {
      expect((await request(app).post('/api/contact').send(valid)).status).toBe(201);
    }
    const limited = await request(app).post('/api/contact').send(valid);
    expect(limited.status).toBe(429);
    expect(limited.body.error).toMatch(/too many/i);
  });
});

describe('production configuration', () => {
  it('requires SMTP settings in production so messages are never lost', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => loadEnv({ NODE_ENV: 'production' })).toThrow();
    expect(
      loadEnv({
        NODE_ENV: 'production',
        SMTP_HOST: 'smtp.example.com',
        SMTP_USER: 'u',
        SMTP_PASS: 'p',
      }).SMTP_HOST,
    ).toBe('smtp.example.com');
    error.mockRestore();
  });
});
