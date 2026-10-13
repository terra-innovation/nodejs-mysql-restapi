# Migración Jest → Vitest: liquidación y fechas de PDF

Fecha: 2026-10-10 (America/Lima). Paso 3 en curso: quinto grupo completado, con validación focalizada del paso 4.

## Cambios

| Origen retirado de Jest | Destino Vitest | Casos |
| --- | --- | ---: |
| `tests/unit/services/admin/factoringliquidacion.Service.test.ts` | `tests/vitest/migrated/unit/services/admin/factoringliquidacion.Service.test.ts` | 15 |
| `tests/unit/utils/document/PDFgenerator.dates.test.ts` | `tests/vitest/migrated/unit/utils/document/PDFgenerator.dates.test.ts` | 20 |

Se incorporaron imports explícitos Vitest y se adaptaron factories, funciones, tipos, limpieza y espías. Se conservaron montos, cálculos esperados, DAOs/transacciones simulados y validaciones de propuesta aceptada/fecha de inicio con errores 400 y ausencia de escrituras.

Los 12 casos parametrizados de requisitos de liquidación usaban `%p`. Vitest no lo interpreta igual que Jest y su interpolación `$label` truncó etiquetas largas en el primer intento. Se registran ahora individualmente mediante bucles sobre las mismas entradas, con títulos completos derivados de sus valores: se distinguen `null`, `undefined`, texto vacío y fechas. No se cambian datos de entrada, cuerpos de pruebas ni expectativas. La comparación final conserva todos los nombres y estados originales, sin truncamiento ni colisiones.

La suite PDF mantiene el renderizador real y `vi.spyOn(PDFDocument.prototype, "table")` sin sustituir su implementación. Genera simulaciones y propuestas bajo UTC/Lima en `temporal/simulacion-fechas/pdf`, comprueba datos de tablas, firma `%PDF-` y tamaño mayor a 1000 bytes. Se mantiene restauración de espías, zona y cachés Luxon. No se añadieron verificaciones de contenido visual renderizado ni snapshots.

Antes de crear destinos se verificaron hashes SHA-256 de originales contra la línea base del paso 1. Antes de retirarlos se compararon nombres/estados y tokens de código contra la adaptación explícita de imports/API/tipos, registro de títulos y formato. Evidencia compacta: [comparación del grupo](migracion-jest-vitest-grupo5-20261010.json). No se modificaron producción, contratos, fórmulas, redondeos ni dependencias.

## Validación actual

Node portable verificado: `v24.21.0`, `D:\Herramientas\node-v24.21.0-win-x64\node.exe`.

- Grupo: `npm.cmd run test:vitest -- tests/vitest/migrated/unit/services/admin/factoringliquidacion.Service.test.ts tests/vitest/migrated/unit/utils/document/PDFgenerator.dates.test.ts --reporter=json --outputFile=coverage/jest-migration-step3-group5/results.json`, con `CI=true`: salida 0, 35/35 casos aprobados; nombres/estados coincidentes con Jest.
- Vitest completo: `npm.cmd run test:vitest -- --reporter=json --outputFile=coverage/jest-migration-step3-group5/full.json`, con `CI=true`: salida 0, 32 archivos, 730 casos aprobados y 3 `todo`. Casos preexistentes comparados por archivo/nombre/estado con el grupo anterior: sin diferencias.
- `npm.cmd run test:vitest:typecheck`: aprobado antes y después de retirar originales.
- `npm.cmd run typecheck:jest`: aprobado después del traslado.
- Prettier de ambos destinos y `git diff --check`: aprobados.

Vitest se ejecutó fuera de la restricción `EPERM realpath` comprobada en pasos anteriores. Logs/resultados brutos en `coverage/jest-migration-step3-group5/`, ignorados por Git. No se repitió Jest completo; los hashes verifican vigencia de los originales frente a su línea base. No se ejecutaron cobertura, build, MariaDB real, runtime ni build-prod. Los PDFs generados no certifican revisión visual ni las transacciones simuladas integración real.

## Siguiente paso del plan

Migrar trazabilidad de Factoring y fechas de simulación (`tests/unit/services/factoring.dateTrace.test.ts`, `tests/unit/services/admin/factoringsimulacion.dates.test.ts`): conservar temporizadores, `Settings.now`, zonas/cachés, cálculos y procesos auxiliares. Después quedan la auditoría extensa de liquidación y las suites pequeñas de tipo de cambio/ejemplo antes de retirar Jest.
