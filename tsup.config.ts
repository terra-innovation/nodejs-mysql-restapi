import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // punto de entrada principal
  outDir: "dist", // carpeta de salida
  format: ["esm"], // puedes agregar 'cjs' si necesitas ambos formatos
  target: "node18", // ajusta a tu versión mínima de Node.js
  sourcemap: true, // útil para debugging
  clean: true, // limpia la carpeta dist antes de compilar
  dts: true, // genera archivos de tipos .d.ts
  shims: true, // agrega polyfills (como __dirname)
  splitting: false, // desactiva code splitting (ideal para backend)
  treeshake: true, // elimina código muerto
  external: ["fs", "path", "@prisma/client", "#root/generated/prisma/ft_factoring"], // no empaquetes estos módulos, déjalos como están para que Node los cargue dinámicamente
});
