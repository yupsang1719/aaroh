import type { Config } from 'tailwindcss';

/**
 * Brand tokens. Change colours, fonts and motion here and the whole site follows.
 * Light areas use bg/fg/muted/line/accent; dark "ink" areas (home hero, footer) use
 * ink/ink-fg/ink-muted/ink-line/gold/sunset/leaf-light. All text pairs meet WCAG AA contrast.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand colours from the logo pack (aaroh-logo/README.md): Ivory, Aaroh Teal, Swara
        // Gold and Light Gold, plus a sunset peach and leaf greens for mood.
        bg: '#F7F1E6', // Ivory
        fg: '#163A37', // Aaroh Teal (11:1 on bg)
        muted: '#4B5E5B', // secondary text, teal grey (6.1:1 on bg)
        line: '#E2D8C6', // hairlines and borders
        // Swara Gold (#B8893A) is too light for text on Ivory (2.8:1), so text uses this
        // deepened version: links, highlights (5.5:1 on bg).
        accent: '#7E5B25',
        ink: '#163A37', // dark sections: Aaroh Teal
        'ink-fg': '#F7F1E6', // text on ink (11:1)
        'ink-muted': '#A9BBB5', // secondary text on ink (6.2:1)
        'ink-line': '#2A504C', // hairlines on ink
        gold: '#D6AD5C', // Light Gold, on ink only (5.9:1)
        sunset: '#F6CD97', // sunset peach: decorative glows on ink (8.3:1)
        // Leaf green from the reference's foliage: the calm, secondary colour. Gold marks
        // what you can act on; green sets a quieter mood (numbers, ornaments, surfaces).
        leaf: '#46645D', // sage leaf, text and ornaments on bg (5.8:1)
        'leaf-tint': '#E2E8E0', // pale sage surface: image wells, soft bands (fg 9.9:1)
        'leaf-light': '#8FB3A4', // light leaf, on ink only (5.4:1)
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
        // The header icon playing the scale: each dot hops once, like a note being sung.
        swara: {
          '0%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-14px)' },
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
        swara: 'swara 420ms ease-in-out both',
      },
    },
  },
  plugins: [],
} satisfies Config;
