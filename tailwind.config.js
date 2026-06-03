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
        // Editorial Ivy — forest green primary
        forest: {
          50:  '#F0F7F2',
          100: '#DCEDE2',
          200: '#B9DBC6',
          300: '#8DC2A0',
          400: '#5FA378',
          500: '#3D8657',
          600: '#2A6A43',
          700: '#14532D', // primary
          800: '#0F3F23',
          900: '#0A2A18',
        },
        // Warm terracotta accent
        terracotta: {
          50:  '#FDF4EF',
          100: '#FBE5D6',
          200: '#F7C8AB',
          300: '#F0A37C',
          400: '#E47B4C',
          500: '#C2410C', // primary
          600: '#A0340A',
          700: '#7A2807',
          800: '#561C05',
          900: '#331003',
        },
        // Warm cream surface
        cream: {
          50:  '#FFFDF7',
          100: '#FFF8E7', // primary surface
          200: '#FBEFCC',
          300: '#F5E3A8',
          400: '#EDD179',
          500: '#E0B947',
        },
        // Warm gray (stone-like)
        stone: {
          50:  '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E', // primary mute
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
        // Brand alias points to forest for backwards compatibility
        brand: {
          50:  '#F0F7F2',
          100: '#DCEDE2',
          200: '#B9DBC6',
          300: '#8DC2A0',
          400: '#5FA378',
          500: '#3D8657',
          600: '#2A6A43',
          700: '#14532D',
          800: '#0F3F23',
          900: '#0A2A18',
        },
        ink: '#0A0A0A',
        surface: '#FFF8E7',
      },
      fontFamily: {
        display:    ['var(--font-display)', 'Fraunces', 'Georgia', 'serif'],
        sans:       ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono:       ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
        devanagari: ['var(--font-devanagari)', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '70ch',
      },
      letterSpacing: {
        'editorial': '-0.02em',
      },
    },
  },
  plugins: [],
};
