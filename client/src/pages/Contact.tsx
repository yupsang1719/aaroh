import { staticPageMeta } from '@aaroh/shared/seo';
import { Seo } from '../components/Seo';
import { PageHeader } from '../components/PageHeader';
import { ContactForm } from '../components/ContactForm';
import { SocialLinks, hasSocials } from '../components/SocialLinks';
import { useSettings } from '../lib/useApi';

export default function ContactPage() {
  const { data: settings } = useSettings();

  return (
    <>
      <Seo meta={staticPageMeta('contact')} />
      <PageHeader
        title="Contact"
        intro="For collaborations, press, licensing or anything else, send us a message."
      />

      <div className="wrap grid gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <ContactForm />
        </div>

        {settings && (
          <aside
            aria-label="Other ways to reach us"
            className="space-y-10 lg:col-span-4 lg:col-start-9"
          >
            <div>
              <h2 className="eyebrow">Email</h2>
              <a
                href={`mailto:${settings.contactEmail}`}
                className="link mt-3 inline-block break-all text-xl font-medium"
              >
                {settings.contactEmail}
              </a>
            </div>
            {hasSocials(settings.socials) && (
              <div>
                <h2 className="eyebrow">Follow</h2>
                <SocialLinks socials={settings.socials} className="mt-3 space-y-1.5 text-lg" />
              </div>
            )}
            {settings.about.location && (
              <div>
                <h2 className="eyebrow">Based in</h2>
                <p className="mt-3 text-lg">{settings.about.location}</p>
              </div>
            )}
          </aside>
        )}
      </div>
    </>
  );
}
