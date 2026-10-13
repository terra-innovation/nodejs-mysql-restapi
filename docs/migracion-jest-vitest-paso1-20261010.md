# Migración Jest → Vitest: inventario y línea base

Fecha: 2026-10-10 (America/Lima). Paso 1; no se migraron pruebas ni dependencias.
Commit inicial: `1f23e5eeb891c237afad72fc1f2d4751a6e0ec12`; árbol de trabajo inicialmente limpio.

## Selección y configuración

`npm test` usa explícitamente `jest.config.js`, no `jest.config.ts`. Ambos archivos existen y habrá que retirar ambos al completar la migración. La configuración activa selecciona `tests/unit/` y `tests/e2e/`, con exclusión expresa de `tests/e2e/index.test.ts`. Esa suite excluida contiene dos casos HTTP de bienvenida/ping: no forma parte de la línea base ejecutada, pero debe conservarse y recibir una decisión explícita al migrar; no activarla silenciosamente.

La selección descubierta contiene 15 suites: 14 en `tests/unit/` y `tests/e2e/example.test.ts`. Esta última contiene dos ejemplos triviales; su ubicación no demuestra E2E real.

- Entorno Node; `TZ=UTC`, `NODE_ENV=test`; ejecución serial, sin cobertura adicional.
- Transformación con `ts-jest`, aliases `#src/`, `#root/` y resolución de imports relativos `.js`.
- Transformador especial `tests/transformers/prismaEsm.cjs` para Prisma generado con ESM/import.meta.
- Mapeo global de `file-type` a `tests/mocks/fileTypeMock.ts`, que exporta una función Jest simulada.
- `tests/e2e/setup.ts` se ejecuta en todas las suites; sus hooks solo escriben mensajes.
- `tests/tsconfig.jest.json` incluye tipos Node/Jest, código de pruebas unitarias, e2e y mocks. Incluye la suite HTTP excluida de ejecución.

## Puntos de adaptación

| Grupo | Particularidades a conservar |
| --- | --- |
| Calculadora y fechas | Decimal de Prisma; semántica UTC/Lima; restauración de `Settings.defaultZone` de Luxon. |
| Servicios y rutas | Factories `jest.mock`, `jest.fn`, `jest.Mock`, limpieza de mocks; DAOs y transacciones simulados; ruta con Supertest. Revisar hoisting y carga de módulos al pasar a ESM/Vitest. |
| Simulación y liquidación | `jest.requireActual` de Decimal en factories; valores financieros y redondeos; `Settings.now` y zonas restaurados. |
| Trazabilidad Factoring | Temporizadores simulados con fecha fija, restauración de temporizadores y cachés Luxon; procesos Node auxiliares para fechas. |
| Archivos | Mocks de `fs`, `fs/promises` y detección `file-type`; conservar límites y validaciones de archivos. |
| PDF | Espía sobre `PDFDocument.prototype.table`; generación real de PDF locales en `temporal/simulacion-fechas/pdf`. |
| Auditoría de liquidación | Casos parametrizados y reporte en `temporal/liquidacion-audit-fechas-lima/resultados.json`; observaciones del reporte no equivalen a aserciones fallidas ni aprueban reglas pendientes. |

No hay evidencia en este inventario de uso de `resetModules` o `isolateModules` en las suites seleccionadas. Los reportes opcionales de simulación/trazabilidad dependen de variables de salida; no se establecieron para esta ejecución.

## Referencias que habrá que actualizar al retirar Jest

- `package.json`: dependencias Jest/ts-jest/@types/jest; `test`, `test_anterior`, `pretest_anterior`, `typecheck:jest`, `typecheck:all`, `test:all`.
- `.github/workflows/backend-quality.yml`: control Jest, comando, artefactos JSON/log y estados de resultados.
- `.vscode/extensions.json`: extensiones de Jest recomendadas.
- `tests/README.md`, configuraciones Jest, setup, mock y transformador exclusivos.
- `typescript` mantiene consumidores ajenos a Jest; retirar Jest no autoriza eliminar la API de compatibilidad TypeScript.

## Validación y límites

Node portable verificado: `v24.21.0`, `D:\Herramientas\node-v24.21.0-win-x64\node.exe`.

- `npm.cmd run typecheck:jest`: aprobado, salida 0.
- El descubrimiento inicial falló con `EPERM realpath` del temporal de Windows; también falló al cambiar TEMP/TMP a una carpeta local dentro del sandbox. Se repitió fuera de esa restricción con temporal local y sin cambiar configuración de pruebas.
- Comandos de referencia: `npm.cmd test -- --listTests --runInBand --json` y `npm.cmd test -- --ci --runInBand --json --outputFile=coverage/jest-migration-step1/results.json`.
- Selección/log/resultado bruto: `coverage/jest-migration-step1/` (artefactos locales). El inventario JSON adjunto conservará por suite nombres de casos, estados y hashes de fuentes/configuración para comparar después.

Estas pruebas combinan lógica real con mocks de persistencia/proveedores y generación local de PDF; no certifican MariaDB real, servicios externos, despliegue ni E2E de navegador. No se ejecutaron Vitest, integración, build ni build-prod en este paso.

## Siguiente paso del plan

Preparar la configuración de Vitest para recibir las suites por grupos, manteniendo exclusiones, aislamiento, mocks y expectativas de esta línea base.

## Resultado de la ejecución

Jest terminó con salida 0: **15/15 suites y 2923/2923 casos aprobados**, sin fallos, pendientes ni todo; sin snapshots. Duración reportada: 100.373 s. Los conteos incluyen parametrización y no representan cobertura.

Inventario reproducible: [línea base JSON](migracion-jest-vitest-linea-base-20261010.json). Contiene los nombres y estados de todos los casos, la selección exacta y hashes SHA-256 de suites, configuración y lockfile.

| Suite | Casos | Resultado |
| --- | ---: | --- |
| `tests/e2e/example.test.ts` | 2 | passed |
| `tests/unit/domain/factoring/factoring.Calculator.test.ts` | 10 | passed |
| `tests/unit/routes/factoringEmpresaDetalle.test.ts` | 24 | passed |
| `tests/unit/services/admin/factoringliquidacion.audit.test.ts` | 2262 | passed |
| `tests/unit/services/admin/factoringliquidacion.Service.test.ts` | 15 | passed |
| `tests/unit/services/admin/factoringpropuesta.Service.test.ts` | 8 | passed |
| `tests/unit/services/admin/factoringsimulacion.dates.test.ts` | 494 | passed |
| `tests/unit/services/factoring.dateTrace.test.ts` | 14 | passed |
| `tests/unit/services/factoring.Service.test.ts` | 1 | passed |
| `tests/unit/services/financiero/factura.Service.test.ts` | 6 | passed |
| `tests/unit/services/secure/accesos.Service.test.ts` | 11 | passed |
| `tests/unit/services/tipocambio.Service.test.ts` | 3 | passed |
| `tests/unit/services/usuario/archivo.Service.test.ts` | 8 | passed |
| `tests/unit/utils/dateUtils.test.ts` | 45 | passed |
| `tests/unit/utils/document/PDFgenerator.dates.test.ts` | 20 | passed |
