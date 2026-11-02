import { Link } from 'react-router';
import { staticPageMeta } from '@aaroh/shared/seo';
import { Seo } from '../components/Seo';
import { PageHeader } from '../components/PageHeader';
import { PageError, PageLoading } from '../components/PageStatus';
import { Img } from '../components/Img';
import { Reveal } from '../components/Reveal';
import { formatYear } from '../lib/format';
import { useReleases, useSettings } from '../lib/useApi';

export default function WorkPage() {
  const releases = useReleases();
  const settings = useSettings();

  return (
    <>
      <Seo meta={staticPageMeta('work')} />
      <PageHeader title="Work" intro="Each release is an original song and the film made for it." />

      {releases.status === 'loading' && <PageLoading />}
      {releases.status === 'error' && <PageError error={releases.error} />}
      {releases.data?.length === 0 && (
        <div className="wrap">
          <p className="border-t border-line pt-8 font-serif text-serif-lg italic text-muted">
            {settings.data?.workEmptyNote}
          </p>
        </div>
      )}
      {releases.data && releases.data.length > 0 && (
        <ol className="wrap space-y-20 md:space-y-32">
          {releases.data.map((release, i) => (
            <li key={release.slug}>
              <Reveal>
                <Link
                  to={`/work/${release.slug}`}
                  className="group grid gap-6 md:grid-cols-12 md:gap-10"
                >
                  <div className="overflow-hidden bg-leaf-tint md:col-span-7">
                    <Img
                      src={release.coverImage.url}
                      alt={release.coverImage.alt}
                      priority={i === 0}
                      sizes="(min-width: 768px) 58vw, 100vw"
                      className="aspect-video w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-col md:col-span-5">
                    <p className="eyebrow">
                      {String(i + 1).padStart(2, '0')} · {formatYear(release.releaseDate)}
                    </p>
                    <h2 className="mt-3 font-display text-display-md font-semibold transition-colors duration-200 group-hover:text-accent">
                      {release.title}
                    </h2>
                    <p className="mt-2 text-lg">{release.artist}</p>
                    {release.summary && <p className="mt-5 text-muted">{release.summary}</p>}
                    <span className="mt-6 inline-flex items-center gap-2 font-medium md:mt-auto md:pt-6">
                      View release
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
