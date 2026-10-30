import { Router } from 'express';
import { slugSchema } from '@aaroh/shared';
import type { ContentProvider } from '../content';
import { getReleaseDetail } from '../content/releases';
import { HttpError } from '../middleware/errors';

export function releasesRouter(content: ContentProvider) {
  const router = Router();

  router.get('/', async (_req, res) => {
    const releases = await content.listReleases();
    res.set('Cache-Control', 'public, max-age=60').json(releases);
  });

  router.get('/:slug', async (req, res) => {
    const slug = slugSchema.safeParse(req.params.slug);
    const release = slug.success ? await getReleaseDetail(content, slug.data) : null;
    if (!release) throw new HttpError(404, 'Release not found');
    res.set('Cache-Control', 'public, max-age=60').json(release);
  });

  return router;
}
