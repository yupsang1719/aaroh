import { useLocation } from 'react-router';
import { useSettings } from '../lib/useApi';
import { SITE_NAME } from '../lib/site';
import { SocialLinks, hasSocials } from './SocialLinks';

export function Footer() {
  const { data: settings } = useSettings();
  // The Contact page already shows these details next to the form.
  const showContact = useLocation().pathname !== '/contact';

  return (
    <footer className="mt-24 border-t border-line md:mt-40">
      {showContact && (
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

          {settings && hasSocials(settings.socials) && (
            <div className="lg:col-span-3">
              <p className="eyebrow">Follow</p>
              <SocialLinks socials={settings.socials} className="mt-4 space-y-1.5" />
            </div>
          )}

          {settings?.about.location && (
            <div className="lg:col-span-2">
              <p className="eyebrow">Based in</p>
              <p className="mt-4">{settings.about.location}</p>
            </div>
          )}
        </div>
      )}

      <div className="wrap">
        <p className={`py-6 text-sm text-muted ${showContact ? 'border-t border-line' : ''}`}>
          © {new Date().getFullYear()} {SITE_NAME}
        </p>
      </div>
    </footer>
  );
}
