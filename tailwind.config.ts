import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'header-bg': '#212121',
        'header-border': '#3D3D3D',
        'cart-button': '#E9EF33',
        'body-bg': '#0A0A0A',
      },
      spacing: {
        'header-top': '45px',
        'header-sides': '390px',
      },
    },
  },
  plugins: [],
}
export default config
