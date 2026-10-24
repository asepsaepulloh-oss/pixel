/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        retro: {
          dark: '#121217',
          panel: '#1e2029',
          border: '#3b3f51',
          highlight: '#ffb347',
          accent: '#79a8a9',
          amber: '#ffb300',
          cyan: '#38bdf8',
          green: '#4ade80',
          red: '#f87171',
          osBg: '#282c34',
          taskbar: '#191b22',
          winTitle: '#2b303c',
          winBorder: '#4c566a',
          cozyWood: '#593a28',
          cozyRug: '#8b4513'
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        retro: ['"Courier New"', 'Courier', 'monospace'],
        sans: ['system-ui', '-apple-system', 'sans-serif']
      },
      boxShadow: {
        'pixel': '2px 2px 0px 0px rgba(0, 0, 0, 0.5)',
        'pixel-lg': '4px 4px 0px 0px rgba(0, 0, 0, 0.6)',
        'pixel-inset': 'inset 2px 2px 0px 0px rgba(0,0,0,0.4), inset -2px -2px 0px 0px rgba(255,255,255,0.1)'
      }
    },
  },
  plugins: [],
}
