# Workflow rápido del backend

Puntos 5 a 8 del plan. Archivo: [backend-quality.yml](../../.github/workflows/backend-quality.yml).

## Cuándo y qué ejecuta

Se activa en pull requests hacia `master`, pushes a `master` y manualmente desde Actions. `origin/HEAD` apunta actualmente a `origin/master`. No hay filtros de rutas: un cambio documental también obtiene un resultado del job `Backend quality`.

El job `Backend quality` usa un runner `ubuntu-24.04`, con un límite de 20 minutos:

1. Descarga el checkout y la historia completa para comparar cambios.
2. Selecciona Node desde `.node-version` y npm desde `packageManager`; verifica ambas versiones.
3. Restaura la caché de descargas npm asociada al lockfile y ejecuta `npm ci --include=dev --no-audit --no-fund`. No reutiliza `node_modules`. Omite únicamente la generación Prisma implícita del postinstall.
4. Genera Prisma explícitamente con `prisma:generate:ci`, sin archivos `.env` ni conexión a bases.
5. Comprueba los cuatro proyectos de tipos, lint y formato gradual mediante los scripts existentes.
6. Ejecuta las selecciones rápidas completas de Jest y Vitest en pasos independientes, con JSON de Jest y cobertura/JUnit de Vitest.
7. Compila el backend con `npm run build`, usando el target Node 24.
8. Genera un resumen y conserva reportes y, cuando todos los controles aprueban, el compilado como artefactos descargables.

Después de aprobar `Backend quality`, el job independiente `Backend integration` ejecuta MariaDB desechable y runtime compilado, con otro runner Ubuntu y un límite de 30 minutos. [Procedimiento, aislamiento y evidencias del punto 8](integracion-runtime.md). Si falla calidad, integración queda omitida; no representa un resultado aprobado. El artefacto `backend-dist` acredita los controles del job de calidad, no el resultado posterior de integración.

Los controles de lint y formato se ejecutan si la instalación fue satisfactoria, aunque falle Prisma o tipos. Tipos necesita también Prisma aprobado. Ningún fallo se convierte en éxito con `continue-on-error`; el job falla si falla cualquiera de sus pasos.

## Pruebas rápidas: punto 6

| Paso | Comando | Selección conservada |
| --- | --- | --- |
| Jest | `npm test -- --ci --runInBand --json --outputFile=coverage/ci/jest-results.json` | `jest.config.js`: roots `tests/unit` y `tests/e2e`, con sus patrones y exclusiones existentes |
| Vitest | `npm run test:vitest:ci` | `vitest.config.ts`: `tests/vitest/unit`, `http` y `pending` |

Ambos pasos requieren instalación y generación Prisma aprobadas, pero se ejecutan aunque fallen tipos, lint, formato o el otro runner. Cada runner dispone de cinco minutos, dentro del límite de veinte minutos del job. Una cancelación del workflow sí detiene las comprobaciones restantes.

Los scripts existentes fijan `TZ=UTC` y `NODE_ENV=test`; el workflow añade `CI=true`. Jest usa `--ci` para impedir actualizar snapshots automáticamente y `--runInBand` para evitar workers adicionales. Vitest ya usa `run`, rechaza `.only` con `CI=true` y falla si no encuentra pruebas. Jest conserva su comportamiento de fallo ante ausencia de pruebas. No se añaden `--forceExit`, `--passWithNoTests`, filtros de selección ni regeneración de snapshots.

Estas suites usan infraestructura simulada; las pruebas HTTP de Vitest no equivalen al arranque completo ni a persistencia real. Se conserva la exclusión histórica de `tests/e2e/index.test.ts`. Los `todo` de Vitest siguen pendientes: no representan pruebas aprobadas. No se alteran aserciones, mocks ni configuraciones de selección.

**Referencia de fechas para Jest:** `tests/unit/services/factoring.dateTrace.test.ts` y `tests/unit/services/admin/factoringliquidacion.audit.test.ts` invocan `scripts/analisis/fecha-liquidacion-frontend.cjs`. CI fija `LIQUIDACION_FRONTEND_ROOT` a `tests/fixtures/frontend-date-contract`, una copia exacta versionada del helper del frontend con procedencia y SHA-256 registrados. Antes de Jest, `verify-frontend-date-contract.mjs` verifica integridad sin ejecutar el helper. Esto elimina el requisito de una carpeta externa en Ubuntu. El ayudante conserva localmente su ruta predeterminada al frontend real; no se excluyen suites ni se cambian expectativas. La sincronización futura queda abierta como [DT-CI-01](../deuda-tecnica/20261010_DT_CI_01_contrato_fechas_frontend.md).

