import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        yeoon: {
          navy: '#1a3151',
          deep: '#023373',
        },
      },
    },
  },
  plugins: [],
};

export default config;
