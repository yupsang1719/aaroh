import { cn } from '../lib/cn';
import { SITE_NAME } from '../lib/site';

/**
 * Renders /brand/logo.svg when it exists (detected at build time, see vite.config.ts),
 * otherwise the "Aaroh" wordmark in the display font. Size it with a text-* class:
 * the SVG is drawn 1em tall so both versions take the same space.
 */
export function Logo({ className }: { className?: string }) {
  if (__HAS_LOGO__) {
    return (
      <img
        src="/brand/logo.svg"
        alt={SITE_NAME}
        className={cn('inline-block h-[1em] w-auto', className)}
      />
    );
  }
  return (
    <span className={cn('font-display font-semibold leading-none tracking-display', className)}>
      {SITE_NAME}
    </span>
  );
}
