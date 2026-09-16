import { defineConfig } from "tsup";

export default defineConfig({
  /**
   * Entry points:
   *  - src/index.ts          → Servidor Express (API REST)
   *  - src/scripts/*.ts      → Runners de scripts cron/programador de tareas
   *
   * Para agregar un nuevo script basta con crear src/scripts/mi_script.ts,
   * tsup lo detecta automáticamente en el siguiente build. No se requiere
   * editar este archivo.
   *
   * Salida compilada:
   *  - dist/index.js                       → Servidor
   *  - dist/scripts/sync_tipo_cambio.js    → Cron tipo de cambio
   *  - dist/scripts/email_venta_frio.js    → Cron email venta en frío
   */
  entry: ["src/index.ts", "src/scripts/*.ts"],
  outDir: "dist",
  format: ["esm"],
  target: "node18",
  sourcemap: true,
  clean: true,
  dts: false,       // Los scripts no necesitan archivos de tipos .d.ts
  shims: true,      // Polyfills para __dirname, __filename en ESM
  splitting: false, // Sin code splitting (ideal para Node.js backend)
  treeshake: true,
  external: ["fs", "path", "@prisma/client", "#root/generated/prisma/ft_factoring"],
});
