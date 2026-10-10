# Instalación reproducible del backend

Punto 2 del plan de CI, implementado el 10 de octubre de 2026.

## Versiones y alcance

- Referencia verificada: Node `24.21.0` y npm `11.19.0`.
- `.node-version` conserva la versión exacta de Node que utilizará CI. No cambia el PATH global ni sustituye la configuración portable de VS Code.
- `packageManager` declara `npm@11.19.0`; no instala ni selecciona automáticamente npm.
- `engines` admite Node `^24.21.0` y npm `^11.19.0`: permite actualizaciones compatibles dentro de las ramas 24 y 11. CI debe seleccionar las versiones de referencia explícitamente.
- `.npmrc` activa `engine-strict=true` para rechazar instalaciones con versiones incompatibles. Afecta solo al repositorio, incluidas instalaciones de dependencias de producción; confirmar el runtime del servidor antes de reinstalar allí. No actualiza el servidor ni controla por sí solo `node dist/index.js`.
- Se conserva `package-lock.json` en formato 2, sin cambiar versiones, resoluciones ni integridades de dependencias. Su único cambio en este paso es `engines` en la entrada raíz.

## Desarrollo en Windows

Usar el portable y verificarlo según la [guía existente](../desarrollo-node24-windows.md). En una instalación limpia:

```powershell
$env:Path = 'D:\Herramientas\node-v24.21.0-win-x64;' + $env:Path
node --version
node -p "process.execPath"
npm.cmd --version
npm.cmd ci --include=dev --no-audit --no-fund
npm.cmd run prisma:generate
```

`npm ci` instala las versiones bloqueadas, falla si los manifiestos no son compatibles y reemplaza `node_modules` en el directorio donde se ejecuta. No es un comando de actualización de dependencias. `--no-audit` evita una auditoría implícita; el control de seguridad se incorporará por separado. No se deshabilitan scripts de instalación ni comprobaciones de compatibilidad.

## Preparación para CI

En un checkout limpio, con Node/npm seleccionados y dependencias de desarrollo incluidas:

```sh
PRISMA_SKIP_POSTINSTALL_GENERATE=true npm ci --include=dev --no-audit --no-fund
npm run prisma:generate:ci
```

La variable de instalación evita que el postinstall de `@prisma/client` intente una generación implícita; la generación se realiza después como paso explícito. El nuevo script `prisma:generate:ci` ejecuta `cross-env NODE_ENV=production prisma generate`. `production` se limita a ese proceso para que `prisma.config.ts` no cargue archivos `.env`; no omite las dependencias de desarrollo ni cambia el entorno de las pruebas posteriores. No requiere URL ni credenciales de base de datos.

Después se podrán ejecutar los tipos, lint y pruebas acordados en los siguientes puntos del plan. No se ejecuta `prisma-sync`, `db pull`, `db push`, migraciones SQL ni exportación del esquema como parte de la instalación.

## Tu flujo `prisma-sync` se conserva

`npm.cmd run prisma-sync` sigue siendo el comando manual para actualizar el esquema después de modificar la estructura de la base de desarrollo. Conserva los respaldos, `db pull`, pluralización, renombrado y generación del cliente. Consulta la estructura de la base y modifica archivos locales, por lo que no corresponde a una preparación rutinaria de CI.

`prisma:generate` y `prisma:generate:ci` generan únicamente el cliente desde el esquema versionado; no reemplazan la sincronización con la base. `prebuild` conserva `npm run prisma:generate`. Detalle del flujo y decisiones: [Prisma 7](../migracion-prisma7-20261009.md#flujo-conservado-prisma-sync).

## Validación efectuada

Se ejecutó instalación limpia en una carpeta aislada bajo `coverage/ci-install/`, sin copiar archivos `.env` ni sustituir el `node_modules` habitual:

1. `npm ci --include=dev --no-audit --no-fund --prefer-offline`: aprobado, con scripts de instalación habilitados y generación automática Prisma omitida explícitamente.
2. `npm run prisma:generate:ci`: aprobado; creó el cliente desde el esquema copiado sin modificarlo.
3. Comprobación de tipos del backend con el compilador recién instalado y el cliente recién generado: aprobada, sin emitir compilados.
4. Dependencias directas instaladas iguales a las del lockfile y lockfile idéntico antes/después de `npm ci`.
5. Configuración efectiva `engine-strict=true`. Los rangos admiten el Node/npm de referencia y excluyen Node 20, Node 26 y npm 10.
6. `package.json`, lockfile, esquema y `prisma-sync` del workspace permanecieron sin cambios durante la verificación aislada. La carpeta de instalación aislada se elimina al terminar; se conservan reportes y logs ignorados por Git en `coverage/ci-install/`.

No se ejecutaron pruebas, servidor, consultas a bases, sincronización de esquema, compilación ni `build-prod`. Verificación realizada en Windows x64: Linux y GitHub Actions quedan pendientes del flujo de CI. Los avisos de dependencias obsoletas durante instalación no se corrigen con actualizaciones u overrides fuera de este paso.

Referencias: [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/), [engines](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#engines), [engine-strict](https://docs.npmjs.com/cli/v11/using-npm/config/#engine-strict).
