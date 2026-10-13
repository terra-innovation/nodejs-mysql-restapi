# Paso 6: validación final de la retirada de Jest

Fecha: 2026-10-10. Validación local Windows x64 con Node portable 24.21.0,
verificando versión y ejecutable antes de cada sesión de comprobación.

La validación rápida, cobertura, lint, formato, compilación, integración MariaDB
y runtime aprobaron. El bloqueo inicial de Docker se resolvió en la continuación:
el diagnóstico aprobó antes de ejecutar la selección completa. El plan local de
migración queda completado; no se presenta evidencia histórica como actual.

## Resultados actuales

| Control                           | Resultado                                                                                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test:vitest:ci`          | Salida 0; 37 archivos: 36 aprobados y uno con solo `todo`. 3.505 casos aprobados, tres `todo`, ningún fallo; cobertura y JUnit generados.    |
| Cobertura V8                      | Líneas 72,01 %, sentencias 71,86 %, ramas 67,28 %, funciones 60,07 %. Aprobaron los umbrales globales y específicos sin cambios.             |
| `npm run lint`                    | Salida 0; ningún error, 346 advertencias. No se aplicaron correcciones automáticas.                                                          |
| `npm run format:changed`          | Salida 0; 17 archivos comprobados, ninguno con diferencias. Su selección no incluye todos los documentos Markdown.                           |
| TypeScript y compilación aislada  | `node node_modules/@typescript/native/bin/tsc --noEmit` y tsdown aprobaron; 12 archivos generados en `coverage/jest-migration-step6-build/`. |
| `npm run test:integration:doctor` | Aprobado en la continuación; Docker Linux disponible y snapshot de 127 tablas íntegro.                                                       |
| Integración MariaDB y runtime     | Salida 0; 523 casos aprobados en 16 archivos, incluidos los dos de runtime. MariaDB 11.4.10 desechable y limpieza confirmada.                |
| GitHub Actions / Linux ARM64      | No ejecutados en este paso.                                                                                                                  |

La cobertura corresponde a los archivos instrumentados en `vitest.config.ts`,
no a todo el backend. La selección rápida utiliza los mocks existentes; no
demuestra persistencia SQL ni E2E de navegador por sí sola. La ejecución MariaDB
separada sí comprueba su selección SQL real. Runtime verificó arranque HTTP/Prisma,
cierre y rechazo de credenciales; en Windows el hook SIGTERM se activa mediante
un puente IPC, por lo que no certifica entrega nativa de señales en Linux.

## Revisión de la migración

- Se conservan los 2.923 casos originales de las 15 suites de Jest y las pruebas
  Vitest previas. La correspondencia exacta de nombres y estados después de
  desinstalar está en el [resultado del paso 5](migracion-jest-vitest-paso5-20261010.json).
  Los controles de tipos de backend, Vitest e integración aprobaron en ese paso;
  en este paso se volvió a comprobar el código del backend para compilarlo.
- No quedan APIs de Jest, imports de Jest ni referencias a su configuración en
  los archivos ejecutables revisados de pruebas, scripts y CI. El lockfile no
  contiene Jest, ts-jest ni @types/jest. Las menciones históricas y el nombre del
  ejemplo básico se conservan.
- El diff de `src/` contiene únicamente la guía de arquitectura; la migración
  no modifica implementación de negocio, contratos HTTP ni reglas financieras.
- La exclusión de `tests/vitest/migrated/e2e/index.test.ts`, los tres criterios
  `todo`, la selección de cobertura y sus umbrales permanecen vigentes.
- El workflow conserva la verificación del contrato frontend, cobertura y JUnit
  en el único paso de pruebas rápidas; integración sigue usando el runner aislado.

Logs y artefactos locales ignorados por Git: `coverage/jest-migration-step6-*.log`,
`coverage/vitest/junit.xml`, `coverage/vitest/coverage-summary.json` y el HTML de
cobertura en `coverage/vitest/`. La continuación actualizó `coverage/mariadb/last-run.json`
y generó el reporte runtime del mismo identificador. Se conservó un resumen
versionable en [evidencia de cierre](migracion-jest-vitest-cierre-20261010.json).
No se modificó `dist`, no se ejecutó `build-prod` ni se consultaron bases compartidas.

## Cierre local del plan

`npm.cmd run test:integration` con `CI=true` aprobó el 2026-10-10: 523 casos en
16 archivos y 375,89 segundos de Vitest. El runner comenzó a las 19:50:10 UTC y
terminó a las 19:56:42 UTC. Identificador: `ad54b443af591c9e9847e40d`.

`last-run.json` registra `status: passed` y `cleanup: removed`; una consulta
posterior confirmó que no existe el contenedor propio. El reporte runtime del
mismo identificador registra sus dos casos aprobados y compilación aislada con
Node 24.21.0 en Windows x64. No se repitió `test:runtime`, ya incluido en la
selección general. `CI` se estableció únicamente en el proceso de comandos.

La migración a Vitest y la retirada de Jest quedan validadas localmente.
Permanecen los tres `todo` de negocio; no son fallos ni casos aprobados.
GitHub Actions para esta revisión y Linux ARM64 no se ejecutaron: son evidencias
separadas, sin atribuirles el resultado local. No se creó un commit ni se publicó
la rama como parte de este cierre.
