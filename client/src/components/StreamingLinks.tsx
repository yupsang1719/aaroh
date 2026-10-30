import type { StreamingLinks as Links } from '@aaroh/shared';

const SERVICES = [
  ['spotify', 'Spotify'],
  ['appleMusic', 'Apple Music'],
  ['youtubeMusic', 'YouTube Music'],
] as const;

/** Listen links. Only services that have a link are shown. */
export function StreamingLinks({ links }: { links: Links }) {
  const items = [
    ...SERVICES.flatMap(([key, label]) => (links[key] ? [{ label, url: links[key] }] : [])),
    ...links.other,
  ];
  if (items.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item.url}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 rounded-full border border-fg/20 px-4 py-2 text-sm font-medium transition-colors duration-200 hover:border-fg hover:bg-fg hover:text-bg"
          >
            {item.label}
            <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
