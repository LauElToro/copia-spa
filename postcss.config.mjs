export default {
  plugins: {
    '@tailwindcss/postcss7-compat': {},
    autoprefixer: {},
    'postcss-discard-comments': {
      removeAll: true,
      removeAllButFirst: false,
    },
  },
}