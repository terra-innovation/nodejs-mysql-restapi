import globals from "globals";
import pluginJs from "@eslint/js";
import pluginimport from "eslint-plugin-import";

export default [
  {
    languageOptions: {
      sourceType: "module",
      globals: globals.node,
    },
    files: ["src/**/*.js"],
    ignores: ["**/*.config.js", "!**/eslint.config.js"],
    plugins: {
      pluginimport,
    },
    rules: {
      semi: "error",
      "pluginimport/no-unresolved": "error",
      "pluginimport/no-duplicates": "warn",
    },
  },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
];
