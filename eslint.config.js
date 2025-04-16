import globals from "globals";
import pluginJs from "@eslint/js";
import pluginimport from "eslint-plugin-import";
import path from "path";
import { fileURLToPath } from "url";

// 👇 Forma compatible con ESM para obtener __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (dir) => path.resolve(__dirname, dir);

export default [
  {
    languageOptions: {
      sourceType: "module",
      globals: globals.node,
    },
    files: ["src/**/*.js"],
    ignores: ["**/*.config.js", "!**/eslint.config.js"],
    plugins: {
      import: pluginimport,
    },
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
        alias: {
          map: [
            ["#root", resolve("")],
            ["#src", resolve("src")],
          ],
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      semi: "error",
      "import/no-unresolved": "error",
      "import/no-duplicates": "warn",
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
