// PostCSS config for Tailwind CSS v4.
// v4 ships as a PostCSS plugin (@tailwindcss/postcss) rather than the
// separate autoprefixer/postcss-import setup that v3 used.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
