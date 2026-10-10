# Migración Jest → Vitest: archivos y detalle de empresa

Fecha: 2026-10-10 (America/Lima). Paso 3 en curso: tercer grupo completado, con validación focalizada del paso 4.

## Cambios

| Origen retirado de Jest | Destino Vitest | Casos |
| --- | --- | ---: |
| `tests/unit/services/usuario/archivo.Service.test.ts` | `tests/vitest/migrated/unit/services/usuario/archivo.Service.test.ts` | 8 |
| `tests/unit/routes/factoringEmpresaDetalle.test.ts` | `tests/vitest/migrated/unit/routes/factoringEmpresaDetalle.test.ts` | 24 |

Se incorporaron imports explícitos de Vitest y se adaptaron factories, funciones, limpieza y tipos de mocks de Jest a Vitest. Las factories conservan sus dependencias autocontenidas; no requieren `vi.hoisted`.

En archivos se declaró `vi.mock("file-type", () => ({ fileTypeFromFile: vi.fn() }))` dentro de la suite, sustituyendo el mapeo global de Jest. Los mocks de `fs`, `fs/promises`, Prisma y DAOs se conservaron. La prueba no copia ni elimina archivos reales. Las demás suites de MIME real no reciben este mock.

En detalle de empresa se conservaron routers de administrador/financiero, Express, JWT, Supertest, manejo de errores real y persistencia simulada. Se mantienen casos de autenticación, separación de roles, selección de campos, pertenencia a operaciones consultables, validación de IDs, respuestas 404/500 y ausencia de escrituras al consultar. No se cambió código de producción, permisos, contratos ni dependencias.

Antes de crear destinos se verificaron hashes SHA-256 de originales contra la línea base del paso 1. Antes de retirarlos se compararon todos los nombres y estados. El contenido final coincide exactamente con la transformación limitada a imports/API/tipos Vitest, mock local MIME y formato Prettier aplicada al original. Se conservaron datos, parámetros y expectativas. Evidencia compacta: [comparación del grupo](migracion-jest-vitest-grupo3-20261010.json).

## Validación actual

Node portable verificado: `v24.21.0`, `D:\Herramientas\node-v24.21.0-win-x64\node.exe`.

- Grupo convertido: `npm.cmd run test:vitest -- tests/vitest/migrated/unit/services/usuario/archivo.Service.test.ts tests/vitest/migrated/unit/routes/factoringEmpresaDetalle.test.ts --reporter=json --outputFile=coverage/jest-migration-step3-group3/results.json`, con `CI=true`: salida 0, 32/32 casos aprobados.
- Vitest completo: `npm.cmd run test:vitest -- --reporter=json --outputFile=coverage/jest-migration-step3-group3/full.json`, con `CI=true`: salida 0, 28 archivos, 686 casos aprobados y 3 `todo`. Comparados archivos, nombres y estados preexistentes con el grupo anterior: sin diferencias, incluidas suites de detección real de archivos.
- `npm.cmd run test:vitest:typecheck`: aprobado antes y después de retirar originales.
- `npm.cmd run typecheck:jest`: aprobado después del traslado.
- Prettier de ambos destinos y `git diff --check`: aprobados.

Vitest se ejecutó fuera de la restricción `EPERM realpath` comprobada en pasos anteriores. Resultados brutos y logs en `coverage/jest-migration-step3-group3/`, ignorados por Git. No se repitió Jest completo: se verificaron hashes de los originales contra su línea base y no cambió producción ni el resto de las suites. No se ejecutaron cobertura, build, integración MariaDB real, runtime ni build-prod. Los resultados con persistencia/MIME/filesystem simulados no prueban almacenamiento real ni E2E de navegador.

## Siguiente paso del plan

Migrar los servicios de creación de Factoring y propuestas (`tests/unit/services/factoring.Service.test.ts` y `tests/unit/services/admin/factoringpropuesta.Service.test.ts`), conservando transacciones simuladas y expectativas financieras y comparando casos con la línea base. Las suites extensas de fechas/auditoría y PDF continúan en grupos posteriores.
