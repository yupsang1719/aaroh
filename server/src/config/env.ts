import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  SITE_URL: z
    .url()
    .default('https://aaroh.co.uk')
    .transform((url) => url.replace(/\/+$/, '')),
  CONTENT_SOURCE: z.enum(['mongo']).default('mongo'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/aaroh'),
  // Comma-separated list of browser origins allowed by CORS.
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  // Number of proxies in front of the app (Render/Railway: 1), so req.ip is the real client IP.
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  // Built client location; defaults to ../client/dist next to the server.
  CLIENT_DIST_DIR: z.string().optional(),
  CONTACT_RATE_LIMIT: z.coerce.number().int().positive().default(5),
  CONTACT_RATE_WINDOW_MINUTES: z.coerce.number().int().positive().default(15),
  IP_HASH_SALT: z.string().default('change-me'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('Aaroh website <no-reply@aaroh.co.uk>'),
  CONTACT_NOTIFY_TO: z.string().default('hello@aaroh.co.uk'),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  // Treat empty strings in .env as "not set".
  const cleaned = Object.fromEntries(Object.entries(source).filter(([, v]) => v !== ''));
  const parsed = envSchema.safeParse(cleaned);
  if (!parsed.success) {
    console.error('Invalid environment variables', z.flattenError(parsed.error).fieldErrors);
    throw new Error('Invalid environment variables');
  }
  if (parsed.data.NODE_ENV === 'production' && parsed.data.IP_HASH_SALT === 'change-me') {
    throw new Error('IP_HASH_SALT must be set in production');
  }
  return parsed.data;
}
