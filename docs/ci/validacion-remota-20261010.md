# Punto 9: validación remota de CI

## Alcance

Validación en GitHub Actions mediante el [PR en borrador #1](https://github.com/terra-innovation/nodejs-mysql-restapi/pull/1), rama `CI` hacia `master`. No se fusiona el PR ni se configuran todavía protecciones de rama. Se ejecutan las selecciones existentes de Jest, Vitest con cobertura y MariaDB, incluido el proceso compilado. No se ejecutan pruebas localmente ni se consultan bases compartidas.

## Diagnóstico y corrección

La [primera ejecución](https://github.com/terra-innovation/nodejs-mysql-restapi/actions/runs/38054234065), revisión `400108c3631a220631c5a441768cb1b018283edf`, aprobó instalación, generación Prisma, tipos, lint, formato y compilación. Jest interrumpió la ejecución al importar la configuración sin las variables locales de `.env.test`; Vitest presentó la misma causa en dos suites. El artefacto de diagnóstico se publicó y se descargó correctamente. La integración quedó omitida por la dependencia del job de calidad; el artefacto de compilación validada tampoco se publicó, como corresponde ante pruebas fallidas.

Se incorpora `tests/fixtures/ci-quick.env`, con valores públicos sintéticos. Ambos pasos de pruebas rápidas exportan este archivo en su propio proceso Bash. La base y APIs apuntan al puerto local 1, sin servicio; Telegram está desactivado. No contiene secretos, no se copia a `.env.test` y no se utiliza para integración ni producción. La validación estricta de configuración se conserva.

La corrección no modifica fuentes de negocio, pruebas, expectativas, selección, mocks ni umbrales de cobertura. El runner MariaDB conserva la creación y limpieza de su contenedor propio y su base exclusiva.

## Evidencia

La [ejecución corregida 38054527318](https://github.com/terra-innovation/nodejs-mysql-restapi/actions/runs/38054527318) terminó con estado `success`. Revisión de la rama: `ca2260ea43065dc3da41f4a63ddf4c1b079a68bd`; GitHub probó el merge provisional del PR `e226a91c6816cac0784f26536ffeb8afe1d784e2`, registrado en el resumen del artefacto. Node `24.21.0`, npm `11.19.0`, Ubuntu 24.04 / Linux x64.

| Control | Resultado actual |
| --- | --- |
| Instalación y generación Prisma | Aprobadas en ambos jobs |
| Tipos | Backend, Jest, Vitest e integración aprobados |
| Lint | 0 errores; 346 advertencias existentes |
| Formato gradual | Aprobado sobre cambios respecto de `master` |
| Jest | 15 suites; 2.923 pruebas aprobadas; ninguna fallida ni pendiente |
| Vitest rápido | 21 suites aprobadas; 582 pruebas aprobadas; 3 `todo` en una suite pendiente |
| Cobertura Vitest | Sentencias 69,46 %; ramas 66,56 %; funciones 59,68 %; líneas 69,61 %. Umbrales generales y específicos aprobados |
| Compilación | Aprobada; `dist/index.js`, chunks, scripts y sourcemaps publicados |
| MariaDB | 16 suites; 523 pruebas aprobadas, incluidas las 2 de runtime |
| Runtime | Arranque HTTP/SQL y cierre con SIGTERM nativo; rechazo del arranque con credencial inválida; ambos aprobados |
| Evidencia y limpieza | `runId=9cc53cf8997caf16cbc0009c`; `status=passed`; `cleanup=removed`; hash del esquema coincide con la referencia versionada |

Los porcentajes de cobertura corresponden exclusivamente a los módulos seleccionados en `vitest.config.ts`. No expresan cobertura de todo el backend.

### Duraciones observadas

| Etapa | Duración |
| --- | --- |
| Workflow, creación a cierre | 4 min 19 s |
| Job de calidad, preparación incluida | 2 min 1 s |
| Jest, paso completo | 59 s |
| Vitest con cobertura, paso completo | 7 s |
| Compilación, paso completo | 5 s |
| Job de integración, preparación incluida | 2 min 14 s |
| MariaDB, preparación de contenedor y limpieza incluidas | 1 min 48 s |

Son mediciones de una ejecución aprobada, no un SLA ni una comparación de rendimiento. Los presupuestos actuales de 20/30 minutos por job y 5/20 minutos para pruebas rápidas/integración tienen margen suficiente; se conservan hasta disponer de varias ejecuciones comparables. La caché npm se restauró en integración y se guardó al cerrar calidad.

### Artefactos descargados

Se descargaron y abrieron correctamente los tres ZIP. Su SHA-256 coincide con el digest publicado por GitHub. Se comprobaron los resúmenes, resultados Jest, JUnit, cobertura, archivos compilados y evidencia de integración/runtime.

| Artefacto de la ejecución 38054527318 | ID | Retención |
| --- | --- | --- |
| `backend-reports-38054527318-1` | `11670549046` | 14 días |
| `backend-dist-38054527318-1` | `11670788630` | 7 días |
| `backend-integration-38054527318-1` | `11670913476` | 14 días |

Los ZIP descargados y logs de diagnóstico se guardan localmente en `coverage/ci-live/`, ignorado por Git. La referencia reproducible para revisión son las ejecuciones y artefactos de GitHub enlazados en este documento; su retención es limitada.

## Límites

Las pruebas rápidas usan infraestructura simulada. La integración verifica MariaDB desechable y el proceso compilado en Ubuntu x64; no certifica navegador, despliegue, Linux ARM64 ni todos los módulos del backend. Los casos `todo` siguen pendientes y no representan aprobaciones. Las advertencias de lint conservan su tratamiento gradual.

Punto 9 completado. Siguiente paso del plan: configurar las protecciones de `master` y documentar el flujo diario, haciendo obligatorios los jobs `Backend quality` y `Backend integration`.
