# Línea base para integración continua del backend

Fecha: 10 de octubre de 2026, America/Lima. Punto 1 del plan de CI.

## Alcance y referencia

Se inspeccionaron configuración, selecciones de pruebas y evidencia previa; se ejecutaron exclusivamente comprobaciones de tipos y lint sin escritura sobre fuentes. No se ejecutaron pruebas, cobertura, compilación, generación Prisma, instalación, auditoría npm, Docker, conexiones a bases compartidas ni empaquetado de producción.

Referencia: rama `master`, commit `b2825bb9538258b4afe40aa5dbd0f9ab704462c2`. El árbol estaba limpio antes del trabajo. Entorno verificado: Node `24.21.0` portable en `D:\Herramientas\node-v24.21.0-win-x64\node.exe`, npm `11.19.0`, Windows. No se certifica ejecución en Linux ni una instalación limpia.

El [registro de evidencia](linea-base-20261010.json) conserva comandos, salidas, tiempos locales, huellas de configuración y manifiesto de archivos de pruebas. Los hashes permiten detectar cambios respecto de esta captura; no certifican resultados históricos. Diagnóstico completo regenerable, ignorado por Git: `coverage/ci-baseline/20261010/`.

## Resultado actual y decisión para CI

| Control | Resultado observado ahora | Decisión |
| --- | --- | --- |
| Tipos del backend | Aprobado, salida 0 | Candidato a obligatorio; en CI generar primero el cliente Prisma |
| Tipos de Jest | Aprobado, salida 0 | Candidato a obligatorio; comando independiente pendiente |
| Tipos de Vitest | Aprobado, salida 0 | Candidato a obligatorio; script existente |
| Tipos de MariaDB | Aprobado, salida 0 | Candidato a obligatorio; script existente, sin necesitar ejecutar una base |
| ESLint sobre `src` | Fallido, salida 1: 13 errores y 357 advertencias | Resolver los errores antes de exigir un resultado verde; conservar diagnóstico y niveles de reglas |
| Formato | No ejecutable con una dependencia propia del proyecto | Existe `.prettierrc`, pero Prettier no está declarado ni instalado; no instalar como parte de este punto |
| Jest / Vitest / cobertura | No ejecutados | Pendientes de una línea base funcional actual; no declararlos aprobados por compilación |
| MariaDB / runtime compilado | No ejecutados | Pendientes de ejecución aislada y posterior comprobación en Linux |

Las comprobaciones de tipos usan el cliente generado y las dependencias existentes en este equipo. Su resultado no demuestra todavía reproducibilidad desde `npm ci` ni correspondencia de un cliente recién generado.

Comandos ejecutados con Node portable, sin emisión:

```powershell
node node_modules/@typescript/native/bin/tsc --noEmit --pretty false
node node_modules/@typescript/native/bin/tsc --project tests/tsconfig.jest.json --noEmit --pretty false
node node_modules/@typescript/native/bin/tsc --project tests/vitest/tsconfig.json --noEmit --pretty false
node node_modules/@typescript/native/bin/tsc --project tests/mariadb/tsconfig.json --noEmit --pretty false
node node_modules/eslint/bin/eslint.js src --format json
```

Antes de reproducirlos en Windows, activar el portable y verificar versión y ejecutable según `AGENTS.md`. No usar `--fix` para capturar esta línea base.

## Hallazgos de lint

- Cinco errores `no-undef` sobre `Express`, en `src/middlewares/archivoMiddleware.ts` y `src/types/express.d.ts`. Los usos inspeccionados son tipos: revisar la aplicación de la regla JavaScript sobre TypeScript antes de modificar fuentes o declarar un problema de runtime.
- Ocho errores `no-useless-assignment`, en `factoringliquidacion.Service.ts`, `tipocambio.Service.ts` y `empresario/factura.Service.ts`. Revisar cada asignación conservando fórmulas y comportamiento; no aplicar correcciones masivas.
- Advertencias: `no-explicit-any`, `no-unused-vars`, `no-inferrable-types` y duplicación de imports. Su detalle está en la evidencia. No exigir cero advertencias sin una estrategia de adopción y revisión del estado existente.

## Selecciones que deben conservarse

