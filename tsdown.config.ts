import { defineConfig } from "tsdown";

export default defineConfig({
  // Conserva dist/index.js y dist/scripts/*.js, descubriendo nuevos cron automáticamente.
  entry: ["src/index.ts", "src/scripts/*.ts"],
  root: "src",
  outDir: "dist",
  format: ["esm"],
  platform: "node",
  target: "node24",
  outExtensions: () => ({ js: ".js" }),
  sourcemap: true,
  clean: true,
  dts: false,
  shims: true,
  treeshake: true,
  // Prisma 7 se genera en TypeScript y se compila junto con el código local.
  deps: { neverBundle: ["fs", "path", "@prisma/client"] },
  // tsdown comparte código entre entradas: distribuir siempre todo dist.
});
