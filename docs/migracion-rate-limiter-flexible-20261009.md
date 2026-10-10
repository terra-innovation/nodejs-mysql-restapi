# Migración de rate-limiter-flexible a 11.2.1

## Alcance

- Actualización de 8.3.0 a 11.2.1, fijada sin rango en `package.json` y registrada en `package-lock.json`.
- Se conserva `RateLimiterMemory` y el código de `src/middlewares/ratelimiterMiddleware.ts`: puntos, duraciones, claves por IP/usuario y respuestas HTTP.
- No se incorporan almacenes externos ni se modifican otras dependencias.

## Validación

- `npm.cmd run build` aprobado con Node 24.21.0 portable de `D:\Herramientas\node-v24.21.0-win-x64`.
- El flujo existente ejecutó generación del cliente Prisma, comprobación TypeScript (`tsc --noEmit`) y compilación con tsup de la API y los dos scripts programados.
- No se necesitaron correcciones de compilación.
- Por indicación del usuario, no se ejecutaron pruebas, servidor, integración ni empaquetado de producción. La compilación no certifica el comportamiento de los límites ni las respuestas 429 en ejecución.

## Reversión

Restaurar conjuntamente `package.json` y `package-lock.json` a la revisión previa a esta migración y reinstalar las dependencias desde ese lockfile.

Referencia: [publicación oficial 11.2.1](https://github.com/animir/node-rate-limiter-flexible/releases/tag/v11.2.1).
