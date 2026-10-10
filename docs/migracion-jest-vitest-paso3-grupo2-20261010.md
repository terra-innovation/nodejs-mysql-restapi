# Migración Jest → Vitest: facturas financiero y accesos

Fecha: 2026-10-10 (America/Lima). Paso 3 en curso: segundo grupo completado, con validación focalizada del paso 4.

## Cambios

| Origen retirado de Jest | Destino Vitest | Casos |
| --- | --- | ---: |
| `tests/unit/services/financiero/factura.Service.test.ts` | `tests/vitest/migrated/unit/services/financiero/factura.Service.test.ts` | 6 |
| `tests/unit/services/secure/accesos.Service.test.ts` | `tests/vitest/migrated/unit/services/secure/accesos.Service.test.ts` | 11 |

Se añadieron imports explícitos Vitest y se adaptaron `jest.mock`, `jest.fn`, `jest.clearAllMocks` y `jest.Mock` a `vi.mock`, `vi.fn`, `vi.clearAllMocks` y el tipo `Mock`. Las factories son autocontenidas, sin referencias externas que requieran `vi.hoisted`; la transacción simulada de accesos conserva el mismo cliente.

Se conservaron datos, nombres, parámetros, expectativas y comportamiento. No se modificaron reglas de autenticación, roles, vigencias, propiedad de suscripciones, filtrado de datos privados, límite por usuario ni cabeceras HTTP. Prisma permanece simulado; JWT, Express, limitador y Supertest se ejecutan como en la suite original. No se cambió código de producción ni dependencias.

Antes de crear los destinos se verificaron hashes SHA-256 de los originales contra la línea base del paso 1. Antes de retirarlos se compararon nombres y estados de todos los casos. El contenido final coincide exactamente con la transformación limitada a imports/API/tipos Vitest y formato Prettier aplicada al original. La comprobación preliminar por tokens no toleró paréntesis añadidos por formato; se sustituyó por comparación exacta contra la transformación formateada, sin cambiar expectativas ni pruebas para obtener coincidencia.

Evidencia compacta: [comparación del grupo](migracion-jest-vitest-grupo2-20261010.json). Los dos originales se retiraron solo después de estas comprobaciones.

## Validación actual

Node portable verificado: `v24.21.0`, `D:\Herramientas\node-v24.21.0-win-x64\node.exe`.

- Grupo convertido: `npm.cmd run test:vitest -- tests/vitest/migrated/unit/services/financiero/factura.Service.test.ts tests/vitest/migrated/unit/services/secure/accesos.Service.test.ts --reporter=json --outputFile=coverage/jest-migration-step3-group2/results.json`, con `CI=true`: salida 0, 17/17 casos aprobados.
- Vitest completo: `npm.cmd run test:vitest -- --reporter=json --outputFile=coverage/jest-migration-step3-group2/full.json`, con `CI=true`: salida 0, 26 archivos, 654 casos aprobados y 3 `todo`. Comparados archivos/nombres/estados preexistentes con el resultado del grupo anterior: sin diferencias.
- `npm.cmd run test:vitest:typecheck`: aprobado antes y después del traslado.
- `npm.cmd run typecheck:jest`: aprobado después de retirar originales.
- Prettier de ambos destinos y `git diff --check`: aprobados.

Vitest se ejecutó fuera de la restricción `EPERM realpath` comprobada en pasos anteriores. Logs y JSON brutos en `coverage/jest-migration-step3-group2/`, ignorados por Git. La línea base Jest se conserva sin editar; no se repitió la selección completa Jest porque se verificaron hashes de los originales y no cambió producción ni el resto de las suites. No se ejecutaron build, cobertura, integración MariaDB real, runtime ni build-prod. Las pruebas HTTP locales con persistencia simulada no son E2E de navegador.

## Siguiente paso del plan

Continuar con servicios de archivos de usuario y rutas de detalle de empresa en Factoring: adaptar el mock local de `file-type`, filesystem y factories de Prisma/DAOs; conservar casos y expectativas y contrastar con la línea base antes de retirar originales. PDF y auditorías extensas siguen para grupos posteriores.
