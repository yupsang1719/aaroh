import type { SiteSettings } from '@aaroh/shared';

const SOCIAL_LABELS: Record<keyof SiteSettings['socials'], string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  spotify: 'Spotify',
};

/** Social profile links. Only networks with a URL in settings are shown. */
export function SocialLinks({
  socials,
  className,
}: {
  socials: SiteSettings['socials'];
  className?: string;
}) {
  const items = (Object.keys(SOCIAL_LABELS) as Array<keyof typeof SOCIAL_LABELS>).flatMap((key) => {
    const url = socials[key];
    return url ? [{ key, url, label: SOCIAL_LABELS[key] }] : [];
  });
  if (items.length === 0) return null;

  return (
    <ul className={className}>
      {items.map((s) => (
        <li key={s.key}>
          <a href={s.url} className="link" rel="me noopener" target="_blank">
            {s.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function hasSocials(socials: SiteSettings['socials']): boolean {
  return Object.values(socials).some(Boolean);
}
