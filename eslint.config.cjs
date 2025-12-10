/* eslint-env node */
const js = require("@eslint/js");
const globals = require("globals");
const prettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = [
  js.configs.recommended,
  prettierRecommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        // GJS globals
        imports: "readonly",
        log: "readonly",
        Me: "readonly",
        global: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
  {
    ignores: ["node_modules/", "dist/", "*.zip", "pnpm-lock.yaml", "eslint.config.cjs"],
  },
];
