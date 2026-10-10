# Migración Jest → Vitest: trazabilidad y fechas de simulación

Fecha: 2026-10-10 (America/Lima). Paso 3 en curso: sexto grupo completado, con validación focalizada del paso 4.

## Cambios

| Origen retirado de Jest | Destino Vitest | Casos |
| --- | --- | ---: |
| `tests/unit/services/factoring.dateTrace.test.ts` | `tests/vitest/migrated/unit/services/factoring.dateTrace.test.ts` | 14 |
| `tests/unit/services/admin/factoringsimulacion.dates.test.ts` | `tests/vitest/migrated/unit/services/admin/factoringsimulacion.dates.test.ts` | 494 |

Se incorporaron imports explícitos de Vitest y equivalentes de factories, funciones, limpieza, tipos y temporizadores. `jest.requireActual` de Decimal se reemplazó por `await vi.importActual` tipado dentro de las funciones asíncronas existentes. No se alteraron tablas de casos, títulos, datos ni expectativas financieras.

Trazabilidad conserva servicios y fórmulas reales de factura, operación, propuesta, aceptación, inicio y liquidación; Prisma/DAOs/catálogos/notificaciones permanecen simulados. Se mantiene `vi.useFakeTimers({ now })`, restauración con `vi.useRealTimers` y limpieza de cachés Luxon. Los procesos auxiliares se ejecutan con `process.execPath` y `TZ=America/Lima`, usando el contrato frontend local existente; no se usa navegador.

Simulación conserva `Settings.now`, las zonas UTC/Lima/Nueva York/Madrid, bancos y monedas parametrizados, restauración de zona/reloj/cachés, comparación de simulación/propuesta y cabeceras/desgloses persistidos mediante mocks. Los casos de controladores llaman directamente a funciones con req/res simulados; no son HTTP sobre una red ni E2E.

Los reportes opcionales mantienen sus variables `FACTORING_TRACE_OUTPUT_DIR` y `SIMULATION_DATES_OUTPUT_DIR`; no se establecieron para esta validación. No se cambió producción, fórmulas, redondeos, contratos ni dependencias.

Antes de crear destinos se verificaron hashes SHA-256 de originales contra la línea base del paso 1. Antes de retirarlos se compararon nombres/estados y tokens de código contra la adaptación explícita de imports/API/tipos/importActual y formato. Evidencia compacta: [comparación del grupo](migracion-jest-vitest-grupo6-20261010.json).

## Validación actual

Node portable verificado: `v24.21.0`, `D:\Herramientas\node-v24.21.0-win-x64\node.exe`.

- Grupo: `npm.cmd run test:vitest -- tests/vitest/migrated/unit/services/factoring.dateTrace.test.ts tests/vitest/migrated/unit/services/admin/factoringsimulacion.dates.test.ts --reporter=json --outputFile=coverage/jest-migration-step3-group6/results.json`, con `CI=true`: salida 0, 508/508 casos aprobados; nombres/estados coincidentes con Jest.
- `npm.cmd run test:vitest:typecheck`: aprobado antes y después del traslado.
- `npm.cmd run typecheck:jest`: aprobado después de retirar originales.
- Prettier de ambos destinos: aprobado.
- Vitest completo: `npm.cmd run test:vitest -- --reporter=json --outputFile=coverage/jest-migration-step3-group6/full.json`, con `CI=true`: salida 0, 34 archivos, 1238 casos aprobados y 3 `todo`. Archivos/nombres/estados preexistentes comparados con el grupo anterior: sin diferencias. `git diff --check` aprobado.

Vitest se ejecutó fuera de la restricción `EPERM realpath` comprobada en pasos anteriores. Logs/resultados en `coverage/jest-migration-step3-group6/`, ignorados por Git. No se repitió Jest completo; se verificaron hashes contra su línea base. No se ejecutaron cobertura, build, MariaDB real, runtime ni build-prod. Los conteos parametrizados no representan cobertura ni integración real.

## Siguiente paso del plan

Migrar la auditoría extensa de liquidación (`tests/unit/services/admin/factoringliquidacion.audit.test.ts`), preservando casos financieros, observaciones, reportes y procesos auxiliares; después migrar tipo de cambio y ejemplo básico para terminar las suites seleccionadas antes de retirar Jest.
