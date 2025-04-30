import globals from "globals";
import pluginJs from "@eslint/js";
import pluginimport from "eslint-plugin-import";
import path from "path";
import { fileURLToPath } from "url";

// 👇 Forma compatible con ESM para obtener __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (dir) => path.resolve(__dirname, dir);

export default [
  pluginJs.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: globals.node,
    },
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
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
];
