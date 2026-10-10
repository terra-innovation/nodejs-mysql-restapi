# Migración de Pino a 10.4.0

Fecha: 9 de octubre de 2026.

## Alcance y decisiones

- Se actualiza Pino de 9.6.0 a la versión exacta 10.4.0 en `package.json` y `package-lock.json`, mediante npm.
- Se actualiza `pino-http` de 10.4.0 a la versión exacta 11.0.0: la versión anterior depende de Pino 9 y la nueva depende de Pino 10. Se alinea el logger HTTP con el logger compartido sin forzar dependencias mediante overrides.
- Se conservan `pino-pretty` 13.0.0 y `pino-roll` 3.1.0. No se modifica la configuración de niveles, consola, rotación de archivos, serializadores ni correlación de solicitudes.
- La instalación se realizó sin scripts de instalación ni auditoría automática. El lockfile incluye las dependencias transitivas de las nuevas versiones.
- Pino 10 elimina el soporte de Node 18. El entorno utilizado es Node 24.21.0; el target de compilación `node18` no certifica compatibilidad de las dependencias con ese runtime.

## Validación y límites

Se ejecutó `npm.cmd run build` con Node 24.21.0 portable, verificando versión y ruta del ejecutable. Finalizaron correctamente la generación del cliente Prisma 7.10.0, la comprobación de tipos con `tsc --noEmit` y la compilación ESM de la API y los dos scripts programados. No fue necesario corregir código.

Por instrucción del usuario no se ejecutaron pruebas. Tampoco se arrancó el servidor ni se ejecutó el empaquetado de producción. La compilación no verifica la escritura y rotación de logs, la salida de consola ni la correlación HTTP en ejecución.

## Referencias

- [Cambios de Pino 10](https://github.com/pinojs/pino/releases/tag/v10.0.0).
- [Pino 10.4.0](https://github.com/pinojs/pino/releases/tag/v10.4.0).
- [Dependencias de pino-http 11.0.0](https://registry.npmjs.org/pino-http/11.0.0).
