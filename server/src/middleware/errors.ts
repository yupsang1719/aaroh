import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError, z } from 'zod';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const apiNotFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Not found' });
};

// Express 5 forwards rejected promises from async handlers here automatically.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Invalid input', fieldErrors: z.flattenError(err).fieldErrors });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  // Errors raised by body-parser (malformed JSON, body too large) carry a client status.
  const status = typeof err?.status === 'number' && err.status < 500 ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Something went wrong' : err.message });
};
