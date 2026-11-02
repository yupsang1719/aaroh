import { staticPageMeta } from '@aaroh/shared/seo';
import { Seo } from '../components/Seo';
import { PageHeader } from '../components/PageHeader';
import { PageError, PageLoading } from '../components/PageStatus';
import { Img } from '../components/Img';
import { Reveal } from '../components/Reveal';
import { cn } from '../lib/cn';
import { useSettings } from '../lib/useApi';

const number = (i: number) => String(i + 1).padStart(2, '0');

export default function ProcessPage() {
  const settings = useSettings();
  const steps = settings.data?.processSteps ?? [];

  return (
    <>
      <Seo meta={staticPageMeta('process')} />
      <PageHeader title="Process" intro="From a single note to the finished film." />

      {settings.status === 'loading' && <PageLoading />}
      {settings.status === 'error' && <PageError error={settings.error} />}

      {steps.length > 0 && (
        <>
          {/* The whole journey at a glance; the detail follows below. */}
          <div className="wrap" aria-hidden="true">
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-display text-display-sm font-medium text-muted">
              {steps.map((step, i) => (
                <span key={step.title} className="flex items-baseline gap-3">
                  <span className="text-fg">{step.title}</span>
                  {i < steps.length - 1 && <span className="text-leaf">→</span>}
                </span>
              ))}
            </p>
          </div>

          <ol className="wrap mt-16 md:mt-28">
            {steps.map((step, i) => (
              <li key={step.title}>
                <Reveal className="grid gap-6 pb-10 md:grid-cols-12 md:gap-10 md:pb-16">
                  {/* Hairline that draws in as the step scrolls into view. */}
                  <div aria-hidden="true" className="draw h-px bg-fg/25 md:col-span-12" />
                  <p className="font-serif text-serif-md italic leading-none text-leaf md:col-span-2 md:pt-2">
                    {number(i)}
                  </p>
                  <div className={cn(step.imageUrl ? 'md:col-span-4' : 'md:col-span-6')}>
                    <h2 className="font-display text-display-md font-semibold">{step.title}</h2>
                    {step.text && <p className="mt-4 text-lg text-muted">{step.text}</p>}
                  </div>
                  {step.imageUrl && (
                    <div className="overflow-hidden bg-leaf-tint md:col-span-6">
                      <Img
                        src={step.imageUrl}
                        alt={step.imageAlt ?? ''}
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="aspect-[3/2] w-full object-cover"
                      />
                    </div>
                  )}
                </Reveal>
              </li>
            ))}
          </ol>
        </>
      )}
    </>
  );
}
