/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EFF4FF',
          100: '#DBE7FF',
          200: '#BFCFFF',
          300: '#93ABFF',
          400: '#557AFF',
          500: '#2B52D4',
          600: '#1B3A6B', // primary navy
          700: '#162F56',
          800: '#0D1E38',
          900: '#060E1C',
        },
        gold: {
          50:  '#FFFEF7',
          100: '#FFFAE8',
          200: '#FEF0C0',
          300: '#FDE272',
          400: '#FBBF24',
          500: '#C9A227', // primary gold
          600: '#A67C00',
          700: '#7D5F00',
          800: '#5C4500',
          900: '#3D2E00',
        },
        slate: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        surface: '#FFFFFF',
      },
      fontFamily: {
        display:    ['var(--font-display)', 'Georgia', 'serif'],
        sans:       ['var(--font-sans)', 'system-ui', 'sans-serif'],
        devanagari: ['var(--font-devanagari)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '70ch',
      },
    },
  },
  plugins: [],
};
