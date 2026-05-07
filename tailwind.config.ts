import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Brand — electric blue, pushed brighter for legibility on dark navy.
        brand: {
          50: '#eef4ff',
          100: '#dbe6ff',
          200: '#b9cdff',
          300: '#8aabff',
          400: '#6b8eff',
          500: '#5478ff',
          600: '#3a5fff',
          700: '#2a4ae6',
          800: '#243db8',
          900: '#1f3494',
          950: '#162160',
        },
        // Ink — semantically inverted for dark-mode-first.
        // ink-50 = darkest base bg, ink-950 = pure white.
        ink: {
          50: '#0a1330',     // Deepest navy — page backgrounds
          100: '#101a3e',    // Card-elevated bg / muted regions
          200: '#1a2654',    // Borders, dividers
          300: '#2c3a73',    // Hairline borders, hover bgs
          400: '#5b6691',    // Disabled text / placeholder
          500: '#8e96b0',    // Secondary text (was 500 on light)
          600: '#b0b6ca',    // Body text muted
          700: '#cdd2df',    // Body text
          800: '#e3e6ee',    // Strong body
          900: '#f1f3f9',    // Headings
          950: '#ffffff',    // Pure white — on-brand text
        },
        // Midnight — a dedicated palette for atmospheric backdrops.
        midnight: {
          400: '#1a2658',
          500: '#152049',
          600: '#101a3c',
          700: '#0c1430',
          800: '#080e25',
          900: '#050a1a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Glass-friendly: deep cool shadow + bright inset highlight on top
        soft: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 4px 16px -4px rgba(2,6,23,0.5)',
        card:
          '0 1px 0 0 rgba(255,255,255,0.06) inset, 0 12px 40px -10px rgba(2,6,23,0.6), 0 4px 12px -4px rgba(2,6,23,0.4)',
        glow: '0 0 0 1px rgba(106, 142, 255, 0.35), 0 12px 36px -6px rgba(58, 95, 255, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
