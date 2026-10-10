# Actualización de file-type a 22.1.1

Fecha: 9 de octubre de 2026.

## Alcance y decisiones

- Se actualiza file-type de 20.4.1 a la versión exacta 22.1.1 en `package.json` y `package-lock.json`, mediante npm, conservando el formato 2 del lockfile.
- La instalación se realizó sin scripts de instalación ni auditoría automática. Se actualizaron las dependencias transitivas requeridas por file-type; no se migraron otras dependencias directas.
- Se mantienen los imports y llamadas a `fileTypeFromFile()` en `src/middlewares/archivoMiddleware.ts` y `src/services/usuario/archivo.Service.ts`. No fue necesario corregir código para compilar.
- Se conservan las reglas existentes de tamaño, extensiones, MIME y almacenamiento.

## Compatibilidad

file-type 22 requiere Node >=22; Node 24.21.0 cumple este requisito. El target `node18` existente de tsup no reduce el requisito de ejecución de la dependencia. La versión del runtime de producción no fue verificada en esta tarea.

La versión 22 elimina subexports y soporte de streams Readable de Node en las APIs de streams, y normaliza determinados MIME. Los usos localizados del backend importan desde `file-type` y utilizan rutas de archivos, por lo que no necesitan adaptación de streams. No se consultaron ni modificaron las listas MIME de la base de datos.

Referencia: [cambios oficiales de file-type 22](https://github.com/sindresorhus/file-type/releases/tag/v22.0.0).

## Validación y límites

Se ejecutó `npm.cmd run build` con Node 24.21.0 portable, verificando versión y ruta del ejecutable. Finalizaron correctamente la generación del cliente Prisma 7.10.0, la comprobación de tipos con `tsc --noEmit` y la compilación ESM de la API y los dos scripts programados.

Por instrucción del usuario no se ejecutaron pruebas. Tampoco se arrancó el servidor ni se ejecutó `build-prod`. La compilación no verifica la detección efectiva de archivos, su aceptación según las listas MIME ni los flujos de carga y almacenamiento.
