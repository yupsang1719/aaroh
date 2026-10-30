import type { ReactNode } from 'react';

/** Long-form text (legal pages): readable measure, spaced headings and lists. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="[&_a]:link max-w-3xl space-y-5 text-lg leading-relaxed [&_h2]:pt-8 [&_h2]:font-display [&_h2]:text-display-sm [&_h2]:font-semibold [&_h3]:pt-2 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
      {children}
    </div>
  );
}