| Runner | Selección efectiva declarada | Exclusiones y límites |
| --- | --- | --- |
| Jest, `npm test` | `tests/unit` y `tests/e2e`, patrones de `jest.config.js` | `tests/e2e/index.test.ts` está excluido expresamente; el nombre e2e no prueba navegador ni persistencia real |
| Vitest rápido, `test:vitest` | `tests/vitest/unit/**/*.test.ts`, `http/**/*.test.ts`, `pending/**/*.test.ts` | Infraestructura simulada; no sustituye comprobación de tipos ni integración SQL |
| Vitest CI, `test:vitest:ci` | Misma selección rápida, con cobertura y JUnit | `CI=true` rechaza `.only`; cobertura limitada a módulos configurados |
| MariaDB, `test:integration` | `tests/mariadb/**/*.test.ts` | Un trabajador, sin paralelismo de archivos; incluye `runtime.test.ts` |
| Runtime, `test:runtime` | `tests/mariadb/runtime.test.ts` mediante el mismo runner aislado | Si ya se ejecutó integración completa, no repetir runtime sin una razón adicional |

`test:all` ejecuta Jest, tipos de Vitest y Vitest rápido. No incluye tipos del backend/Jest/MariaDB, cobertura, lint, formato ni integración. No debe utilizarse como sinónimo de todos los controles de CI.

La inspección textual de los archivos seleccionados encontró tres `it.todo` en `tests/vitest/pending/business-decisions.test.ts`: DT-LIQ-09, DT-TEST-01 y DT-TEST-02. No se detectaron marcadores literales de enfoque u omisión en esa búsqueda. No se ejecutaron los runners: no es una garantía sobre marcadores construidos dinámicamente ni un conteo de casos resueltos. Conservar los pendientes y sus expectativas; no convertirlos en aprobados.

Cobertura configurada: líneas/sentencias/ramas 60 %, funciones 50 %, con umbrales específicos más exigentes para accesos y archivos. Mantener esos valores y su alcance; no extrapolarlos al backend completo ni reducirlos para obtener CI verde.

## Evidencia histórica y sus límites

- [Validación conjunta de liquidación del 09/10](../validacion-conjunta-liquidacion-cierre-20261009.md): selección focalizada aprobada de Jest, Vitest, tipos y MariaDB. Registra avisos de ts-jest y recursos asíncronos abiertos. No acredita aprobación de la selección completa actual.
- El reporte local `coverage/mariadb/last-run.json` leído corresponde a `ab009eee81884a56a73b8959`, entre `2026-10-10T04:17:56.945Z` y `2026-10-10T04:18:38.710Z`, con estado `passed` y limpieza `removed`. El JUnit asociado contiene dos casos. Es evidencia anterior de una selección, no una ejecución de este punto ni de toda MariaDB.
- Los reportes locales de cobertura y JUnit de Vitest rápido tienen fecha del 08/10; preceden las migraciones y cambios recientes. No se utilizan como aprobación actual ni como medición actual de duración/cobertura.
- No trasladar automáticamente los fallos financieros antiguos a CI como excepciones vigentes: el documento de [criterios financieros](../deuda-tecnica/20261006_1451_DT_validaciones_financieras_factoring.md) registra cierres posteriores y DT-LIQ-09 diferida. Una futura ejecución debe comprobar si queda algún fallo y diagnosticarlo sin debilitar aserciones.
- Algunas pruebas documentan defectos existentes, por ejemplo [limitaciones de PDF](../deuda-tecnica/20261008_integracion_PDF.md). Que una caracterización apruebe no significa que el defecto esté corregido.

## Prerrequisitos y bloqueos de adopción

1. Normalizar Node/npm, instalación reproducible y generación Prisma antes de los tipos y runners. No usar secretos de desarrollo/producción para preparar CI.
2. Resolver el lint antes de convertirlo en control obligatorio; adoptar formato con una dependencia local y sin reformateo masivo.
3. Obtener resultados actuales de las mismas selecciones de pruebas, respetando la restricción vigente de no ejecutarlas en esta fase. No fijar tiempos objetivo de CI a partir de reportes antiguos.
4. Reutilizar el esquema MariaDB versionado y verificado por hash, el runner con guardas de propiedad y la limpieza del contenedor propio. No regenerar el snapshot ni ejecutar exportadores/auditorías históricas contra bases compartidas.
5. Verificar Linux al implementar GitHub Actions; no ampliar a múltiples sistemas/arquitecturas antes de tener un flujo básico fiable.

Punto 1 cerrado como línea base de configuración, tipos y lint. La línea base funcional de pruebas queda expresamente no ejecutada. Siguiente paso del plan: instalación reproducible y declaración de Node/npm, sin modificar reglas financieras ni runners durante ese paso.
