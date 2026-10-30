import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    SITE_URL: z
      .url()
      .default('https://aaroh.co.uk')
      .transform((url) => url.replace(/\/+$/, '')),
    // Where content comes from. Only "json" (files in CONTENT_DIR) is implemented.
    CONTENT_SOURCE: z.enum(['json']).default('json'),
    // Content folder (settings.json, releases.json, media/). Defaults to server/content.
    CONTENT_DIR: z.string().optional(),
    // Comma-separated list of browser origins allowed by CORS.
    CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
    // Number of proxies in front of the app (Render/Railway: 1), so req.ip is the real client IP.
    TRUST_PROXY: z.coerce.number().int().min(0).default(0),
    // Built client location; defaults to ../client/dist next to the server.
    CLIENT_DIST_DIR: z.string().optional(),
    CONTACT_RATE_LIMIT: z.coerce.number().int().positive().default(5),
    CONTACT_RATE_WINDOW_MINUTES: z.coerce.number().int().positive().default(15),
    // Contact form email delivery. Required in production; in development messages are
    // printed to the terminal instead when SMTP_HOST is not set.
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    // Microsoft 365 only lets an account send as its own address (or an alias of it).
    SMTP_FROM: z.string().default('Aaroh website <rlp@aaroh.co.uk>'),
    // Inbox that receives contact form messages.
    CONTACT_NOTIFY_TO: z.string().default('rlp@aaroh.co.uk'),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'production') return;
    for (const key of ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'] as const) {
      if (!env[key]) {
        ctx.addIssue({
          code: 'custom',
          path: [key],
          message: 'Required in production so contact form messages reach you',
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  // Treat empty strings in .env as "not set".
  const cleaned = Object.fromEntries(Object.entries(source).filter(([, v]) => v !== ''));
  const parsed = envSchema.safeParse(cleaned);
  if (!parsed.success) {
    console.error('Invalid environment variables:', z.flattenError(parsed.error).fieldErrors);
    throw new Error('Invalid environment variables');
  }
  return parsed.data;
}
