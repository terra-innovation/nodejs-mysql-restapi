import globals from "globals";
import pluginJs from "@eslint/js";
import pluginImport from "eslint-plugin-import";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import path from "path";
import { fileURLToPath } from "url";

// ESM-compatible __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (dir) => path.resolve(__dirname, dir);

export default [
  pluginJs.configs.recommended, // Base JS rules from ESLint

  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
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
      import: pluginImport,
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
      // Copiadas de @typescript-eslint/recommended
      "@typescript-eslint/adjacent-overload-signatures": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/no-empty-interface": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/no-unused-vars": "warn",

      // Tus reglas personalizadas
      semi: "error",
      "import/no-unresolved": "error",
      "import/no-duplicates": "warn",
      "no-unused-vars": "warn",
    },
  },
];
