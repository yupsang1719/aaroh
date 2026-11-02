import { Link, useLocation } from 'react-router';
import { useSettings } from '../lib/useApi';
import { CompanyDetails } from './CompanyDetails';
import { SocialLinks, hasSocials } from './SocialLinks';

export function Footer() {
  const { data: settings } = useSettings();
  // The Contact page already shows these details next to the form.
  const showContact = useLocation().pathname !== '/contact';

  return (
    <footer className="on-ink grain relative mt-24 md:mt-40">
      {showContact && (
        <div className="wrap grid gap-12 py-12 sm:grid-cols-2 md:py-16 lg:grid-cols-12">
          <div className="sm:col-span-2 lg:col-span-7">
            <p className="eyebrow">Write to us</p>
            {settings && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="mt-4 inline-block break-all font-display text-display-md font-semibold transition-colors duration-200 hover:text-gold"
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
        <div
          className={`grid gap-4 py-6 text-sm text-ink-muted md:grid-cols-12 md:gap-10 ${showContact ? 'border-t border-ink-line' : ''}`}
        >
          <div className="md:col-span-8">
            {settings && <CompanyDetails legal={settings.legal} compact />}
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 md:col-span-4 md:justify-end">
            <li>
              <Link to="/privacy" className="link">
                Privacy and cookies
              </Link>
            </li>
            <li>
              <Link to="/legal" className="link">
                Company information
              </Link>
            </li>
            <li>
              © {new Date().getFullYear()} {settings?.legal.companyName ?? 'Aaroh'}
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
