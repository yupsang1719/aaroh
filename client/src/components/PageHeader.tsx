import type { ReactNode } from 'react';

/** Large page title used at the top of every inner page. */
export function PageHeader({ title, intro }: { title: string; intro?: ReactNode }) {
  return (
    <header className="wrap pb-12 pt-10 md:pb-20 md:pt-20">
      <h1 className="font-display text-display-lg font-semibold">{title}</h1>
      {intro && (
        <div className="mt-6 max-w-3xl text-balance font-serif text-2xl leading-snug text-muted md:text-[2rem]">
          {intro}
        </div>
      )}
    </header>
  );
}
