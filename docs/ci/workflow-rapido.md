# Workflow rápido del backend

Punto 5 del plan. Archivo: [backend-quality.yml](../../.github/workflows/backend-quality.yml).

## Cuándo y qué ejecuta

Se activa en pull requests hacia `master`, pushes a `master` y manualmente desde Actions. `origin/HEAD` apunta actualmente a `origin/master`. No hay filtros de rutas: un cambio documental también obtiene un resultado del job `Backend quality`.

En un único runner `ubuntu-24.04`, con un límite de 15 minutos:

1. Descarga el checkout y la historia completa para comparar cambios.
2. Selecciona Node desde `.node-version` y npm desde `packageManager`; verifica ambas versiones.
3. Restaura la caché de descargas npm asociada al lockfile y ejecuta `npm ci --include=dev --no-audit --no-fund`. No reutiliza `node_modules`. Omite únicamente la generación Prisma implícita del postinstall.
4. Genera Prisma explícitamente con `prisma:generate:ci`, sin archivos `.env` ni conexión a bases.
5. Comprueba los cuatro proyectos de tipos, lint y formato gradual mediante los scripts existentes.

Los controles de lint y formato se ejecutan si la instalación fue satisfactoria, aunque falle Prisma o tipos. Tipos necesita también Prisma aprobado. Ningún fallo se convierte en éxito con `continue-on-error`; el job falla si falla cualquiera de sus pasos.

## Formato gradual

En PR se compara con el SHA de su base; checkout conserva el commit de merge que GitHub prepara para revisar la integración. En push se compara con el SHA previo al push. En ejecución manual, `format_base` permite elegir la referencia; por defecto `HEAD^` comprueba el último commit. Pasar una base anterior permite abarcar varios commits.

Ante un push inicial sin SHA previo, se usa el padre de HEAD. Si no existe padre o la referencia no está disponible (por ejemplo, un historial reescrito), el paso falla y debe revisarse la base; no aprueba silenciosamente sin revisar cambios. El script compara mediante el ancestro común y respeta el alcance y exclusiones documentados en [comandos de calidad](comandos-calidad.md).

El formato histórico pendiente y las advertencias de lint se mantienen visibles según la [adopción gradual](adopcion-calidad.md). Este workflow bloquea errores de lint y diferencias de formato en archivos cambiados; todavía no exige cero advertencias ni formato global limpio.

## Configuración y límites

- Acciones oficiales fijadas por SHA: [checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) y [setup-node v7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0), verificadas el 10 de octubre de 2026. Actualizarlas requiere revisar y cambiar el SHA.
- Token con `contents: read` y credenciales Git no persistidas. No usa secretos de aplicación ni conexiones compartidas; no requiere configurar variables de la base de datos.
- Cancela ejecuciones anteriores del mismo workflow y referencia cuando llega otra actualización.
- No ejecuta pruebas, compilación, MariaDB, `prisma-sync`, empaquetado ni despliegues. Pruebas rápidas y artefactos se incorporarán en los puntos 6 y 7; integración y runtime, en el 8.
- Este archivo no cambia las protecciones de rama. Hacer obligatorio el resultado corresponde al punto 10, después de validar el flujo remoto.

## Publicación y validación

El workflow se entrega como cambio local. GitHub podrá ejecutarlo cuando se confirme y publique en una rama con un PR hacia `master`, o se publique en `master`. La ejecución manual aparece cuando el archivo está disponible en la rama predeterminada. Las políticas de Actions de la organización pueden requerir permitir las acciones oficiales utilizadas.

La revisión local del YAML y sus referencias no equivale a una ejecución en Ubuntu/GitHub Actions. La primera ejecución remota y la medición de tiempos siguen pendientes hasta publicar los cambios; no se ha realizado push ni activado una ejecución remota como parte de este punto.

Validación local del 10 de octubre de 2026: YAML y estructura aprobados, `actionlint` 1.7.12 sin incidencias, sintaxis de los seis bloques `run` aprobada mediante `bash -n`, Prettier del workflow y `git diff --check` aprobados. Actionlint se descargó de su release oficial y se contrastó con el checksum publicado, sin instalación global. No estaban disponibles ShellCheck/Pyflakes; se deshabilitaron esas integraciones de actionlint y se revisó Bash por separado. Registros locales en `coverage/ci-workflow/`, ignorado por Git.

No se repitieron las comprobaciones del código ni la compilación aprobadas en el punto 4: este punto solo añade configuración de CI y documentación. No se ejecutaron pruebas ni comandos de los bloques `run` durante la validación de sintaxis.

Referencias: [setup-node y caché npm](https://github.com/actions/setup-node), [checkout e historia completa](https://github.com/actions/checkout), [eventos de Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).
