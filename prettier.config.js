/** @type {import("prettier").Config} */
const config = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  jsxSingleQuote: false,
  quoteProps: 'as-needed',
  plugins: ['prettier-plugin-tailwindcss'],
  overrides: [
    {
      files: '*.json',
      options: { printWidth: 200 },
    },
  ],
};

export default config;
