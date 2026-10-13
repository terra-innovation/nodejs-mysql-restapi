# Migración Jest → Vitest: últimas suites y correspondencia completa

Fecha: 2026-10-10 (America/Lima). Octavo grupo del paso 3, con comprobaciones de equivalencia del paso 4.

## Cambios

| Origen retirado | Destino Vitest | Alcance |
| --- | --- | --- |
| `tests/unit/services/tipocambio.Service.test.ts` | `tests/vitest/migrated/unit/services/tipocambio.Service.test.ts` | 3 casos |
| `tests/e2e/example.test.ts` | `tests/vitest/migrated/e2e/example.test.ts` | 2 casos |
| `tests/e2e/index.test.ts` | `tests/vitest/migrated/e2e/index.test.ts` | 2 casos excluidos, sin ejecutar |

La adaptación agrega imports explícitos Vitest y formato. No se modifican datos, funciones bajo prueba, expectativas, mocks ni hooks. El nombre histórico `Basic Jest test example` se conserva para comparar con la línea base; sus dos aserciones triviales no demuestran E2E. Tipo de cambio sigue probando las funciones reales `parseFechaLima` y `generateCode`, sin consultar bases ni APIs como parte de los casos.

Se verificaron hashes SHA-256 de los tres originales contra el inventario del paso 1 antes de crear los destinos. Los cinco casos seleccionados coinciden en nombre/estado y el contenido final coincide con original + imports y Prettier. La suite HTTP `index.test.ts` también se adapta para eliminar su dependencia de tipos globales Jest, manteniendo intacta su exclusión; no se valida su comportamiento en este grupo. Evidencia: [comparación del grupo](migracion-jest-vitest-grupo8-20261010.json).

No se modificaron producción, permisos, fórmulas, dependencias ni lockfile. Las configuraciones Jest, setup y mock/transformador exclusivos se conservan hasta el paso 5.

## Validación

Node portable verificado: `v24.21.0`, `D:\Herramientas\node-v24.21.0-win-x64\node.exe`.

- Grupo: `npm.cmd run test:vitest -- tests/vitest/migrated/unit/services/tipocambio.Service.test.ts tests/vitest/migrated/e2e --reporter=json --outputFile=coverage/jest-migration-step3-group8/results.json`, con `CI=true`: salida 0, 5/5 aprobados; el filtro e2e no ejecutó `index.test.ts`.
- `npm.cmd run test:vitest:typecheck`: aprobado antes y después del traslado; incluye la suite excluida, sin certificar su ejecución.
- `npm.cmd run typecheck:jest`: aprobado después del traslado.
- Prettier de los tres destinos: aprobado.
- Vitest completo: `npm.cmd run test:vitest -- --reporter=json --outputFile=coverage/jest-migration-step3-group8/full.json`, con `CI=true`: salida 0; 37 archivos, 3505 casos aprobados y 3 `todo`. Casos preexistentes comparados por archivo/nombre/estado con el grupo anterior: sin diferencias.
- Correspondencia completa: las 15 suites y 2923 casos de la línea base Jest tienen destino único en Vitest, con nombres y estados idénticos. No quedan originales duplicados; el destino excluido existe y no se ejecutó. Evidencia: [correspondencia completa](migracion-jest-vitest-correspondencia-completa-20261010.json).
- `npm.cmd test -- --listTests --runInBand --json`: salida 0; inventario vacío `[]`. No se ejecutó `npm test` sin filtros para evitar confundir ausencia de pruebas con fallo de migración.
- Sin referencias activas a `jest.*`/`@jest` en las fuentes migradas. `git diff --check`: aprobado.

Los pasos 3 (migración por grupos) y 4 (validación y correspondencia con la línea base) quedan completados para la selección original. La retirada de Jest y los controles finales aún están pendientes.

Vitest y descubrimiento Jest se ejecutan fuera de la restricción `EPERM realpath` ya comprobada. Logs/resultados en `coverage/jest-migration-step3-group8/`, ignorados por Git. No se ejecutan cobertura, build, MariaDB real, runtime ni build-prod. Durante esta transición `npm test` sigue apuntando a Jest: utilizar `npm.cmd run test:vitest` hasta actualizar scripts en el paso 5; no ocultar la ausencia de pruebas con `passWithNoTests`.

## Siguiente paso del plan

Paso 5: retirar `jest`, `ts-jest`, `@types/jest`, configuraciones y soportes exclusivos; actualizar scripts, CI y documentación para que `npm test` use Vitest. Conservar la suite HTTP excluida y la API TypeScript de compatibilidad que tiene consumidores ajenos a Jest. Después ejecutar las comprobaciones finales proporcionales del paso 6.
