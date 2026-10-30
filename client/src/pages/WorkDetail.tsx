import { Link, useParams } from 'react-router';
import type { ReleaseDetail, ReleaseLink } from '@aaroh/shared';
import { releaseJsonLd, releaseMeta } from '@aaroh/shared/seo';
import { Seo } from '../components/Seo';
import { PageError, PageLoading } from '../components/PageStatus';
import { LiteYouTube } from '../components/LiteYouTube';
import { StreamingLinks } from '../components/StreamingLinks';
import { Credits } from '../components/Credits';
import { Gallery } from '../components/Gallery';
import { Reveal } from '../components/Reveal';
import { formatDate, paragraphs } from '../lib/format';
import { SITE_URL } from '../lib/site';
import { useRelease } from '../lib/useApi';

export default function WorkDetailPage() {
  const { slug = '' } = useParams();
  const release = useRelease(slug);

  if (release.status === 'loading') return <PageLoading />;
  if (release.status === 'error') return <PageError error={release.error} />;
  return <Release release={release.data} />;
}

function Release({ release }: { release: ReleaseDetail }) {
  const hasListen =
    release.streamingLinks.spotify ||
    release.streamingLinks.appleMusic ||
    release.streamingLinks.youtubeMusic ||
    release.streamingLinks.other.length > 0;

  return (
    <article>
      <Seo meta={releaseMeta(release)} jsonLd={releaseJsonLd(SITE_URL, release)} />

      <header className="wrap pb-10 pt-10 md:pb-16 md:pt-20">
        <p className="eyebrow">
          <Link to="/work" className="hover:text-fg">
            Work
          </Link>{' '}
          / {formatDate(release.releaseDate)}
        </p>
        <h1 className="mt-4 font-display text-display-lg font-semibold">{release.title}</h1>
        <p className="mt-4 text-xl md:text-2xl">{release.artist}</p>
        {release.summary && (
          <p className="mt-6 max-w-2xl text-lg text-muted md:text-xl">{release.summary}</p>
        )}
      </header>

      <div className="wrap">
        <LiteYouTube
          videoId={release.youtubeId}
          title={`${release.title} — ${release.artist} (music video)`}
          poster={release.coverImage}
          priority
        />
      </div>

      <div className="wrap mt-16 grid gap-16 md:mt-24 lg:grid-cols-12 lg:gap-10">
        {release.story && (
          <Reveal as="section" aria-labelledby="story" className="lg:col-span-7">
            <h2 id="story" className="eyebrow">
              The story
            </h2>
            <div className="mt-6 space-y-6 text-lg leading-relaxed md:text-xl md:leading-relaxed">
              {paragraphs(release.story).map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
        )}

        <div className="space-y-14 lg:col-span-4 lg:col-start-9">
          {hasListen && (
            <Reveal as="section" aria-labelledby="listen">
              <h2 id="listen" className="eyebrow">
                Listen
              </h2>
              <div className="mt-5">
                <StreamingLinks links={release.streamingLinks} />
              </div>
            </Reveal>
          )}
          {release.credits.length > 0 && (
            <Reveal as="section" aria-labelledby="credits">
              <h2 id="credits" className="eyebrow">
                Credits
              </h2>
              <div className="mt-5">
                <Credits credits={release.credits} />
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {release.stills.length > 0 && (
        <section aria-labelledby="stills" className="wrap mt-20 md:mt-32">
          <h2 id="stills" className="eyebrow mb-6 md:mb-10">
            Stills and behind the scenes
          </h2>
          <Gallery images={release.stills} title={release.title} />
        </section>
      )}

      <ReleaseNav previous={release.previous} next={release.next} />
    </article>
  );
}

function ReleaseNav({
  previous,
  next,
}: {
  previous: ReleaseLink | null;
  next: ReleaseLink | null;
}) {
  if (!previous && !next) return null;
  return (
    <nav aria-label="More releases" className="wrap mt-20 md:mt-32">
      <ul className="grid border-t border-line sm:grid-cols-2">
        {/* An empty "previous" slot keeps "next" on the right on wider screens only. */}
        <li
          className={
            previous ? 'border-b border-line sm:border-b-0 sm:border-r' : 'hidden sm:block'
          }
        >
          {previous && (
            <Link to={`/work/${previous.slug}`} className="group block py-8 sm:pr-8">
              <span className="eyebrow">← Previous</span>
              <span className="mt-2 block font-display text-display-sm font-semibold transition-colors duration-200 group-hover:text-accent">
                {previous.title}
              </span>
            </Link>
          )}
        </li>
        <li>
          {next && (
            <Link to={`/work/${next.slug}`} className="group block py-8 text-right sm:pl-8">
              <span className="eyebrow">Next →</span>
              <span className="mt-2 block font-display text-display-sm font-semibold transition-colors duration-200 group-hover:text-accent">
                {next.title}
              </span>
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
