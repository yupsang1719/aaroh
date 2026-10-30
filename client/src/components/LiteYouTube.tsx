import { useRef, useState } from 'react';
import type { Image } from '@aaroh/shared';
import { Link } from 'react-router';
import { Img } from './Img';

interface LiteYouTubeProps {
  videoId: string;
  title: string;
  /** Our own still, shown until the visitor presses play. No YouTube requests before then. */
  poster: Image;
  priority?: boolean;
  className?: string;
}

const EMBED_ORIGIN = 'https://www.youtube-nocookie.com';

/**
 * Click-to-load YouTube player. Shows a poster and a play button; the YouTube iframe
 * (and its ~1 MB of scripts) only loads after a click.
 */
export function LiteYouTube({ videoId, title, poster, priority, className }: LiteYouTubeProps) {
  const [active, setActive] = useState(false);
  const preconnected = useRef(false);

  // Warm up the connection when the visitor shows intent, so playback starts faster.
  const warm = () => {
    if (preconnected.current) return;
    preconnected.current = true;
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = EMBED_ORIGIN;
    document.head.append(link);
  };

  return (
    <div className={className}>
      <div className="relative aspect-video overflow-hidden bg-fg">
        {active ? (
          <iframe
            // Focus moves into the player so keyboard users can control it straight away.
            ref={(el) => el?.focus()}
            className="absolute inset-0 h-full w-full"
            src={`${EMBED_ORIGIN}/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            onPointerEnter={warm}
            onFocus={warm}
            className="group absolute inset-0 h-full w-full"
          >
            <Img
              src={poster.url}
              alt=""
              priority={priority}
              sizes="(min-width: 1680px) 1600px, 100vw"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
            <span className="absolute inset-0 bg-fg/10 transition-colors duration-300 group-hover:bg-fg/20" />
            <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-full bg-bg py-3 pl-4 pr-6 text-sm font-medium text-fg shadow-sm transition-transform duration-300 group-hover:scale-105 md:py-4 md:pl-5 md:pr-7 md:text-base">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                <path d="M7 4.5v15l13-7.5z" />
              </svg>
              <span>
                Play <span className="sr-only">video: {title}</span>
              </span>
            </span>
          </button>
        )}
      </div>
      {!active && (
        // Pressing play connects to YouTube, which may set cookies (see the privacy notice).
        <p className="mt-2 text-xs text-muted">
          Plays from YouTube in privacy-enhanced mode. YouTube may set cookies once you press play.{' '}
          <Link to="/privacy" className="link">
            Privacy
          </Link>
        </p>
      )}
    </div>
  );
}