Se reutilizan `test` y `test:vitest:ci` para que los resultados de ambos queden visibles. `test:all` se detiene ante el primer fallo y no se utiliza como agregado del workflow. El punto 7 activa la cobertura y los umbrales ya definidos en Vitest, sin modificarlos ni ampliar la selección de suites.

## Compilación, reportes y artefactos: punto 7

La compilación reutiliza `npm run build` (prebuild Prisma, tipos y tsdown), con `NODE_ENV=production` limitado al paso para no cargar `.env`. No ejecuta el servidor. `tsdown.config.ts` pasa de target `node18` a `node24`, coherente con el runtime declarado del proyecto; se conserva ESM, entradas, mapas y todo el directorio `dist`. El paso tiene cinco minutos y puede ejecutarse aunque fallen pruebas u otros controles, para aportar diagnóstico.

Tipos, lint, formato, contrato del frontend, Jest, Vitest y compilación conservan salida mediante `tee`. El shell Bash de Actions aplica `-e` y `pipefail`, de modo que un fallo del comando no se oculta por el éxito de `tee`. La instalación y generación inicial Prisma permanecen en los logs de Actions.

Un resumen Markdown en la página de ejecución y `coverage/ci/summary.json` registran estados de los controles, commit y versiones Node/npm. `skipped` no se interpreta como aprobado. El resumen describe los controles anteriores; no certifica una subida de artefactos que todavía no haya ocurrido.

| Artefacto | Contenido | Cuándo se conserva | Retención |
| --- | --- | --- | --- |
| `backend-reports-<run_id>-<run_attempt>` | `coverage/ci/`: logs, JSON de Jest y resumen; `coverage/vitest/`: JUnit y reportes de cobertura | Aunque falle un control, si se pudo generar el resumen y no se canceló la ejecución | 14 días |
| `backend-dist-<run_id>-<run_attempt>` | Todo `dist/`, incluidos chunks y sourcemaps, junto con `coverage/ci/summary.json` | Solo si los pasos anteriores y la compilación aprobaron | 7 días |

