import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { ContactMessageModel } from '../src/models/ContactMessage';
import type { Mailer } from '../src/services/mailer';
import { makeApp, useTestDatabase } from './helpers';

useTestDatabase();

const valid = {
  name: 'Test Person',
  email: '  test@example.com ',
  type: 'collaboration',
  message: 'Hello, we would like to work together on a video.',
  website: '',
};

function mockMailer() {
  return { notifyContact: vi.fn<Mailer['notifyContact']>().mockResolvedValue() };
}

describe('POST /api/contact', () => {
  beforeEach(async () => {
    await ContactMessageModel.deleteMany({});
  });

  it('stores a valid message with a hashed IP and sends a notification', async () => {
    const mailer = mockMailer();
    const res = await request(makeApp({ mailer })).post('/api/contact').send(valid);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ ok: true });

    const saved = await ContactMessageModel.find().lean();
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ name: 'Test Person', email: 'test@example.com' });
    expect(saved[0]!.ipHash).toMatch(/^[a-f0-9]{64}$/);
    expect(saved[0]!.createdAt).toBeInstanceOf(Date);
    expect(saved[0]).not.toHaveProperty('website');
    expect(mailer.notifyContact).toHaveBeenCalledOnce();
  });

  it('rejects invalid input with field errors', async () => {
    const res = await request(makeApp())
      .post('/api/contact')
      .send({ ...valid, email: 'not-an-email', type: 'spam', message: 'hi' });

    expect(res.status).toBe(400);
    expect(Object.keys(res.body.fieldErrors).sort()).toEqual(['email', 'message', 'type']);
    expect(await ContactMessageModel.countDocuments()).toBe(0);
  });

  it('rejects malformed JSON with 400', async () => {
    const res = await request(makeApp())
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send('{"name":');
    expect(res.status).toBe(400);
  });

  it('pretends to accept honeypot submissions but discards them', async () => {
    const mailer = mockMailer();
    const res = await request(makeApp({ mailer }))
      .post('/api/contact')
      .send({ ...valid, website: 'https://spam.example' });

    expect(res.status).toBe(201);
    expect(await ContactMessageModel.countDocuments()).toBe(0);
    expect(mailer.notifyContact).not.toHaveBeenCalled();
  });

  it('still succeeds when the notification email fails', async () => {
    const mailer = { notifyContact: vi.fn().mockRejectedValue(new Error('SMTP down')) };
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(makeApp({ mailer })).post('/api/contact').send(valid);

    expect(res.status).toBe(201);
    expect(await ContactMessageModel.countDocuments()).toBe(1);
    error.mockRestore();
  });

  it('rate limits each IP to 5 messages per window', async () => {
    const app = makeApp();
    for (let i = 0; i < 5; i++) {
      const ok = await request(app).post('/api/contact').send(valid);
      expect(ok.status).toBe(201);
    }
    const limited = await request(app).post('/api/contact').send(valid);
    expect(limited.status).toBe(429);
    expect(limited.body.error).toMatch(/too many/i);
  });
});
