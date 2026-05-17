/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  corePlugins: {
    preflight: false,
  },
  content: [
    './index.md',
    './start/**/*.md',
    './guide/**/*.md',
    './architecture/**/*.md',
    './other/**/*.md',
    './.vitepress/**/*.{vue,ts,mts,js}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#8052e4',
          muted: '#5c2ead',
        },
        surface: {
          0: 'var(--ea-bg)',
          1: 'var(--ea-bg-elevated)',
          2: 'var(--ea-surface-2)',
          3: 'var(--ea-bg-soft)',
        },
        fg: {
          DEFAULT: 'var(--ea-fg)',
          muted: 'var(--ea-fg-muted)',
          subtle: 'var(--ea-fg-subtle)',
          faint: 'var(--ea-fg-faint)',
        },
      },
      fontFamily: {
        sans: [
          'InterVariable',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        400: '400ms',
        600: '600ms',
        900: '900ms',
        1200: '1200ms',
      },
      maxWidth: {
        content: '1400px',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(var(--ea-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--ea-grid-line) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '64px 64px',
      },
    },
  },
  plugins: [],
}
