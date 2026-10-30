import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { contactInputSchema } from '@aaroh/shared';
import type { ContactStore } from '../services/contactStore';
import type { Mailer } from '../services/mailer';
import { hashIp } from '../lib/hashIp';

export interface ContactRouterDeps {
  store: ContactStore;
  mailer: Mailer;
  ipHashSalt: string;
  rateLimit: { windowMs: number; limit: number };
}

export function contactRouter({ store, mailer, ipHashSalt, rateLimit: rl }: ContactRouterDeps) {
  const router = Router();

  const limiter = rateLimit({
    windowMs: rl.windowMs,
    limit: rl.limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many messages. Please try again later.' },
  });

  router.post('/', limiter, async (req, res) => {
    const input = contactInputSchema.parse(req.body);

    // Honeypot filled in: almost certainly a bot. Pretend it worked and drop the message.
    if (input.website) {
      res.status(201).json({ ok: true });
      return;
    }

    const record = {
      name: input.name,
      email: input.email,
      type: input.type,
      message: input.message,
      ipHash: hashIp(req.ip ?? 'unknown', ipHashSalt),
    };
    await store.save(record);

    // The message is safely stored, so a mail failure must not fail the request.
    mailer.notifyContact(record).catch((err) => {
      console.error('[contact] Notification email failed:', err);
    });

    res.status(201).json({ ok: true });
  });

  return router;
}
