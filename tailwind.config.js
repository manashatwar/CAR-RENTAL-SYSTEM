/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    screens: {
      ss: '250px',
      xs: '480px',
      sm: '680px',
      md: '1200px',
      lg: '1600px',
      xlg: '1900px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6c3fc5',
          dark: '#4e2c9a',
          light: '#8b5fe8',
        },
        accent: {
          DEFAULT: '#e8a830',
          dark: '#c48920',
          light: '#f5c96a',
        },
        sidebar: '#1a0f3c',
      },
    },
  },
  plugins: [
    // eslint-disable-next-line global-require
    require('flowbite/plugin'),
  ],
};
