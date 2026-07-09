import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark Premium Palette — arquitetônico, sofisticado, imersivo
        ink: '#0A0B0D',
        charcoal: '#111316',
        graphite: '#1C1E22',
        'graphite-light': '#282B30',
        smoke: '#6B7075',
        mist: '#A0A5AA',
        // Off-white quente para contraste
        paper: '#F5F2ED',
        cream: '#EFE9DF',
        // Acento premium — Brass evoluído
        brass: '#B8863C',
        'brass-soft': '#D4A96A',
        'brass-dim': '#8A6630',
        // Secundário — Deep Teal
        teal: '#1A4A4A',
        'teal-light': '#2A6A6A',
        // Tons de apoio
        clay: '#6B3A2A',
        sage: '#4F5D4F',
        // Status
        error: '#8E2A2A',
        'error-light': '#FEF2F2',
        success: '#2E5D45',
        'success-light': '#F0FDF4',
        warning: '#A67A2E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['"DM Serif Display"', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        editorial: ['"DM Serif Display"', 'Georgia', 'serif'],
      },
      fontSize: {
        eyebrow: ['0.7rem', { lineHeight: '1rem', letterSpacing: '0.15em' }],
        'display-sm': ['2.5rem', { lineHeight: '1.1' }],
        'display-md': ['3.5rem', { lineHeight: '1.05' }],
        'display-lg': ['4.5rem', { lineHeight: '1.02' }],
        'display-xl': ['5.5rem', { lineHeight: '1' }],
      },
      letterSpacing: {
        eyebrow: '0.15em',
        wide: '0.05em',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 10px 30px -8px rgba(0,0,0,0.3), 0 0 0 1px rgba(184,134,60,0.15)',
        'modal': '0 24px 60px -12px rgba(0,0,0,0.6)',
        'glass': '0 4px 30px rgba(0,0,0,0.3)',
        'glow': '0 0 20px rgba(184,134,60,0.15)',
      },
      backdropBlur: {
        glass: '20px',
      },
      transitionTimingFunction: {
        refined: 'cubic-bezier(0.22, 1, 0.36, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      maxWidth: {
        prose: '680px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(184,134,60,0.3)' },
          '50%': { borderColor: 'rgba(184,134,60,0.6)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.8s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'shimmer': 'shimmer 2s infinite linear',
        'float': 'float 4s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'border-glow': 'border-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
