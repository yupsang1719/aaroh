import { Link } from 'react-router';
import { staticPageMeta } from '@aaroh/shared/seo';
import { Seo } from '../components/Seo';
import { PageHeader } from '../components/PageHeader';
import { PageError, PageLoading } from '../components/PageStatus';
import { Prose } from '../components/Prose';
import { formatDate } from '../lib/format';
import { useSettings } from '../lib/useApi';

/**
 * Privacy and cookies notice (UK GDPR, Data Protection Act 2018, PECR). It describes what this
 * website actually does; update it if that changes (e.g. adding analytics, a newsletter or a shop).
 */
export default function PrivacyPage() {
  const settings = useSettings();
  const s = settings.data;

  return (
    <>
      <Seo meta={staticPageMeta('privacy')} />
      <PageHeader title="Privacy and cookies" />
      {settings.status === 'loading' && <PageLoading />}
      {settings.status === 'error' && <PageError error={settings.error} />}

      {s && (
        <div className="wrap">
          <Prose>
            <p className="text-muted">Last updated {formatDate(s.legal.privacyUpdated)}</p>

            <p>
              This notice explains what personal information {s.legal.companyName} collects through
              this website, why, and the rights you have. In short: we do not use analytics,
              advertising or tracking cookies, and the only personal information we ask for is what
              you choose to send us through the contact form.
            </p>

            <h2>Who we are</h2>
            <p>
              {s.legal.companyName} (trading as {s.companyName}) is the controller of the personal
              information described here. We are a company registered in {s.legal.registeredIn},
              company number {s.legal.companyNumber}, with our registered office at{' '}
              {s.legal.registeredOffice.split('\n').join(', ')}. You can contact us about privacy at{' '}
              <a href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a>.
            </p>

            <h2>When you contact us</h2>
            <p>
              If you use our <Link to="/contact">contact form</Link> or email us, we receive your
              name, email address, the subject you choose, your message and anything else you
              include.
            </p>
            <ul>
              <li>
                <strong>Why:</strong> to read and reply to your message and, if it leads somewhere,
                to work with you.
              </li>
              <li>
                <strong>Lawful basis:</strong> our legitimate interests in responding to people who
                contact us, or taking steps at your request before entering into a contract with
                you.
              </li>
              <li>
                <strong>How:</strong> the form sends your message to our inbox by email
                {s.legal.emailProvider ? (
                  <> (our email is provided by {s.legal.emailProvider})</>
                ) : null}
                . This website does not store it in a database.
              </li>
              <li>
                <strong>How long:</strong> we keep correspondence for as long as we need it to deal
                with your enquiry and keep a record of our working relationships, normally no more
                than two years after our last contact, unless the law requires us to keep it longer.
              </li>
            </ul>

            <h2>When you visit this website</h2>
            <p>
              Like any website, this one needs your device&apos;s IP address and some technical
              information (browser type, the page requested, the time) to deliver pages to you. Our
              hosting provider
              {s.legal.hostingProvider ? <>, {s.legal.hostingProvider},</> : null} processes this on
              our behalf and may keep it in short-lived server logs for security and to fix
              problems. To stop the contact form being abused, our server also keeps a count of
              recent messages per IP address in memory for up to 15 minutes; it is never written to
              disk. Our lawful basis is our legitimate interest in running a secure, working
              website.
            </p>
            <p>We do not use analytics, advertising or any other tracking.</p>

            <h2>Cookies and similar technologies</h2>
            <p>
              This website does not set any cookies. It uses your browser&apos;s session storage to
              remember where you were on a page when you go back; this is needed for the site to
              work as you would expect, contains nothing about you and is deleted when you close the
              tab. Fonts are served from our own server, not a third party.
            </p>
            <h3>Videos</h3>
            <p>
              Music videos are hosted on YouTube. Nothing is loaded from YouTube until you press
              play. When you do, the video plays in YouTube&apos;s privacy-enhanced mode
              (youtube-nocookie.com), and YouTube (Google) may then set cookies or use similar
              technology on your device and receive information about your viewing. See{' '}
              <a href="https://policies.google.com/privacy" rel="noopener" target="_blank">
                Google&apos;s privacy policy
              </a>
              .
            </p>
            <h3>Links to other websites</h3>
            <p>
              Links to streaming services and social networks take you to websites we do not
              control. Their own privacy policies apply.
            </p>

            <h2>Who we share it with</h2>
            <p>
              We only share personal information with service providers who help us run this website
              and our email, and who act on our instructions, or where the law requires it. We never
              sell personal information.
            </p>
            <p>
              Some of these providers may process information outside the UK. Where they do, we make
              sure it is protected, for example by relying on UK adequacy regulations or the UK
              International Data Transfer Agreement or Addendum.
            </p>

            <h2>Your rights</h2>
            <p>Under UK data protection law you have the right to:</p>
            <ul>
              <li>ask for a copy of the personal information we hold about you;</li>
              <li>ask us to correct information that is wrong or incomplete;</li>
              <li>ask us to delete it;</li>
              <li>ask us to restrict how we use it, or object to our using it;</li>
              <li>ask us to transfer it to you or someone else, where that applies.</li>
            </ul>
            <p>
              To use any of these rights, email{' '}
              <a href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a>. There is no charge, and we
              will reply within one month.
            </p>

            <h2>Complaints</h2>
            <p>
              If you are unhappy with how we have handled your information, please tell us first so
              we can try to put it right. You can also complain to the Information
              Commissioner&apos;s Office (ICO) at{' '}
              <a href="https://ico.org.uk/make-a-complaint/" rel="noopener" target="_blank">
                ico.org.uk/make-a-complaint
              </a>{' '}
              or on 0303 123 1113.
            </p>

            <h2>Changes to this notice</h2>
            <p>
              We will update this notice if how we use personal information changes. The date at the
              top shows when it was last revised.
            </p>
          </Prose>
        </div>
      )}
    </>
  );
}
