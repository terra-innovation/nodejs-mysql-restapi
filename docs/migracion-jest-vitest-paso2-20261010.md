# Migración Jest → Vitest: preparación de la configuración

Fecha: 2026-10-10 (America/Lima). Paso 2 completado; no se migraron suites ni se retiraron dependencias.

## Cambios y decisiones

- `vitest.config.ts` incorpora exclusivamente pruebas convertidas bajo `tests/vitest/migrated/` (`.test.ts`, `.spec.ts` y `__tests__/**/*.ts`). Los originales de `tests/unit/` y `tests/e2e/` continúan en Jest.
- Se conservan las exclusiones predeterminadas de Vitest y se explicitan manuales, MariaDB y `tests/vitest/migrated/e2e/index.test.ts`. La última conserva la exclusión de Jest si ese archivo se traslada después.
- Se conservan aliases ESM, imports explícitos (`globals: false`), aislamiento por archivo, cuatro workers, limpieza/restauración de mocks y stubs, rechazo de `.only` en CI y fallo cuando la selección no contiene pruebas. No se modifican umbrales de cobertura.
- `tests/vitest/tsconfig.json` ya incluye recursivamente la carpeta destino y sus soportes; no requiere cambios ni tipos globales Jest.
- No se instala un mock global de `file-type`: hay pruebas existentes de detección real. Las suites que lo simulen deben declarar su factory local.
- No se traslada el setup Jest (solo imprime mensajes) ni el transformador exclusivo de ts-jest. Los hooks funcionales, factories ESM, temporizadores y estados Luxon se adaptarán por suite.
- Las suites mantendrán la ruta relativa de origen dentro de `migrated/`, para comparar con la [línea base Jest](migracion-jest-vitest-linea-base-20261010.json). La [guía de incorporación](../tests/vitest/migrated/README.md) recoge comandos y puntos de adaptación.

La carpeta nueva contiene solo documentación. El paso 3 deberá adaptar las pruebas antes de incorporarlas; copiar código Jest sin convertir no lo hace compatible con Vitest.

## Validación actual

Ejecutada con Node `v24.21.0` portable de `D:\Herramientas\node-v24.21.0-win-x64\node.exe`, verificando versión y ruta. El árbol de trabajo ya contenía los dos informes del paso 1; se conservaron.

| Comprobación | Resultado |
| --- | --- |
| Vitest antes del cambio, `CI=true`, reporte JSON | Salida 0; 22 archivos, 582 aprobados y 3 `todo` |
| Misma selección Vitest después | Salida 0; mismos archivos, nombres completos de casos y estados |
| `npm.cmd run test:vitest:typecheck` | Salida 0 |
| `npm.cmd run test:integration:typecheck` | Salida 0; incluye la configuración MariaDB que reutiliza `base.resolve` |
| `npx.cmd --no-install prettier --check vitest.config.ts` | Salida 0 |

Antes/después: `npm.cmd run test:vitest -- --reporter=json --outputFile=coverage/jest-migration-step2/{before,after}.json` (ejecutar una ruta concreta cada vez). Comparación por archivo, nombre completo y estado guardada en `coverage/jest-migration-step2/comparison.json`; logs locales en la misma carpeta, ignorados por Git.

El primer intento dentro del sandbox falló con `EPERM realpath` antes de ejecutar casos; la selección anterior y posterior se ejecutó satisfactoriamente fuera de esa restricción. Los conteos parametrizados no son cobertura. No se ejecutaron Jest nuevamente, MariaDB real, runtime, cobertura, build ni build-prod. No se modificaron pruebas, lógica de negocio, package.json ni lockfile.

## Siguiente paso del plan

Migrar el primer grupo: calculadora de Factoring y utilidades de fechas, preservando casos y expectativas de Jest. Ejecutar tipos y el grupo convertido, comparar con la línea base y revisar la restauración de zonas Luxon antes de continuar con servicios.

Referencia técnica consultada: [Vitest: guía oficial de migración](https://main.vitest.dev/guide/migration/), especialmente imports explícitos, factories, hoisting y `vi.importActual`.
