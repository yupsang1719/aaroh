import { useEffect, useRef } from 'react';
import type { Image } from '@aaroh/shared';

interface LightboxProps {
  images: Image[];
  /** Index of the open image, or null when closed. */
  index: number | null;
  onChange: (index: number | null) => void;
  label: string;
}

/**
 * Full-screen image viewer built on the native <dialog>: the browser traps focus inside it
 * (starting on the Close button, the first control),
 * makes the page behind inert, closes it on Escape and returns focus to the opener.
 * Left/right arrow keys and swipes move between images.
 */
export function Lightbox({ images, index, onChange, label }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<number | null>(null);
  const open = index !== null;
  const image = open ? images[index] : undefined;
  const count = images.length;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const go = (step: number) => {
    if (index === null) return;
    onChange((index + step + count) % count);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      onClose={() => {
        document.documentElement.style.overflow = '';
        onChange(null);
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchStart.current;
        const end = e.changedTouches[0]?.clientX;
        if (start !== null && end !== undefined && Math.abs(end - start) > 50) {
          go(end < start ? 1 : -1);
        }
        touchStart.current = null;
      }}
      className="m-0 h-full max-h-none w-full max-w-none bg-fg p-0 text-bg backdrop:bg-fg/95"
    >
      {image && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-4 text-sm sm:px-8">
            <p aria-live="polite">
              {index! + 1} / {count}
            </p>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="-mr-2 px-2 py-2 font-medium"
            >
              Close
            </button>
          </div>

          <figure className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-5 pb-6 sm:px-20">
            <img
              key={image.url}
              src={image.url}
              alt={image.alt}
              className="min-h-0 max-w-full flex-1 animate-[rise_400ms_ease-out_both] object-contain"
            />
            {image.caption && (
              <figcaption className="max-w-2xl text-center text-sm text-bg/70">
                {image.caption}
              </figcaption>
            )}
          </figure>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-2 top-1/2 hidden -translate-y-1/2 p-4 text-2xl sm:block"
                aria-label="Previous image"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-2 top-1/2 hidden -translate-y-1/2 p-4 text-2xl sm:block"
                aria-label="Next image"
              >
                →
              </button>
            </>
          )}
        </div>
      )}
    </dialog>
  );
}
