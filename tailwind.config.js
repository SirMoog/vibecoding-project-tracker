/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
          accent: 'var(--brand-accent)',
          action: '#0057C2',
          link: 'var(--brand-link)',
          review: 'var(--brand-review)',
        },
        surface: {
          page: 'var(--surface-page)',
          panel: 'var(--surface-panel)',
          card: 'var(--surface-card)',
          selected: 'var(--surface-selected)',
        },
        border: { subtle: 'var(--border-subtle)' },
        ink: {
          primary: 'var(--ink-primary)',
          body: 'var(--ink-body)',
          muted: 'var(--ink-muted)',
        },
        type: { feature: 'var(--type-feature)', bug: 'var(--type-bug)' },
        due: {
          safe: 'var(--due-safe)',
          warning: 'var(--due-warning)',
          overdue: 'var(--type-bug)',
          neutral: 'var(--due-neutral)',
        },
        tint: {
          feature: 'var(--tint-feature)',
          bug: 'var(--tint-bug)',
          safe: 'var(--tint-safe)',
          warning: 'var(--tint-warning)',
          neutral: 'var(--tint-neutral)',
        },
        // Preserve the starter's shorthand utilities.
        feature: 'var(--type-feature)',
        bug: 'var(--type-bug)',
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
