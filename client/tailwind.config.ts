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
    },
  },
  plugins: [],
} satisfies Config;
