import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff5f5',
          100: '#ffe3e3',
          200: '#ffc9c9',
          300: '#ffa8a8',
          400: '#ff8787',
          500: '#ff6b6b',
          600: '#e85d5d',
          700: '#c94f4f',
          800: '#a84141',
          900: '#873434',
        },
        neutral: {
          50: '#f7f7f7',
          100: '#e9e9e9',
          200: '#d9d9d9',
          300: '#c4c4c4',
          400: '#9d9d9d',
          500: '#7b7b7b',
          600: '#555555',
          700: '#434343',
          800: '#2e2e2e',
          900: '#222222',
        },
        accent: {
          50: '#e6f7f7',
          100: '#c2eded',
          200: '#9be3e3',
          300: '#74d9d9',
          400: '#4dcfcf',
          500: '#26c5c5',
          600: '#20a5a5',
          700: '#1a8585',
          800: '#146565',
          900: '#0e4545',
        },
        success: {
          DEFAULT: '#00a699',
          light: '#d4edda',
          dark: '#008489',
        },
        warning: {
          DEFAULT: '#f4a261',
          light: '#fff3cd',
          dark: '#e76f51',
        },
        error: {
          DEFAULT: '#d93025',
          light: '#f8d7da',
          dark: '#b71c1c',
        },
        info: {
          DEFAULT: '#0288d1',
          light: '#d1ecf1',
          dark: '#01579b',
        },
        status: {
          draft: '#9d9d9d',
          sent: '#0288d1',
          approved: '#00a699',
          rejected: '#d93025',
          printing: '#f4a261',
          completed: '#5a6268',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config

