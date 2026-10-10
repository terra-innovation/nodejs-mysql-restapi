# Punto 10: protecciones de master y flujo diario

## Política activa

El 10 de octubre de 2026 se activó y se volvió a consultar la protección de `master` en `terra-innovation/nodejs-mysql-restapi`. Antes no había protección de rama ni rulesets. La cuenta utilizada tiene permiso administrativo; no se modificaron colaboradores ni permisos del repositorio.

| Regla | Configuración |
| --- | --- |
| Integración de cambios | Mediante pull request hacia `master`; sin push directo |
| Checks obligatorios | `Backend quality` y `Backend integration` |
| Proveedor de checks | GitHub Actions, app ID `15368`, verificado en los checks actuales |
| Actualización de la rama | Debe estar actualizada con `master` antes de fusionar |
| Administradores | Sujetos a las mismas reglas |
| Conversaciones del PR | Deben estar resueltas |
| Push forzado y eliminación de master | Bloqueados |
| Aprobaciones humanas obligatorias | 0 por ahora; permite trabajo individual |
| CODEOWNERS y aprobación del último push | Sin exigir |
| Historial lineal | Sin exigir; se conserva la elección del método de fusión |

Las revisiones humanas siguen disponibles. Exigir al menos una aprobación y definir CODEOWNERS queda como mejora opcional cuando exista otro revisor disponible; no se asignan personas ni equipos sin acordarlo.

Configuración reproducible: [payload de protección](../../.github/branch-protection/master.json). Este JSON registra la política aplicada, pero GitHub no lo aplica automáticamente al editarlo. Un cambio de política requiere actualizar el archivo, aplicarlo con permisos administrativos y comprobar la respuesta remota. No contiene credenciales.

La API aceptó `required_status_checks.checks` sin `contexts` en la petición. La respuesta devuelve ambas representaciones. No enviar simultáneamente las dos listas: la API rechazó esa combinación con HTTP 422 y no aplicó cambios en ese intento.

## Flujo diario

1. Con el árbol limpio, actualizar `master` desde `origin` y crear una rama para el cambio. En VS Code: **Git: Fetch**, cambiar a `master`, actualizar y usar **Git: Create Branch…**. No trabajar directamente sobre `master`.
2. Implementar un cambio acotado. En Windows, anteponer `D:\Herramientas\node-v24.21.0-win-x64` al `Path` de la terminal y verificar `node --version` y `node -p "process.execPath"`. Usar `npm.cmd` y `npx.cmd`; preparación: [instalación reproducible](instalacion-reproducible.md).
3. Ejecutar las comprobaciones locales proporcionales al cambio: tipos, lint, formato de archivos modificados y pruebas afectadas, según la skill `backend-validation`. Respetar cualquier restricción explícita del usuario para esa tarea. CI ejecuta las selecciones completas configuradas; no es necesario repetirlas localmente por rutina.
4. Revisar el diff y confirmar únicamente los archivos pertinentes. Publicar la rama y abrir un PR hacia `master`, inicialmente en borrador si sigue en desarrollo. Describir problema, cambio y validación, incluyendo sus límites.
5. Revisar **Checks**: deben aprobar `Backend quality` y `Backend integration` en la revisión actual. Calidad incluye tipos, lint, formato gradual, Jest, Vitest con cobertura y compilación; integración incluye MariaDB desechable y el proceso compilado. Un estado pendiente, omitido o cancelado no constituye evidencia de aprobación completa del flujo.
6. Si `master` avanzó, actualizar la rama mediante **Update branch** en GitHub o fusionar `origin/master` en la rama de trabajo, resolver los conflictos y publicar. Esperar los checks de la nueva revisión. No reutilizar la aprobación de una revisión anterior.
7. Resolver conversaciones, revisar el resultado y marcar **Ready for review** cuando corresponda. Fusionar únicamente con ambos checks aprobados, rama actualizada y PR listo. La fusión necesita una acción autorizada del responsable; configurar esta protección no fusiona el PR actual.
8. Después de fusionar, actualizar el `master` local. El workflow también se ejecuta al llegar el push a `master`; un fallo posterior debe investigarse antes de continuar con otros cambios dependientes.

## Resolver fallos sin perder tiempo

Abrir el primer paso fallido y consultar su log antes de repetir. Descargar los artefactos desde la ejecución: `backend-reports-*` contiene resúmenes, Jest, JUnit y cobertura; `backend-integration-*` contiene diagnóstico Docker, reporte MariaDB y runtime. `backend-dist-*` solo se publica si aprueba el job de calidad; no es un paquete desplegable ni acredita que integración haya aprobado por sí solo.

Corregir y publicar en la misma rama actualiza el PR y dispara otra ejecución. **Re-run failed jobs** sirve para un fallo transitorio de infraestructura sin cambios de código; no arregla un fallo reproducible. No reducir umbrales, omitir pruebas, sustituir aserciones ni desactivar la protección para obtener un resultado verde.

Las pruebas rápidas usan `tests/fixtures/ci-quick.env`, con valores sintéticos públicos, y la referencia versionada del helper de fechas. MariaDB usa su runner y su base exclusivos. No preparar CI mediante `prisma-sync`, exportadores de esquema ni conexiones compartidas. Los artefactos tienen retención limitada: 14 días para reportes y 7 para compilación.

## Verificación y estado de adopción

La última revisión consultada de `CI`, `a65c21a40290e87ee56d8c13a18f725ea4dd1c22`, aprobó ambos jobs en la [ejecución 38055288831](https://github.com/terra-innovation/nodejs-mysql-restapi/actions/runs/38055288831). Esa evidencia precede a este cambio administrativo y no se presenta como una ejecución nueva del punto 10.

La aplicación de la protección respondió HTTP 200. Una segunda lectura confirmó los dos nombres y su app ID, `strict=true`, aplicación a administradores, PR obligatorio con 0 aprobaciones, conversaciones resueltas y bloqueo de push forzado/eliminación. La comprobación es de configuración; no se intentó un push prohibido ni una fusión para probar el bloqueo. No se ejecutaron pruebas ni compilación en este punto.

El [PR #1](https://github.com/terra-innovation/nodejs-mysql-restapi/pull/1) continúa abierto en borrador. El workflow está en su rama `CI`; su incorporación a `master` sigue pendiente de revisar y fusionar ese PR. La protección remota ya está activa. Los archivos nuevos de documentación y política se entregan localmente para revisión.

Referencias oficiales: [protecciones de rama](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) y [API de protección](https://docs.github.com/en/rest/branches/branch-protection#update-branch-protection).

Punto 10 completado. Siguiente paso del plan: punto 11, automatizar mantenimiento de dependencias y controles de seguridad, de adopción opcional.
