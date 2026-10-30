import { staticPageMeta } from '@aaroh/shared/seo';
import { Seo } from '../components/Seo';
import { PageHeader } from '../components/PageHeader';
import { PageError, PageLoading } from '../components/PageStatus';
import { ContactForm } from '../components/ContactForm';
import { EmailContact } from '../components/EmailContact';
import { SocialLinks, hasSocials } from '../components/SocialLinks';
import { useSettings } from '../lib/useApi';

export default function ContactPage() {
  const settings = useSettings();
  const s = settings.data;
  // settings.json › contactFormEnabled: the form, or email only.
  const formEnabled = s?.contactFormEnabled ?? false;

  return (
    <>
      <Seo meta={staticPageMeta('contact')} />
      <PageHeader
        title="Contact"
        intro={
          formEnabled
            ? 'For collaborations, press, licensing or anything else, send us a message.'
            : 'For collaborations, press, licensing or anything else, email us directly.'
        }
      />

      {settings.status === 'loading' && <PageLoading />}
      {settings.status === 'error' && <PageError error={settings.error} />}

      {s && (
        <div className="wrap grid gap-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            {formEnabled ? <ContactForm /> : <EmailContact email={s.contactEmail} />}
          </div>

          <aside
            aria-label={formEnabled ? 'Other ways to reach us' : 'More about us'}
            className="space-y-10 lg:col-span-4 lg:col-start-9"
          >
            {formEnabled && (
              <div>
                <h2 className="eyebrow">Email</h2>
                <a
                  href={`mailto:${s.contactEmail}`}
                  className="link mt-3 inline-block break-all text-xl font-medium"
                >
                  {s.contactEmail}
                </a>
              </div>
            )}
            {hasSocials(s.socials) && (
              <div>
                <h2 className="eyebrow">Follow</h2>
                <SocialLinks socials={s.socials} className="mt-3 space-y-1.5 text-lg" />
              </div>
            )}
            {s.about.location && (
              <div>
                <h2 className="eyebrow">Based in</h2>
                <p className="mt-3 text-lg">{s.about.location}</p>
              </div>
            )}
            <div>
              <h2 className="eyebrow">Company</h2>
              <p className="mt-3 text-lg">{s.legal.companyName}</p>
              <p className="mt-1 text-muted">Company number {s.legal.companyNumber}</p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
