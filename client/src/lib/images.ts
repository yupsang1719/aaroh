/**
 * Hook point for responsive images. Local placeholder images have one size, so this returns
 * undefined. When images come from a CMS with an image CDN (e.g. Sanity's ?w= parameter),
 * build a srcset here and every <Img> on the site picks it up.
 */
export function imageSrcSet(_url: string): string | undefined {
  return undefined;
}
