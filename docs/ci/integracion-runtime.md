# Integración MariaDB y runtime en CI: punto 8

El job `Backend integration` de [backend-quality.yml](../../.github/workflows/backend-quality.yml) depende de `Backend quality`. Se ejecuta en los mismos eventos del workflow, después de aprobar los controles rápidos. No se altera la selección de pruebas ni se debilitan sus expectativas.

## Ejecución

1. Checkout limpio en otro runner `ubuntu-24.04`; Node desde `.node-version` y npm desde `packageManager`, ambos verificados.
2. Caché de descargas npm, `npm ci` y generación Prisma explícita sin `.env`.
3. `npm run test:integration:doctor`: comprueba Docker Linux y la integridad del esquema guardado; no crea contenedores ni consulta desarrollo.
4. `npm run test:integration`: reutiliza `scripts/integration/run-mariadb.mjs` con toda la selección de `tests/mariadb/vitest.config.ts`. Incluye `runtime.test.ts`, por lo que no se repite `npm run test:runtime` ni se sobrescribe el JUnit con una segunda selección.
5. `verify-integration-report.mjs`: exige reporte de esta ejecución, integración aprobada, contenedor eliminado y evidencia runtime del mismo `runId`, versión Node, plataforma y arquitectura. En Linux exige evidencia de SIGTERM nativo.
6. Resumen de estados y artefacto de diagnóstico, también ante fallo de las pruebas si se pudo generar el resumen.

El job tiene 30 minutos; doctor, 2; integración, 20. El tiempo restante permite preparar dependencias, comprobar evidencia y subir artefactos. Los presupuestos se revisarán con tiempos reales en el punto 9. No se instala ni configura Docker en el equipo del usuario como parte de este cambio.

## Aislamiento y limpieza

El runner existente crea `mariadb:11.4.10`, puerto aleatorio ligado a 127.0.0.1, usuario y credenciales sintéticos y datos en tmpfs. Restaura únicamente el snapshot versionado y las fixtures sintéticas. No se exporta ni regenera estructura en CI, ni se consultan bases de desarrollo o producción.

La limpieza se mantiene en `finally`, con verificación del nombre y etiqueta del contenedor propio antes de eliminarlo. No se añade `docker prune` ni borrado por prefijo. El job usa un runner hospedado desechable; no utiliza un servicio MariaDB paralelo al contenedor que administra el runner. Se conserva el tag existente, sin introducir un digest de imagen en este punto.

El validador de evidencia no elimina recursos ni consulta Docker/SQL. Comprueba `startedAt` contra el inicio registrado en el paso de esta ejecución, hash del esquema, `status: passed`, `cleanup: removed` y el reporte runtime correspondiente. Se ejecuta también tras un fallo del runner para detectar falta de evidencia o limpieza incompleta; el fallo original sigue haciendo fallar el job. Un reporte histórico o ausente no se interpreta como aprobación.

SIGINT/SIGTERM intentan activar la limpieza existente. Una cancelación forzada, timeout o pérdida del daemon puede impedirla o dejar los reportes incompletos; no se garantiza una subida después de cancelar. En ese caso revisar los logs y el estado de la ejecución, sin interpretar la ausencia de artefactos como éxito.

## Evidencia y artefactos

`backend-integration-<run_id>-<run_attempt>` conserva durante 14 días únicamente:

- `coverage/ci-integration/`: logs de doctor, runner y validador, más resumen de estados y commit.
- `coverage/mariadb/*.json`: reportes de ejecución y limpieza.
- `coverage/mariadb/junit.xml`: selección completa de integración.
- `coverage/mariadb/runtime/result-*.json`: evidencia del proceso compilado.

No se sube el directorio temporal del runtime completo: puede contener logs y archivos de trabajo. Tampoco se suben `.env`, contraseñas, almacenamiento de clientes, dumps SQL ni `node_modules`. Las credenciales nuevas las genera el runner; no hay secretos de aplicación que configurar en GitHub.

El runtime comprueba tipos, compila con tsdown a una salida aislada, arranca el backend en un proceso Node real, consulta `/ping` con Prisma/MariaDB reales y comprueba cierre con señal nativa en Linux. También verifica el fallo de arranque ante una contraseña deliberadamente inválida. No arranca el artefacto descargado del job de calidad: recompila la misma revisión con la configuración versionada. No certifica despliegue, PM2/Nginx, rendimiento ni Linux ARM64; el runner configurado es x64.

Para las protecciones de rama del punto 10, revisar los resultados de ambos jobs: `Backend quality` y `Backend integration`. Aprobar solo calidad no acredita integración real.

## Validación local y límites

Este punto configura las ejecuciones futuras. Por la restricción vigente del usuario, no se ejecutan pruebas ni se crean contenedores localmente. Se revisan YAML, condiciones, sintaxis Bash/JavaScript, formato y diff. La ejecución real en GitHub, restauración SQL, pruebas, limpieza efectiva y descarga de artefactos quedan pendientes de publicar el workflow y completarlo en el punto 9.

Validación local del 10 de octubre de 2026 con Node portable 24.21.0: actionlint sin incidencias, YAML y estructura aprobados, sintaxis de Bash y JavaScript inline de ambos jobs aprobada, sintaxis del validador de evidencia aprobada, Prettier y `git diff --check` aprobados. Los registros quedan en `coverage/ci-step8/`, ignorado por Git. No se ejecutó el validador contra reportes históricos para presentarlos como evidencia actual. No cambiaron dependencias, suites, fuentes de negocio, snapshot ni runner de MariaDB.

Detalles del runner y suites: [MariaDB](../../tests/mariadb/README.md) y [runtime](../deuda-tecnica/20261008_regresion_backend_compilado.md). Los conteos y resultados históricos de esas guías no son una validación actual del workflow.
