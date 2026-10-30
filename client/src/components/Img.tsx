import type { ImgHTMLAttributes } from 'react';
import { imageSrcSet } from '../lib/images';

type ImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  src: string;
  alt: string;
  /** Above-the-fold images: load immediately and at high priority. */
  priority?: boolean;
};

/** Image with lazy loading and async decoding by default. */
export function Img({ src, alt, priority, sizes = '100vw', ...rest }: ImgProps) {
  const srcSet = imageSrcSet(src);
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'auto' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      {...rest}
    />
  );
}
