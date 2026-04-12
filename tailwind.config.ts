import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dead: {
          gold: '#e8b84b',
          'gold-light': '#f5d07a',
          purple: '#7c3aed',
          'purple-dark': '#4c1d95',
          teal: '#0d9488',
          'teal-light': '#14b8a6',
          bg: '#0a0a14',
          card: '#111827',
          'card-hover': '#1f2937',
          border: '#1f2937',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient':
          'linear-gradient(135deg, #0a0a14 0%, #1a0533 50%, #0a1a14 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
