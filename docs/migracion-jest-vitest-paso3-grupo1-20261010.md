# Migración Jest → Vitest: primer grupo

Fecha: 2026-10-10 (America/Lima). Paso 3 en curso: completado el grupo de calculadora y utilidades de fechas, con validación focalizada del paso 4.

## Cambios

Se trasladaron, después de verificar equivalencia:

| Origen retirado de Jest | Destino Vitest | Casos |
| --- | --- | ---: |
| `tests/unit/domain/factoring/factoring.Calculator.test.ts` | `tests/vitest/migrated/unit/domain/factoring/factoring.Calculator.test.ts` | 10 |
| `tests/unit/utils/dateUtils.test.ts` | `tests/vitest/migrated/unit/utils/dateUtils.test.ts` | 45 |

La adaptación consiste en imports explícitos de `describe`, `it`, `expect` y, en fechas, `afterEach` desde Vitest, y formato del proyecto. Se conservaron cuerpos, datos, parametrización, nombres, expectativas financieras, versiones V1/V2/V3 y restauración de `Settings.defaultZone`. No se fusionaron con las suites Vitest ya existentes ni se cambió código de producción. Jest y sus dependencias siguen instalados para el resto de las suites.

Antes de crear los destinos se verificó que los hashes SHA-256 de ambos originales coincidieran con la línea base del paso 1. Antes de retirarlos se compararon nombres y estados de todos sus casos con esa línea base. También se compararon tokens de código, ignorando trivia y comas de formato, después de excluir únicamente el nuevo import Vitest. Resultado: contenido equivalente, sin cambios en expectativas. Evidencia compacta: [comparación del grupo](migracion-jest-vitest-grupo1-20261010.json).

## Validación actual

Node portable verificado: `v24.21.0`, `D:\Herramientas\node-v24.21.0-win-x64\node.exe`.

- Grupo migrado: `CI=true npm.cmd run test:vitest -- tests/vitest/migrated --reporter=json --outputFile=coverage/jest-migration-step3-group1/results.json`: salida 0; 2 archivos y 55 casos aprobados, coincidentes con la selección Jest del paso 1.
- Selección completa después del traslado: `npm.cmd run test:vitest -- --reporter=json --outputFile=coverage/jest-migration-step3-group1/full.json`, con `CI=true`: salida 0; 24 archivos, 637 casos aprobados y los 3 `todo` existentes.
- `npm.cmd run test:vitest:typecheck`: aprobado, incluyendo los dos destinos.
- `npm.cmd run typecheck:jest`: aprobado después de retirar los dos originales.
- Prettier de ambos destinos: aprobado.

Los procesos Vitest se ejecutaron fuera de la restricción `EPERM realpath` ya comprobada en los pasos anteriores. Logs y resultados brutos en `coverage/jest-migration-step3-group1/`, ignorados por Git. La selección completa comprueba los archivos formateados definitivos.

No se ejecutó nuevamente la suite completa Jest: la comparación de los dos originales usa la línea base vigente del paso 1, con hashes verificados; los cambios no afectan producción ni las demás pruebas Jest. No se ejecutaron build, cobertura, integración real MariaDB, runtime o build-prod. Los conteos parametrizados no certifican cobertura ni E2E.

## Siguiente paso del plan

Continuar el paso 3 con servicios: empezar por delegación de facturas del rol financiero y accesos, adaptar factories y tipos de mocks, y comparar cada grupo con sus casos de la línea base antes de retirar originales. Dejar PDF y auditorías extensas para grupos posteriores.
