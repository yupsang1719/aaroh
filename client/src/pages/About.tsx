import { staticPageMeta } from '@aaroh/shared/seo';
import { Seo } from '../components/Seo';
import { PageHeader } from '../components/PageHeader';
import { PageError, PageLoading } from '../components/PageStatus';
import { Img } from '../components/Img';
import { Reveal } from '../components/Reveal';
import { paragraphs } from '../lib/format';
import { useSettings } from '../lib/useApi';

export default function AboutPage() {
  const settings = useSettings();
  const about = settings.data?.about;
  const team = settings.data?.team ?? [];

  return (
    <>
      <Seo meta={staticPageMeta('about', settings.data)} />
      <PageHeader title="About" />

      {settings.status === 'loading' && <PageLoading />}
      {settings.status === 'error' && <PageError error={settings.error} />}

      {about && (
        <div className="wrap">
          {about.intro && (
            <p className="max-w-5xl font-display text-display-md font-medium">{about.intro}</p>
          )}

          <div className="mt-16 grid gap-12 md:mt-28 lg:grid-cols-12 lg:gap-10">
            {about.story && (
              <Reveal as="section" aria-labelledby="why" className="lg:col-span-7">
                <h2 id="why" className="eyebrow">
                  Why we started
                </h2>
                <div className="mt-6 space-y-6 text-lg leading-relaxed md:text-xl md:leading-relaxed">
                  {paragraphs(about.story).map((p, i) => (
                    <p key={i} className="whitespace-pre-line">
                      {p}
                    </p>
                  ))}
                </div>
              </Reveal>
            )}
            {about.location && (
              <Reveal as="section" aria-labelledby="where" className="lg:col-span-4 lg:col-start-9">
                <h2 id="where" className="eyebrow">
                  Where we are
                </h2>
                <p className="mt-6 font-display text-display-sm font-medium">{about.location}</p>
              </Reveal>
            )}
          </div>
        </div>
      )}

      {team.length > 0 && (
        <section aria-labelledby="team" className="wrap mt-20 md:mt-32">
          <h2 id="team" className="eyebrow border-t border-line pt-5">
            The team
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-12 md:gap-x-6 lg:grid-cols-4">
            {team.map((member, i) => (
              <li key={`${member.name}-${i}`}>
                <Reveal delay={(i % 4) * 80}>
                  <div className="overflow-hidden bg-line">
                    {member.photoUrl ? (
                      <Img
                        src={member.photoUrl}
                        alt={`Photo of ${member.name}`}
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="aspect-[4/5] w-full object-cover"
                      />
                    ) : (
                      <div className="aspect-[4/5]" />
                    )}
                  </div>
                  <p className="mt-4 font-medium md:text-lg">{member.name}</p>
                  <p className="text-sm text-muted md:text-base">{member.role}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
