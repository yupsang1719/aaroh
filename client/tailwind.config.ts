import type { Config } from 'tailwindcss';

/**
 * Brand tokens. Change colours, fonts and motion here and the whole site follows.
 * Light areas use bg/fg/muted/line/accent; dark "ink" areas (home hero, footer) use
 * ink/ink-fg/ink-muted/ink-line/gold. All text pairs meet WCAG AA contrast.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F4EFE6', // warm ivory ground
        fg: '#16130F', // warm near-black text (16:1 on bg)
        muted: '#5D574F', // secondary text (6.2:1 on bg)
        line: '#DDD5C8', // hairlines and borders
        accent: '#B83F12', // ember: links, highlights (4.9:1 on bg)
        ink: '#14110E', // dark sections
        'ink-fg': '#F4EFE6', // text on ink (16:1)
        'ink-muted': '#A8A095', // secondary text on ink (7.3:1)
        'ink-line': '#2E2924', // hairlines on ink
        gold: '#E0A84B', // saffron gold, on ink only (8.8:1)
      },
      fontFamily: {
        display: ['"Inter Tight Variable"', '"Inter Tight"', 'system-ui', 'sans-serif'],
        body: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        // Editorial accent: taglines, intros, numbers. Use sparingly.
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        display: '-0.035em',
      },
      // Fluid display sizes: huge on desktop, still confident at 375px.
      fontSize: {
        'display-xl': [
          'clamp(4rem, 17vw, 15rem)',
          { lineHeight: '0.82', letterSpacing: '-0.05em' },
        ],
        'display-lg': [
          'clamp(2.75rem, 8vw, 7.5rem)',
          { lineHeight: '0.9', letterSpacing: '-0.04em' },
        ],
        'display-md': ['clamp(2rem, 4.5vw, 4rem)', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'display-sm': [
          'clamp(1.5rem, 2.6vw, 2.25rem)',
          { lineHeight: '1.1', letterSpacing: '-0.02em' },
        ],
        // Serif sizes run larger: the face is light and narrow.
        'serif-lg': [
          'clamp(2.25rem, 5.2vw, 4.75rem)',
          { lineHeight: '1.02', letterSpacing: '-0.01em' },
        ],
        'serif-md': ['clamp(1.75rem, 3.4vw, 3rem)', { lineHeight: '1.08' }],
      },
      maxWidth: {
        site: '1680px',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      // Every animation is switched off for prefers-reduced-motion (see index.css).
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'none' },
        },
        // Page change: a short fade and lift.
        enter: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'none' },
        },
        // Slow wandering glow behind the hero.
        drift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '33%': { transform: 'translate3d(6%, -4%, 0) scale(1.08)' },
          '66%': { transform: 'translate3d(-5%, 5%, 0) scale(0.96)' },
        },
        // The "rising scale" bars: each breathes up and down like a level meter.
        meter: {
          '0%, 100%': { transform: 'scaleY(var(--meter-low, 0.35))' },
          '50%': { transform: 'scaleY(1)' },
        },
        marquee: {
          from: { transform: 'translate3d(0, 0, 0)' },
          to: { transform: 'translate3d(-50%, 0, 0)' },
        },
      },
      animation: {
        rise: 'rise 900ms cubic-bezier(0.22, 1, 0.36, 1) both',
        enter: 'enter 500ms cubic-bezier(0.22, 1, 0.36, 1) both',
        drift: 'drift 22s ease-in-out infinite',
        meter: 'meter 2.6s ease-in-out infinite',
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
