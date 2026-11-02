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
        // Taken from the brand reference (public/brand/ref.jpeg): cream paper, deep teal
        // wordmark ink, antique gold and a sunset peach.
        bg: '#F6EFE2', // cream paper ground
        fg: '#0B2626', // deep teal ink, the wordmark colour (13.9:1 on bg)
        muted: '#4B5C59', // secondary text, teal grey (6.2:1 on bg)
        line: '#E0D5C1', // hairlines and borders
        accent: '#7E5B25', // antique gold, deepened for text: links, highlights (5.4:1 on bg)
        ink: '#0B2626', // dark sections: deep teal
        'ink-fg': '#F6EFE2', // text on ink (13.9:1)
        'ink-muted': '#A7B4AE', // secondary text on ink (7.4:1)
        'ink-line': '#1F3B3A', // hairlines on ink
        gold: '#CFA35E', // bright antique gold, on ink only (6.9:1)
        sunset: '#F6CD97', // sunset peach: decorative glows on ink (10.7:1)
        // Leaf green from the reference's foliage: the calm, secondary colour. Gold marks
        // what you can act on; green sets a quieter mood (numbers, ornaments, surfaces).
        leaf: '#46645D', // sage leaf, text and ornaments on bg (5.7:1)
        'leaf-tint': '#E2E8E0', // pale sage surface: image wells, soft bands (fg 12.8:1)
        'leaf-light': '#8FB3A4', // light leaf, on ink only (6.9:1)
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
