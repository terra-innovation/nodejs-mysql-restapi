import globals from "globals";
import pluginJs from "@eslint/js";
import pluginimport from "eslint-plugin-import";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import path from "path";
import { fileURLToPath } from "url";

// 👇 Forma compatible con ESM para obtener __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (dir) => path.resolve(__dirname, dir);

export default [
  pluginJs.configs.recommended,
  tsPlugin.configs.recommended,
  {
    files: ["src/**/*.{js,ts}"],
    languageOptions: {
      sourceType: "module",
      globals: globals.node,
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
    ignores: ["**/*.config.js", "!**/eslint.config.js", "dist/**/*"],
    plugins: {
      import: pluginimport,
      "@typescript-eslint": tsPlugin,
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
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];
