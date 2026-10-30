import { Link } from 'react-router';
import { staticPageMeta } from '@aaroh/shared/seo';
import { Seo } from '../components/Seo';
import { PageHeader } from '../components/PageHeader';
import { PageError, PageLoading } from '../components/PageStatus';
import { CompanyDetails } from '../components/CompanyDetails';
import { Prose } from '../components/Prose';
import { useSettings } from '../lib/useApi';

export default function LegalPage() {
  const settings = useSettings();
  const s = settings.data;

  return (
    <>
      <Seo meta={staticPageMeta('legal')} />
      <PageHeader title="Company information" />
      {settings.status === 'loading' && <PageLoading />}
      {settings.status === 'error' && <PageError error={settings.error} />}

      {s && (
        <div className="wrap">
          <div className="max-w-3xl">
            <p className="text-lg">
              This website is run by {s.legal.companyName}, trading as {s.companyName}.
            </p>
            <div className="mt-10">
              <CompanyDetails legal={s.legal} />
            </div>
          </div>

          <div className="mt-16">
            <Prose>
              <h2>Contact</h2>
              <p>
                Email <a href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a> or use our{' '}
                <Link to="/contact">contact form</Link>.
              </p>

              <h2>Copyright</h2>
              <p>
                The music, videos, photographs, text and design on this website are ©{' '}
                {s.legal.companyName} or the artists and collaborators credited with them. Please do
                not reuse them without permission. For licensing,{' '}
                <Link to="/contact">get in touch</Link>.
              </p>

              <h2>Privacy</h2>
              <p>
                How we handle personal information and cookies is explained in our{' '}
                <Link to="/privacy">privacy and cookies notice</Link>.
              </p>
            </Prose>
          </div>
        </div>
      )}
    </>
  );
}
