/** @type {import('prettier').Config} */
export default {
  plugins: ['prettier-plugin-astro'],
  semi: false,
  singleQuote: true,
  printWidth: 110,
  overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
}
