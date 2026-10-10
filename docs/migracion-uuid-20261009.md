# Migración de UUID 9 a 14

Fecha: 9 de octubre de 2026.

## Cambio y alcance

- Se actualizó la dependencia directa `uuid` de `^9.0.0` a `14.0.3`, fijada para hacer reproducible la migración.
- Se actualizó `package-lock.json` conservando su formato de versión 2. La instalación cambió únicamente el paquete UUID y omitió scripts de instalación y auditoría automática.
- Se conservan los imports ESM `import { v4 as uuidv4 } from "uuid"` y las llamadas sin argumentos. No se modificaron fuentes, IDs persistidos, contratos ni reglas financieras.
- UUID 14 utiliza ESM y requiere Node 20 o posterior; esta compilación se realizó con Node 24.21.0 portable. El destino `node18` del bundler no garantiza compatibilidad de sus dependencias con Node 18.

Referencias: [cambios oficiales](https://github.com/uuidjs/uuid/blob/main/CHANGELOG.md) y [API oficial](https://github.com/uuidjs/uuid).

## Validación y límites

- `npm.cmd run build`: aprobado con Node `v24.21.0` de `D:\Herramientas\node-v24.21.0-win-x64\node.exe`.
- El ciclo de compilación ejecutó `prebuild` para generar el cliente Prisma, seguido de `tsc --noEmit` y `tsup`. Se generaron la API y las dos entradas de tareas programadas sin errores de compilación.
- No fue necesario corregir código de aplicación.
- No se ejecutaron pruebas, arranque del servidor, conexiones a bases de datos ni empaquetado de producción. La compilación no certifica comportamiento en ejecución ni compatibilidad de los runners de pruebas con la nueva dependencia ESM.
