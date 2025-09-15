/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Exact AngelQ.ai color palette
        blue: {
          50: '#E5F0F3',    // AngelQ background
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#148AFF',   // Exact AngelQ primary blue
          600: '#1056CC',   // Darker shade of primary
          700: '#0C4299',   // Even darker shade
          800: '#075985',
          900: '#0c4a6e',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#1b4332',  // AngelQ deep teal/green
          800: '#134e4a',
          900: '#042f2e',
        },
        // Keep existing duo colors for compatibility
        'duo': {
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',  // Main bright green
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          },
          blue: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#148aff',  // Updated to match AngelQ
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
          },
          yellow: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#F6C83B',  // Exact AngelQ yellow
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
          },
          red: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',  // Bright red
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
          },
          purple: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#a855f7',  // Bright purple
            600: '#9333ea',
            700: '#7c3aed',
            800: '#6b21a8',
            900: '#581c87',
          },
        },
        // AngelQ.ai exact color palette for precise matching
        'angelq': {
          primary: '#148AFF',      // Main primary blue
          yellow: '#F6C83B',       // Main yellow accent
          background: '#E5F0F3',   // Light background
          'background-alt': '#F7FBFC', // Alternative background
          'text-primary': '#1A1A1A',   // Primary text
          'text-secondary': '#666666', // Secondary text
          'text-light': '#999999',     // Light text
          'gray-light': '#F5F5F5',     // Light gray
          'gray-medium': '#E0E0E0',    // Medium gray
          'border': '#E6E6E6',         // Border color
        },
        'panda': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        'funky': {
          purple: '#8b5cf6',
          pink: '#ec4899',
          blue: '#3b82f6',
          green: '#10b981',
          yellow: '#f59e0b',
          red: '#ef4444',
        },
        // Background grays
        'neutral': {
          25: '#fdfdfd',
          50: '#fafafa',
          75: '#f7f7f7',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        'sans': ['"Outfit"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'display': ['"Outfit"', 'system-ui', 'sans-serif'],
        'heading': ['"Outfit"', 'system-ui', 'sans-serif'],
        'body': ['"Outfit"', 'system-ui', 'sans-serif'],
        // Keep existing fonts for compatibility
        'fun': ['"Outfit"', '"Fredoka One"', 'system-ui', 'sans-serif'],
        'bubbly': ['"Outfit"', '"Fredoka One"', 'system-ui', 'sans-serif'],
        'logo': ['"Outfit"', 'system-ui', 'sans-serif'],
        'playful': ['"Schoolbell"', 'cursive'],
      },
      fontSize: {
        // AngelQ.ai typography scale
        'xs': ['0.75rem', { lineHeight: '1.2', fontWeight: '400' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.3', fontWeight: '400' }],     // 14px
        'base': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],       // 16px - body text
        'lg': ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],     // 18px
        'xl': ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],      // 20px - small headings
        '2xl': ['1.5rem', { lineHeight: '1.25', fontWeight: '600' }],     // 24px - medium headings
        '3xl': ['2rem', { lineHeight: '1.2', fontWeight: '700' }],        // 32px - large headings
        '4xl': ['2.5rem', { lineHeight: '1.1', fontWeight: '700' }],      // 40px - hero headings
        '5xl': ['3rem', { lineHeight: '1.1', fontWeight: '800' }],        // 48px - main hero
        '6xl': ['3.75rem', { lineHeight: '1', fontWeight: '800' }],       // 60px
        '7xl': ['4.5rem', { lineHeight: '1', fontWeight: '800' }],        // 72px
        '8xl': ['6rem', { lineHeight: '1', fontWeight: '800' }],          // 96px
        '9xl': ['8rem', { lineHeight: '1', fontWeight: '800' }],          // 128px
      },
      borderRadius: {
        'xs': '0.25rem',    // 4px - AngelQ small radius
        'sm': '0.375rem',   // 6px
        'default': '0.5rem', // 8px
        'md': '0.5rem',     // 8px
        'lg': '0.75rem',    // 12px - AngelQ medium radius
        'xl': '1rem',       // 16px - AngelQ large radius
        '2xl': '1.5rem',    // 24px
        '3xl': '2rem',      // 32px
        '4xl': '2.5rem',    // 40px
      },
      spacing: {
        // AngelQ.ai spacing scale (4px base)
        '0': '0',
        '1': '0.25rem',     // 4px
        '2': '0.5rem',      // 8px
        '3': '0.75rem',     // 12px
        '4': '1rem',        // 16px - base unit
        '5': '1.25rem',     // 20px
        '6': '1.5rem',      // 24px
        '8': '2rem',        // 32px
        '10': '2.5rem',     // 40px
        '12': '3rem',       // 48px
        '16': '4rem',       // 64px
        '20': '5rem',       // 80px
        '24': '6rem',       // 96px
        '32': '8rem',       // 128px
      },
      boxShadow: {
        // AngelQ.ai shadow system
        'none': '0 0 #0000',
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'default': '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
        'lg': '0 6px 16px 0 rgba(0, 0, 0, 0.10)',
        'xl': '0 10px 25px 0 rgba(0, 0, 0, 0.15)',
        '2xl': '0 20px 40px 0 rgba(0, 0, 0, 0.20)',
        // Button specific shadows
        'button': '0 2px 8px rgba(20, 138, 255, 0.2)',
        'button-hover': '0 4px 12px rgba(20, 138, 255, 0.3)',
        'button-yellow': '0 2px 8px rgba(246, 200, 59, 0.2)',
        'button-yellow-hover': '0 4px 12px rgba(246, 200, 59, 0.3)',
        // Legacy shadows for compatibility
        'soft': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'strong': '0 10px 40px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'scale': 'scale 0.2s ease-in-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scale: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      }
    },
  },
  plugins: [],
}