import { Router } from 'express';
import type { ContentProvider } from '../content';
import { HttpError } from '../middleware/errors';

export function settingsRouter(content: ContentProvider) {
  const router = Router();

  router.get('/', async (_req, res) => {
    const settings = await content.getSettings();
    if (!settings) throw new HttpError(404, 'Site settings have not been set up yet');
    res.set('Cache-Control', 'public, max-age=60').json(settings);
  });

  return router;
}
