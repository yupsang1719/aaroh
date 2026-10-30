import { useState } from 'react';
import type { Image } from '@aaroh/shared';
import { Img } from './Img';
import { Lightbox } from './Lightbox';
import { Reveal } from './Reveal';

/** Masonry-style gallery of stills; each opens in the lightbox. */
export function Gallery({ images, title }: { images: Image[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  if (images.length === 0) return null;

  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 md:gap-6 lg:columns-3">
        {images.map((image, i) => (
          <li key={image.url} className="mb-4 break-inside-avoid md:mb-6">
            <Reveal delay={(i % 3) * 80}>
              <figure>
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="group block w-full overflow-hidden"
                >
                  <Img
                    src={image.url}
                    alt={image.alt}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <span className="sr-only">Open larger</span>
                </button>
                {image.caption && (
                  <figcaption className="mt-2 text-sm text-muted">{image.caption}</figcaption>
                )}
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
      <Lightbox images={images} index={open} onChange={setOpen} label={`${title}: gallery`} />
    </>
  );
}
