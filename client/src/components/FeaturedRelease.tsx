import { Link } from 'react-router';
import type { ReleaseSummary } from '@aaroh/shared';
import { formatDate } from '../lib/format';
import { LiteYouTube } from './LiteYouTube';
import { Reveal } from './Reveal';

export function FeaturedRelease({ release }: { release: ReleaseSummary }) {
  return (
    <section aria-labelledby="featured-title" className="wrap">
      <Reveal>
        <div className="mb-6 flex items-baseline justify-between gap-4 border-t border-line pt-5 md:mb-10">
          <p className="eyebrow">Latest release</p>
          <Link to="/work" className="link text-sm">
            All work
          </Link>
        </div>
      </Reveal>

      <Reveal>
        <LiteYouTube
          videoId={release.youtubeId}
          title={release.title}
          poster={release.coverImage}
        />
      </Reveal>

      <Reveal className="mt-6 md:mt-10">
        <h2 id="featured-title" className="font-display text-display-lg font-semibold">
          <Link
            to={`/work/${release.slug}`}
            className="transition-colors duration-200 hover:text-accent"
          >
            {release.title}
          </Link>
        </h2>
        <div className="mt-4 grid gap-6 md:mt-6 md:grid-cols-12">
          <p className="text-lg md:col-span-6">
            {release.artist}
            <span className="text-muted"> · {formatDate(release.releaseDate)}</span>
          </p>
          <div className="md:col-span-6">
            {release.summary && <p className="text-lg text-muted">{release.summary}</p>}
            <Link
              to={`/work/${release.slug}`}
              className="group mt-6 inline-flex items-center gap-2 text-lg font-medium"
            >
              <span className="link">The story, credits and stills</span>
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
