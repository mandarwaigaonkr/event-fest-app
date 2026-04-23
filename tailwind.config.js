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
        'glow': '0 0 20px var(--color-accent-glow)',
        'glow-sm': '0 0 10px var(--color-accent-dim)',
      },
    },
  },
  plugins: [],
}
