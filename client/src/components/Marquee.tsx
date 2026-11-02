/**
 * A slow, continuous band of words. Decorative (hidden from screen readers), pauses on hover
 * and stands still with reduced motion. The list is rendered twice for a seamless loop.
 */
export function Marquee({ items }: { items: string[] }) {
  const row = (copy: number) => (
    <ul className="flex shrink-0 items-center" aria-hidden={copy > 0 || undefined}>
      {items.map((item) => (
        <li key={`${copy}-${item}`} className="flex items-center">
          <span className="whitespace-nowrap px-6 font-serif text-serif-md italic md:px-10">
            {item}
          </span>
          <span className="text-leaf">✦</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div aria-hidden="true" className="overflow-hidden border-y border-line py-6 md:py-8">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {row(0)}
        {row(1)}
      </div>
    </div>
  );
}
