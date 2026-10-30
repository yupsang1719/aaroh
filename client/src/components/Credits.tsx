import type { Credit } from '@aaroh/shared';

export function Credits({ credits }: { credits: Credit[] }) {
  if (credits.length === 0) return null;
  return (
    <dl className="divide-y divide-line border-y border-line">
      {credits.map((c, i) => (
        <div
          key={`${c.role}-${i}`}
          className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 py-3"
        >
          <dt className="text-sm text-muted">{c.role}</dt>
          <dd className="text-sm font-medium">{c.name}</dd>
        </div>
      ))}
    </dl>
  );
}
