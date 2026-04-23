/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // OLED Dark theme
        bg: {
          base: '#000000',
          card: '#0d0d0d',
          elevated: '#141414',
          border: '#1e1e1e',
        },
        // Accent — Electric Indigo
        accent: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dim: 'rgba(99,102,241,0.15)',
          glow: 'rgba(99,102,241,0.35)',
        },
        // Text
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#475569',
        },
        // Status
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        // Keep for compatibility
        primary: {
          DEFAULT: '#6366f1',
          light: 'rgba(99,102,241,0.15)',
        },
        neutral: '#94a3b8',
        background: '#000000',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(99,102,241,0.25)',
        'glow-sm': '0 0 10px rgba(99,102,241,0.2)',
      },
    },
  },
  plugins: [],
}
