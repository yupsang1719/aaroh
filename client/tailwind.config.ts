import type { Config } from 'tailwindcss';

/**
 * Brand tokens. Change colours and fonts here and the whole site follows.
 * Components should only ever use these names (bg, fg, muted, line, accent, display, body).
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F6F4EF', // off-white ground
        fg: '#111111', // near-black text
        muted: '#5C5A55', // secondary text (AA on bg)
        line: '#DDD9D0', // hairlines and borders
        accent: '#C2410C', // single accent (AA on bg for text)
      },
      fontFamily: {
        display: ['"Inter Tight Variable"', '"Inter Tight"', 'system-ui', 'sans-serif'],
        body: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        display: '-0.035em',
      },
      // Fluid display sizes: huge on desktop, still confident at 375px.
      fontSize: {
        'display-xl': ['clamp(4rem, 17vw, 15rem)', { lineHeight: '0.82', letterSpacing: '-0.05em' }],
        'display-lg': ['clamp(2.75rem, 8vw, 7.5rem)', { lineHeight: '0.9', letterSpacing: '-0.04em' }],
        'display-md': ['clamp(2rem, 4.5vw, 4rem)', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'display-sm': ['clamp(1.5rem, 2.6vw, 2.25rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      maxWidth: {
        site: '1680px',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
