import { staticPageMeta } from '@aaroh/shared/seo';
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

      {featured && <FeaturedRelease release={featured} />}
    </>
  );
}
