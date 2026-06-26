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
        darkBg: '#020205',
        darkCard: 'rgba(10, 10, 15, 0.4)',
        glassBorder: 'rgba(255, 255, 255, 0.07)',
        neonBlue: '#0072ff',
        neonCyan: '#00f2fe',
        neonPurple: '#9d4edd',
        neonGreen: '#00f5d4',
        neonRed: '#ff0054',
        neonOrange: '#ff9f1c',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow': '0 8px 32px 0 rgba(0, 114, 255, 0.15)',
        'glow-cyan': '0 0 20px rgba(0, 242, 254, 0.3)',
        'glow-blue': '0 0 20px rgba(0, 114, 255, 0.3)',
        'glow-purple': '0 0 20px rgba(157, 78, 221, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-cyan-pulse': 'glowCyan 3s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 4s ease-in-out infinite',
        'orbit': 'orbit 20s linear infinite',
      },
      keyframes: {
        glowCyan: {
          '0%, 100%': { filter: 'drop-shadow(0 0 5px rgba(0, 242, 254, 0.3))' },
          '50%': { filter: 'drop-shadow(0 0 15px rgba(0, 242, 254, 0.7))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      }
    },
  },
  plugins: [],
}
