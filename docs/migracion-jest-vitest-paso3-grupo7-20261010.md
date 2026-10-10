# Migración Jest → Vitest: auditoría extensa de liquidación

Fecha de ejecución: 2026-10-10 (America/Lima). Grupo 7 del paso 3, con comprobaciones de equivalencia del paso 4.

## Adaptación

Origen: `tests/unit/services/admin/factoringliquidacion.audit.test.ts`.
Destino: `tests/vitest/migrated/unit/services/admin/factoringliquidacion.audit.test.ts`.

Se incorporaron imports explícitos Vitest y equivalentes de factories, funciones y tipos. `jest.requireActual` de Decimal se sustituyó por `await vi.importActual` tipado dentro de la función asíncrona existente. Se conservaron los 2262 casos, sus títulos, entradas y expectativas; la aserción sobre `record.issues` y la de discrepancias del contrato frontend permanecen sin cambios.

Se mantienen casos de calendario, sensibilidad financiera, zonas/horas, diferencias entre inicio/propuesta, requisitos cronológicos, entradas inválidas, conceptos adicionales y persistencia simulada. Los servicios, cálculos y fechas son reales; Prisma, DAOs, catálogos y proveedores siguen simulados. Se conserva restauración de zona Luxon en `finally`, sin introducir concurrencia entre casos.

El setup conserva sus procesos Node locales para cinco zonas y timeout de 60000 ms. No utiliza navegador ni bases reales. El reporte continúa en `temporal/liquidacion-audit-fechas-lima/resultados.json`, con registros, grupos, issues y observaciones. Se conserva el campo histórico `date: "2026-10-06"` del fixture: no identifica la fecha de esta ejecución. Las observaciones documentadas no se convierten en reglas aprobadas ni se ocultan para hacer pasar pruebas.

## Comprobaciones

Node portable verificado: `v24.21.0`, `D:\Herramientas\node-v24.21.0-win-x64\node.exe`.

Antes de crear el destino se verificó SHA-256 del original contra la línea base del paso 1. Además se ejecutó de nuevo únicamente la auditoría original con Jest para capturar un reporte financiero actual antes de ejecutar Vitest. Las ejecuciones se mantienen secuenciales porque escriben el mismo destino de reporte; cada resultado se copia a su artefacto local antes del siguiente.

Comandos de referencia (con `CI=true` para Vitest):

```powershell
npm.cmd test -- --ci --runInBand --runTestsByPath tests/unit/services/admin/factoringliquidacion.audit.test.ts --json --outputFile=coverage/jest-migration-step3-group7/jest.json
npm.cmd run test:vitest -- tests/vitest/migrated/unit/services/admin/factoringliquidacion.audit.test.ts --reporter=json --outputFile=coverage/jest-migration-step3-group7/results.json
npm.cmd run test:vitest:typecheck
npm.cmd run typecheck:jest
```

Los logs y reportes completos se conservan en `coverage/jest-migration-step3-group7/`, ignorados por Git. Los conteos de casos incluyen parametrización y no representan cobertura, MariaDB real ni E2E. No se modifican fuentes de producción, fórmulas, dependencias ni lockfile; no se ejecutan build, cobertura, runtime ni build-prod.

## Resultados

- Jest focalizado actual: salida 0; 2262/2262 pruebas aprobadas, coincidentes con la línea base del paso 1.
- Vitest focalizado: salida 0; mismas 2262 pruebas, nombres y estados.
- Reporte financiero Jest/Vitest: igualdad del contenido completo tras ordenar registros por ID; 2281 registros. Incluye 20 entradas frontend dentro de una sola prueba, por lo que no equivale al conteo de casos del runner.
- Sin issues. Observaciones conservadas: `REDONDEO_DIARIO` (360), `DESCUENTO_MAYOR_SIN_CARGO_POR_INICIO_DISTINTO` (2), `ABONO_PUNTUAL_POR_INICIO_DISTINTO` (2). Estos resultados corresponden a esta ejecución y no aprueban nuevas reglas financieras.
- Comparación de tokens de código: coincide con la adaptación limitada a imports/API/tipos/importActual y formato. Evidencia compacta: [comparación del grupo](migracion-jest-vitest-grupo7-20261010.json).
- El original se retiró después de comprobar casos y reporte. Tipos Vitest y Jest posteriores al traslado: aprobados. Prettier del destino: aprobado.
- Las ejecuciones Jest/Vitest se realizaron fuera de la restricción `EPERM realpath` comprobada en pasos anteriores.
- Vitest completo (`npm.cmd run test:vitest -- --reporter=json --outputFile=coverage/jest-migration-step3-group7/full.json`, con `CI=true`): salida 0, 35 archivos, 3500 aprobados y 3 `todo`. Casos preexistentes comparados por archivo/nombre/estado con el grupo anterior: sin diferencias. El reporte de auditoría generado en el conjunto también coincide con el focal. `git diff --check`: aprobado.

## Siguiente paso del plan

Migrar las últimas suites seleccionadas de Jest: `tests/unit/services/tipocambio.Service.test.ts` y `tests/e2e/example.test.ts`. Mantener explícita la exclusión de `tests/e2e/index.test.ts`; después comprobar la correspondencia completa de la línea base antes de retirar dependencias y configuración Jest.
