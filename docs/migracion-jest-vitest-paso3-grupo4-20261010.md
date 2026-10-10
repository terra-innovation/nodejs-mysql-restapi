# Migración Jest → Vitest: simulación de Factoring y propuestas

Fecha: 2026-10-10 (America/Lima). Paso 3 en curso: cuarto grupo completado, con validación focalizada del paso 4.

## Cambios

| Origen retirado de Jest | Destino Vitest | Casos |
| --- | --- | ---: |
| `tests/unit/services/factoring.Service.test.ts` | `tests/vitest/migrated/unit/services/factoring.Service.test.ts` | 1 |
| `tests/unit/services/admin/factoringpropuesta.Service.test.ts` | `tests/vitest/migrated/unit/services/admin/factoringpropuesta.Service.test.ts` | 8 |

El primer archivo, pese a su nombre, verifica `simulateFactoringLogicV4`, no creación persistente de una operación. Se conservan sus tasas, montos, días y fixtures. La segunda suite conserva simulación y creación de propuesta/desglose mediante DAOs simulados, fechas Lima/UTC y rechazos 404 en activación/eliminación.

Se incorporaron imports explícitos de Vitest y equivalentes de factories, funciones, limpieza y tipos de mocks. La factory de configuración de comisión ahora es asíncrona y obtiene `Decimal` con `vi.importActual` antes de crear los valores: no puede depender de un import externo aún sin inicializar por el hoisting de Vitest.

Vitest dejó `%p` literal en cuatro nombres parametrizados. Se añadió una etiqueta derivada exclusivamente del parámetro original: strings con `JSON.stringify`, Date con `toISOString`; el título utiliza `$label`. Los cuatro parámetros, su tipo string/Date y las expectativas se mantienen. Así coinciden exactamente los nombres con Jest, sin fusionar casos distintos.

Antes de crear destinos se verificaron hashes SHA-256 de originales contra la línea base del paso 1. Antes de retirarlos se compararon todos los nombres/estados y tokens de código contra la transformación explícita anterior, ignorando trivia/comas de formato. Las comparaciones preliminares detectaron el título `%p` y diferencias de formato; la comparación definitiva aprobó, sin debilitar expectativas. Evidencia: [comparación del grupo](migracion-jest-vitest-grupo4-20261010.json).

No se modificó producción, contratos, fórmulas, redondeos ni dependencias. Prisma y DAOs permanecen simulados como en los originales.

## Validación actual

Node portable verificado: `v24.21.0`, `D:\Herramientas\node-v24.21.0-win-x64\node.exe`.

- Grupo: `npm.cmd run test:vitest -- tests/vitest/migrated/unit/services/factoring.Service.test.ts tests/vitest/migrated/unit/services/admin/factoringpropuesta.Service.test.ts --reporter=json --outputFile=coverage/jest-migration-step3-group4/results.json`, con `CI=true`: salida 0, 9/9 casos aprobados; nombres y estados coincidentes con Jest.
- Vitest completo: `npm.cmd run test:vitest -- --reporter=json --outputFile=coverage/jest-migration-step3-group4/full.json`, con `CI=true`: salida 0, 30 archivos, 695 casos aprobados y 3 `todo`. Archivos, nombres y estados preexistentes comparados con el grupo anterior: sin diferencias.
- `npm.cmd run test:vitest:typecheck`: aprobado antes y después del traslado.
- `npm.cmd run typecheck:jest`: aprobado después de retirar originales.
- Prettier de ambos destinos y `git diff --check`: aprobados.

Vitest se ejecutó fuera de la restricción `EPERM realpath` comprobada en pasos anteriores. Resultados/logs en `coverage/jest-migration-step3-group4/`, ignorados por Git. No se repitió Jest completo; se verificaron hashes contra su línea base. No se ejecutaron cobertura, build, MariaDB real, runtime ni build-prod. La persistencia simulada no certifica integración real ni E2E.

## Siguiente paso del plan

Migrar `tests/unit/services/admin/factoringliquidacion.Service.test.ts` y `tests/unit/utils/document/PDFgenerator.dates.test.ts`: conservar cálculos, fechas, mocks de transacciones y generación local de PDF, adaptar espías y comprobar equivalencia antes de retirar originales. Las auditorías extensas y trazabilidad de fechas quedan para el siguiente grupo.
