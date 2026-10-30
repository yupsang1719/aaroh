import { cn } from '../lib/cn';

// Aaroh is the ascending scale of Indian classical music: Sa Re Ga Ma Pa Dha Ni.
const NOTES = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni'];

/**
 * Decorative brand motif: seven bars rising like the notes of the scale, gently breathing
 * like a level meter. With reduced motion they stand still as a rising staircase.
 */
export function RisingScale({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('flex items-end gap-2 md:gap-3', className)}>
      {NOTES.map((note, i) => (
        <div key={note} className="flex h-full flex-col items-center justify-end gap-2">
          <span
            className="block w-1.5 origin-bottom animate-meter rounded-full bg-gold md:w-2"
            style={{
              height: `${34 + i * 11}%`,
              animationDelay: `${i * 0.16}s`,
              // Each bar dips less as the scale rises.
              ['--meter-low' as string]: `${0.45 + i * 0.05}`,
            }}
          />
          <span className="hidden font-serif text-xs italic text-ink-muted md:block">{note}</span>
        </div>
      ))}
    </div>
  );
}