Los reportes pueden estar incompletos ante fallos tempranos, timeouts o cancelación; un archivo ausente no significa una suite aprobada. Los logs originales siguen disponibles en Actions. Una subida fallida hace fallar el job. Se usa [upload-artifact v7.0.2](https://github.com/actions/upload-artifact/releases/tag/v7.0.2), fijada por SHA verificado el 10 de octubre de 2026.

Las rutas de subida son explícitas. No se suben `.env`, credenciales, `node_modules`, almacenamiento de clientes ni temporales. El compilado es un resultado de CI para revisión: no es el paquete de producción ni una aprobación de despliegue, arranque real o integración MariaDB. No se ejecuta `build-prod`.

## Formato gradual

En PR se compara con el SHA de su base; checkout conserva el commit de merge que GitHub prepara para revisar la integración. En push se compara con el SHA previo al push. En ejecución manual, `format_base` permite elegir la referencia; por defecto `HEAD^` comprueba el último commit. Pasar una base anterior permite abarcar varios commits.

Ante un push inicial sin SHA previo, se usa el padre de HEAD. Si no existe padre o la referencia no está disponible (por ejemplo, un historial reescrito), el paso falla y debe revisarse la base; no aprueba silenciosamente sin revisar cambios. El script compara mediante el ancestro común y respeta el alcance y exclusiones documentados en [comandos de calidad](comandos-calidad.md).

El formato histórico pendiente y las advertencias de lint se mantienen visibles según la [adopción gradual](adopcion-calidad.md). Este workflow bloquea errores de lint y diferencias de formato en archivos cambiados; todavía no exige cero advertencias ni formato global limpio.

## Configuración y límites

- Acciones oficiales fijadas por SHA: [checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) y [setup-node v7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0), verificadas el 10 de octubre de 2026. Actualizarlas requiere revisar y cambiar el SHA.
- Token con `contents: read` y credenciales Git no persistidas. No usa secretos de aplicación ni conexiones compartidas; no requiere configurar variables de la base de datos.
- Cancela ejecuciones anteriores del mismo workflow y referencia cuando llega otra actualización.
- Ejecuta pruebas rápidas, compilación e integración con MariaDB desechable y proceso compilado. No ejecuta `prisma-sync`, exportación de esquema, empaquetado de producción ni despliegues.
- Este archivo no cambia las protecciones de rama. Hacer obligatorio el resultado corresponde al punto 10, después de validar el flujo remoto.

## Publicación y validación

Estado actualizado al cerrar el punto 9: el [PR en borrador #1](https://github.com/terra-innovation/nodejs-mysql-restapi/pull/1) ejecutó el workflow completo en GitHub con ambos jobs aprobados. Diagnóstico, corrección del entorno sintético, tiempos y artefactos descargados: [validación remota del 10 de octubre](validacion-remota-20261010.md). Los párrafos siguientes conservan la evidencia histórica de los puntos 5–7; sus pendientes de ejecución remota quedaron resueltos en el punto 9.

El workflow se entrega como cambio local. GitHub podrá ejecutarlo cuando se confirme y publique en una rama con un PR hacia `master`, o se publique en `master`. La ejecución manual aparece cuando el archivo está disponible en la rama predeterminada. Las políticas de Actions de la organización pueden requerir permitir las acciones oficiales utilizadas.

La revisión local del YAML y sus referencias no equivale a una ejecución en Ubuntu/GitHub Actions. La primera ejecución remota y la medición de tiempos siguen pendientes hasta publicar los cambios; no se ha realizado push ni activado una ejecución remota como parte de este punto.

Validación local del 10 de octubre de 2026: YAML y estructura aprobados, `actionlint` 1.7.12 sin incidencias, sintaxis de los seis bloques `run` aprobada mediante `bash -n`, Prettier del workflow y `git diff --check` aprobados. Actionlint se descargó de su release oficial y se contrastó con el checksum publicado, sin instalación global. No estaban disponibles ShellCheck/Pyflakes; se deshabilitaron esas integraciones de actionlint y se revisó Bash por separado. Registros locales en `coverage/ci-workflow/`, ignorado por Git.

No se repitieron las comprobaciones del código ni la compilación aprobadas en el punto 4: este punto solo añade configuración de CI y documentación. No se ejecutaron pruebas ni comandos de los bloques `run` durante la validación de sintaxis.

La validación anterior corresponde al punto 5. En el punto 6 se revisan estáticamente los dos pasos nuevos, sus scripts y dependencias, sin ejecutar pruebas localmente por la restricción vigente del usuario. La primera ejecución de Jest/Vitest en Linux sigue pendiente de publicar el workflow: no se afirma que sus selecciones completas actuales estén aprobadas.

Al cerrar la configuración del punto 6, actionlint, Prettier y `git diff --check` están aprobados; la sintaxis de los ocho bloques `run` está aprobada mediante `bash -n`. La referencia de fechas coincide byte a byte con el helper local de origen y tiene una revisión Git sin cambios locales registrada. `.gitattributes` evita conversiones de finales de línea de la copia, y Prettier la excluye para preservar sus bytes. Se verificó su SHA-256 sin ejecutar el helper ni las pruebas. La configuración del punto 6 queda completada, con la ejecución real en GitHub todavía pendiente.

Validación del punto 7 (10 de octubre de 2026): `npm run build` aprobado localmente con Node portable 24.21.0 y target `node24`; actionlint, formato de YAML/tsdown, sintaxis de los once bloques Bash, sintaxis de los dos bloques JavaScript inline y `git diff --check` aprobados. La comprobación de integridad de la referencia del frontend también está aprobada. No se ejecutaron pruebas, cobertura, servidor, empaquetado de producción ni subidas de artefactos. Los logs locales están en `coverage/ci-step7/`; cobertura, generación de reportes de pruebas y subida/descarga real de artefactos permanecen pendientes de ejecución remota. Dependencias, fuentes de negocio, esquema y suites no cambiaron.

Referencias: [setup-node y caché npm](https://github.com/actions/setup-node), [checkout e historia completa](https://github.com/actions/checkout), [eventos de Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).
