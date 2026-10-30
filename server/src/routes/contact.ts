import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { contactInputSchema } from '@aaroh/shared';
import type { Mailer } from '../services/mailer';
import { HttpError } from '../middleware/errors';

export interface ContactRouterDeps {
  mailer: Mailer;
  rateLimit: { windowMs: number; limit: number };
}

export function contactRouter({ mailer, rateLimit: rl }: ContactRouterDeps) {
  const router = Router();

  // Per-IP limit, held in memory only (nothing about visitors is stored).
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

    try {
      await mailer.sendContact({
        name: input.name,
        email: input.email,
        type: input.type,
        message: input.message,
      });
    } catch (err) {
      console.error('[contact] Could not send message:', err);
      // Emailing is the only delivery, so the visitor must know it did not arrive.
      throw new HttpError(502, 'Your message could not be sent');
    }

    res.status(201).json({ ok: true });
  });

  return router;
}
