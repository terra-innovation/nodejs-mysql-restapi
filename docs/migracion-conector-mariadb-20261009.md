# Unificación del conector MariaDB en 3.4.5

Fecha: 9 de octubre de 2026.

## Alcance y decisiones

- La dependencia directa `mariadb` queda fijada en la versión exacta `3.4.5`, en lugar del rango original `^3.4.0`. El lockfile original ya resolvía `3.4.5`.
- Se actualiza `package-lock.json` mediante npm, sin scripts de instalación ni auditoría automática.
- `@prisma/adapter-mariadb@7.10.0` exige exactamente `mariadb@3.4.5`. Se comparte una sola instalación entre el adaptador y los imports directos; `npm.cmd ls mariadb --all` confirma `3.4.5` deduplicada.
- Por decisión del usuario se sustituye la actualización previa a `3.5.4` para evitar dos versiones del conector. No se utilizan overrides ni se modifica Prisma.
- Al unificar la versión se restaura el tipado original `PoolConfig` de `mariadbAdapter.ts`: ya no se necesita la adaptación de tipos introducida durante la actualización a 3.5.4. Se conservan las opciones de conexión, UTC, SSL y timeouts.
- No se cambia el servidor MariaDB, su esquema ni las reglas de negocio.

## Validación y límites

Se ejecutó `npm.cmd run build` con Node 24.21.0 portable, verificando versión y ruta del ejecutable. Finalizó correctamente la generación del cliente Prisma 7.10.0, `tsc --noEmit` y la compilación ESM de la API y los dos scripts programados.

Por instrucción del usuario no se ejecutaron pruebas. Tampoco se arrancó el servidor, se realizaron conexiones a bases de datos ni se ejecutó el empaquetado de producción. La compilación no certifica el funcionamiento SQL ni la compatibilidad operacional de los conectores.
