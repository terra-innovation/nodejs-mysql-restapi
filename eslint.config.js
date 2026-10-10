import globals from "globals";
import pluginJs from "@eslint/js";
import pluginImport from "eslint-plugin-import-x";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import path from "path";
import { fileURLToPath } from "url";

// ESM-compatible __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
      "import-x": pluginImport,
      "@typescript-eslint": tsPlugin,
    },
    settings: {
      // Los aliases #root y #src se resuelven desde paths en tsconfig.json.
      "import-x/resolver-next": [createTypeScriptImportResolver({ project: path.join(__dirname, "tsconfig.json") })],
    },
    rules: {
      // Copiadas de @typescript-eslint/recommended
      "@typescript-eslint/adjacent-overload-signatures": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      // Sustituye no-empty-interface sin ampliar la regla a tipos objeto vacíos.
      "@typescript-eslint/no-empty-object-type": ["error", { allowInterfaces: "never", allowObjectTypes: "always" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-unused-vars": "off", // Desactiva la regla JS nativa para no duplicar con @typescript-eslint/no-unused-vars

      // Plugin de imports
      "import-x/no-unresolved": "error",
      "import-x/no-duplicates": "warn",

      // Tus reglas personalizadas
      semi: "error", // exige punto y coma al final de cada sentencia,
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    // TypeScript comprueba nombres y namespaces de tipos; no-undef no los interpreta.
    rules: { "no-undef": "off" },
  },
];
