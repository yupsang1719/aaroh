import type { ReleaseDetail } from '@aaroh/shared';
import type { ContentProvider } from './ContentProvider';

/** Release plus previous/next links, worked out from the ordered published list. */
export async function getReleaseDetail(
  content: ContentProvider,
  slug: string,
): Promise<ReleaseDetail | null> {
  const [release, all] = await Promise.all([
    content.getReleaseBySlug(slug),
    content.listReleases(),
  ]);
  if (!release) return null;

  const index = all.findIndex((r) => r.slug === slug);
  const link = (i: number) => {
    const r = index === -1 ? undefined : all[i];
    return r ? { slug: r.slug, title: r.title } : null;
  };
  return { ...release, previous: link(index - 1), next: link(index + 1) };
}
