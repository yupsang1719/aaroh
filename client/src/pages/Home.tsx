import { staticPageMeta } from '@aaroh/shared/seo';
import { Link } from 'react-router';
import { Seo } from '../components/Seo';
import { Hero, HeroPlaceholder } from '../components/Hero';
import { FeaturedRelease } from '../components/FeaturedRelease';
import { Reveal } from '../components/Reveal';
import { useReleases, useSettings } from '../lib/useApi';

export default function HomePage() {
  const settings = useSettings();
  const releases = useReleases();
  const featured = releases.data?.find((r) => r.featured) ?? releases.data?.[0];

  return (
    <>
      <Seo meta={staticPageMeta('home', settings.data)} />

      {settings.data ? <Hero hero={settings.data.hero} /> : <HeroPlaceholder />}

      {settings.data?.tagline && (
        <Reveal className="wrap py-16 md:py-28">
          <p className="max-w-5xl font-display text-display-md font-medium">
            {settings.data.tagline}
          </p>
        </Reveal>
      )}

      {featured ? (
        <FeaturedRelease release={featured} />
      ) : (
        // Before the first release: a short introduction that leads into the site.
        settings.data?.about.intro && (
          <Reveal className="wrap">
            <div className="grid gap-8 border-t border-line pt-8 md:grid-cols-12 md:pt-10">
              <p className="text-lg text-muted md:col-span-7 md:text-xl">
                {settings.data.about.intro}
              </p>
              <ul className="flex flex-wrap gap-x-8 gap-y-3 text-lg font-medium md:col-span-4 md:col-start-9 md:flex-col">
                {[
                  { to: '/about', label: 'About us' },
                  { to: '/process', label: 'How we work' },
                  { to: '/contact', label: 'Get in touch' },
                ].map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="group inline-flex items-center gap-2">
                      <span className="link">{item.label}</span>
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )
      )}
    </>
  );
}
