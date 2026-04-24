/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--color-bg-base)',
          card: 'var(--color-bg-card)',
          elevated: 'var(--color-bg-elevated)',
          border: 'var(--color-bg-border)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          light: 'var(--color-accent-light)',
          dim: 'var(--color-accent-dim)',
          glow: 'var(--color-accent-glow)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        // Compatibility fallbacks
        primary: {
          DEFAULT: 'var(--color-accent)',
          light: 'var(--color-accent-dim)',
        },
        neutral: 'var(--color-text-muted)',
        background: 'var(--color-bg-base)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neu-out': '8px 8px 16px rgba(18, 21, 28, 0.8), -8px -8px 16px rgba(45, 54, 73, 0.4)',
        'neu-in': 'inset 4px 4px 8px rgba(18, 21, 28, 0.8), inset -4px -4px 8px rgba(45, 54, 73, 0.4)',
        'glow': '0 0 20px var(--color-accent-glow)',
        'glow-sm': '0 0 10px var(--color-accent-dim)',
      },
      backgroundImage: {
        'neu-diagonal': 'linear-gradient(135deg, rgba(75, 76, 237, 0.6) 0%, rgba(55, 182, 233, 0.4) 100%)',
      }
    },
  },
  plugins: [],
}
