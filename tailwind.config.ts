import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dae6ff',
          200: '#bdd1ff',
          300: '#90b1ff',
          400: '#5d86ff',
          500: '#3a5fff',
          600: '#243df5',
          700: '#1c2cd9',
          800: '#1d28af',
          900: '#1e2a88',
          950: '#161a4f',
        },
        ink: {
          50: '#f7f8fa',
          100: '#eef0f4',
          200: '#dadee6',
          300: '#b9bfcd',
          400: '#8f97aa',
          500: '#6c748a',
          600: '#555c70',
          700: '#454a5b',
          800: '#3a3e4d',
          900: '#1f2230',
          950: '#0f1118',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(15,17,24,0.04), 0 1px 6px -1px rgba(15,17,24,0.04)',
        card: '0 4px 24px -6px rgba(15,17,24,0.06), 0 1px 2px 0 rgba(15,17,24,0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
