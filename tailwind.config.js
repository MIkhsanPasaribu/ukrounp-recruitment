/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        'ping-once': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scaleIn': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'backdropFadeIn': {
          '0%': { backdropFilter: 'blur(0)', backgroundColor: 'rgba(0,0,0,0)' },
          '100%': { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.75)' },
        },
        'modalEntrance': {
          '0%': { transform: 'scale(0.8) translateY(50px)', opacity: '0' },
          '60%': { transform: 'scale(1.05) translateY(-10px)' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'ping-once': 'ping-once 0.3s ease-in-out',
        'fadeIn': 'fadeIn 0.3s ease-out',
        'scaleIn': 'scaleIn 0.3s ease-out',
        'backdropFadeIn': 'backdropFadeIn 0.4s ease-out forwards',
        'modalEntrance': 'modalEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}