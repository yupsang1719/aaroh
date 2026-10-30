import type { SiteSettings } from '@aaroh/shared';
import { useSettings } from '../lib/useApi';
import { SITE_NAME } from '../lib/site';

const SOCIAL_LABELS: Record<keyof SiteSettings['socials'], string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  spotify: 'Spotify',
};

export function Footer() {
  const { data: settings } = useSettings();
  const socials = settings
    ? (Object.keys(SOCIAL_LABELS) as Array<keyof typeof SOCIAL_LABELS>).flatMap((key) => {
        const url = settings.socials[key];
        return url ? [{ key, url, label: SOCIAL_LABELS[key] }] : [];
      })
    : [];

  return (
    <footer className="mt-24 border-t border-line md:mt-40">
      <div className="wrap grid gap-12 py-12 sm:grid-cols-2 md:py-16 lg:grid-cols-12">
        <div className="sm:col-span-2 lg:col-span-7">
          <p className="eyebrow">Get in touch</p>
          {settings && (
            <a
              href={`mailto:${settings.contactEmail}`}
              className="mt-4 inline-block break-all font-display text-display-md font-semibold transition-colors duration-200 hover:text-accent"
            >
              {settings.contactEmail}
            </a>
          )}
        </div>

        {socials.length > 0 && (
          <div className="lg:col-span-3">
            <p className="eyebrow">Follow</p>
            <ul className="mt-4 space-y-1.5">
              {socials.map((s) => (
                <li key={s.key}>
                  <a href={s.url} className="link" rel="me noopener" target="_blank">
                    {s.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {settings?.about.location && (
          <div className="lg:col-span-2">
            <p className="eyebrow">Based in</p>
            <p className="mt-4">{settings.about.location}</p>
          </div>
        )}
      </div>

      <div className="wrap">
        <p className="border-t border-line py-6 text-sm text-muted">
          © {new Date().getFullYear()} {SITE_NAME}
        </p>
      </div>
    </footer>
  );
}
