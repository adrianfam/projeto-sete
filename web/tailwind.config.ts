import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tons arquitetônicos escuros
        ink: '#0E0F11',
        charcoal: '#15171A',
        graphite: '#23262B',
        smoke: '#6B7075',
        mist: '#B6BBBB',
        // Tons quentes/papel
        paper: '#F6F3EE',
        cream: '#EFE9DF',
        // Acentos madeira/latão (brass = acento único)
        wood: '#6B4A2B',
        brass: '#B08342',
        'brass-soft': '#D9B984',
        clay: '#8A4A2D',
        sage: '#4F5D4F',
        // Status
        error: '#8E2A2A',
        success: '#2E5D45',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      fontSize: {
        eyebrow: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.2em' }],
      },
      letterSpacing: {
        eyebrow: '0.2em',
      },
      boxShadow: {
        card: '0 1px 2px rgba(14, 15, 17, 0.04)',
        modal: '0 24px 60px -12px rgba(14, 15, 17, 0.45)',
      },
      transitionTimingFunction: {
        refined: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      maxWidth: {
        prose: '680px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.6s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
}

export default config
