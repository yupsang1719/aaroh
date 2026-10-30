import { useEffect, useRef, useState } from 'react';
import type { SiteSettings } from '@aaroh/shared';
import { cn } from '../lib/cn';
import { useReducedMotion } from '../lib/useReducedMotion';
import { Img } from './Img';
import { Logo } from './Logo';

// Hand-placed collage positions (mobile: 6×8 grid, desktop: 12×8 grid). Up to six images;
// the gaps between them are deliberate. Classes are written out in full for Tailwind.
const PLACEMENTS = [
  'col-start-1 col-span-4 row-start-1 row-span-3 md:col-start-1 md:col-span-4 md:row-start-2 md:row-span-4',
  'col-start-5 col-span-2 row-start-2 row-span-3 md:col-start-6 md:col-span-2 md:row-start-1 md:row-span-3',
  'col-start-2 col-span-3 row-start-4 row-span-3 md:col-start-9 md:col-span-4 md:row-start-1 md:row-span-3',
  'col-start-5 col-span-2 row-start-5 row-span-2 md:col-start-5 md:col-span-4 md:row-start-5 md:row-span-4',
  'col-start-1 col-span-3 row-start-7 row-span-2 md:col-start-10 md:col-span-3 md:row-start-5 md:row-span-3',
  'col-start-4 col-span-3 row-start-7 row-span-2 md:col-start-2 md:col-span-2 md:row-start-7 md:row-span-2',
];

/**
 * The wordmark over the hero. `mix-blend-difference` keeps it legible over any image.
 * `stacked`: on phones it sits above the collage instead, where small overlaid type gets lost.
 */
function Wordmark({ stacked = false }: { stacked?: boolean }) {
  return (
    <h1
      className={cn(
        'pointer-events-none z-10 flex',
        stacked
          ? 'mb-4 md:absolute md:inset-0 md:mb-0 md:items-center md:justify-center md:text-bg md:mix-blend-difference'
          : 'absolute inset-0 items-center justify-center text-bg mix-blend-difference',
      )}
    >
      <Logo className={stacked ? 'text-[28vw] md:text-display-xl' : 'text-display-xl'} />
    </h1>
  );
}

function Collage({ images }: { images: SiteSettings['hero']['collageImages'] }) {
  return (
    <div className="wrap relative">
      <Wordmark stacked />
      <ul className="grid aspect-[3/4] grid-cols-6 grid-rows-8 gap-2 sm:aspect-[4/3] md:aspect-auto md:h-[min(86vh,940px)] md:grid-cols-12 md:gap-4">
        {images.slice(0, PLACEMENTS.length).map((image, i) => (
          <li
            key={image.url}
            className={cn('group relative animate-rise overflow-hidden bg-line', PLACEMENTS[i])}
            style={{ animationDelay: `${120 + i * 90}ms` }}
          >
            <Img
              src={image.url}
              alt={image.alt}
              priority={i < 2}
              sizes="(min-width: 768px) 33vw, 66vw"
              className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function HeroVideo({ src, poster }: { src: string; poster?: string }) {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  // Autoplay (muted, looping) unless the visitor prefers reduced motion.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduced) video.pause();
    else video.play().catch(() => {});
  }, [reduced]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  return (
    <div className="wrap relative">
      <div className="relative aspect-[4/5] overflow-hidden bg-fg sm:aspect-video md:aspect-auto md:h-[min(86vh,940px)]">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload={reduced ? 'none' : 'metadata'}
          aria-hidden="true"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        <Wordmark />
        {/* Moving content needs a way to stop it (WCAG 2.2.2). */}
        <button
          type="button"
          onClick={toggle}
          className="absolute bottom-4 right-4 z-20 rounded-full bg-bg/90 px-4 py-2 text-sm font-medium text-fg"
        >
          {playing ? 'Pause' : 'Play'} background video
        </button>
      </div>
    </div>
  );
}

export function Hero({ hero }: { hero: SiteSettings['hero'] }) {
  if (hero.mode === 'video' && hero.videoUrl) {
    return <HeroVideo src={hero.videoUrl} poster={hero.posterUrl} />;
  }
  return <Collage images={hero.collageImages} />;
}

/** Reserves the hero's space while settings load, so nothing jumps. */
export function HeroPlaceholder() {
  return (
    <div className="wrap relative">
      <Wordmark stacked />
      <div className="aspect-[3/4] sm:aspect-[4/3] md:aspect-auto md:h-[min(86vh,940px)]" />
    </div>
  );
}
