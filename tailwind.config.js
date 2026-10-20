/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#3B82F6',
          secondary: '#10B981',
          accent: '#6366F1',
          action: '#0057C2',
        },
        surface: {
          page: '#F8F7FF',
          panel: '#F1F2FF',
          card: '#FFFFFF',
          selected: '#DCE4FF',
        },
        border: { subtle: '#DDE1EF' },
        ink: {
          primary: '#0F172A',
          body: '#444B5A',
          muted: '#667085',
        },
        type: { feature: '#1D4ED8', bug: '#B91C1C' },
        due: {
          safe: '#047857',
          warning: '#92400E',
          overdue: '#B91C1C',
          neutral: '#475569',
        },
        tint: {
          feature: '#DBEAFE',
          bug: '#FEE2E2',
          safe: '#ECFDF5',
          warning: '#FEF3C7',
          neutral: '#F1F5F9',
        },
        // Preserve the starter's shorthand utilities.
        feature: '#1D4ED8',
        bug: '#B91C1C',
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
