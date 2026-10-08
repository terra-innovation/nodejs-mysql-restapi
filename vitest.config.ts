import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL("./", import.meta.url));
const src = fileURLToPath(new URL("./src/", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^#src\/(.*)\.js$/, replacement: `${src}$1` },
      { find: /^#root\/(.*)\.js$/, replacement: `${root}$1` },
      { find: /^#src\//, replacement: src },
      { find: /^#root\//, replacement: root },
    ],
  },
  test: {
    environment: "node",
    globals: false,
    include: ["tests/vitest/unit/**/*.test.ts", "tests/vitest/http/**/*.test.ts", "tests/vitest/pending/**/*.test.ts"],
    maxWorkers: 4,
    isolate: true,
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    allowOnly: !process.env.CI,
    passWithNoTests: false,
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage/vitest",
      reporter: ["text", "html", "lcov", "json-summary"],
      // Módulos cubiertos por esta suite; incluye también sus funciones no ejercitadas.
      include: [
        "src/domain/factoring/factoring.Calculator.ts",
        "src/utils/dateUtils.ts",
        "src/utils/facturaUtils.ts",
        "src/services/admin/factura.Service.ts",
        "src/services/admin/factoringhistorialestado.Service.ts",
        "src/services/admin/factoringfacturafactor.Service.ts",
        "src/services/empresario/factoringpropuesta.Service.ts",
        "src/services/admin/factoringCalculation.Service.ts",
        "src/services/admin/factoringpropuesta.Service.ts",
        "src/services/admin/factoringliquidacion.Service.ts",
        "src/services/admin/factoringtransferenciacedente.Service.ts",
        "src/services/secure/{accesos,secure}.Service.ts",
        "src/services/usuario/{archivo,usuarioservicioestadoConsulta}.Service.ts",
        "src/middlewares/authMiddleware.ts",
        "src/controllers/admin/servicio/factoring/{factoringpropuesta,factoringliquidacion}.Controller.ts",
        "src/controllers/admin/servicio/factoring/factoringhistorialestado.Controller.ts",
        "src/controllers/admin/factura.Controller.ts",
        "src/controllers/empresario/factoring/factoringpropuesta.Controller.ts",
      ],
      exclude: ["**/*.d.ts"],
      thresholds: {
        statements: 60,
        branches: 60,
        functions: 50,
        lines: 60,
        "src/services/secure/accesos.Service.ts": { statements: 100, branches: 90, functions: 100, lines: 100 },
        "src/services/usuario/archivo.Service.ts": { statements: 95, branches: 80, functions: 85, lines: 100 },
      },
    },
  },
});
