# Actualización de xml2js, pino-pretty, tsx y supertest

Fecha: 9 de octubre de 2026.

## Alcance y decisiones

| Dependencia | Antes | Después | Grupo conservado |
| --- | --- | --- | --- |
| xml2js | 0.6.0 | 0.6.2 | dependencies |
| pino-pretty | 13.0.0 | 13.2.0 | dependencies |
| tsx | 4.19.4 | 4.23.15 | devDependencies |
| supertest | 7.1.4 | 7.3.1 | devDependencies |

- Las cuatro versiones quedan fijadas exactamente en `package.json` y `package-lock.json`, conservando el formato 2 del lockfile.
- Se utilizó npm con `--save-exact --ignore-scripts --no-audit --no-fund`, y `--save-dev` para las herramientas de desarrollo.
- El lockfile incluye cambios transitivos y deduplicación, entre ellos esbuild, superagent y dependencias del formateador de logs. No se actualizaron otras dependencias directas.
- No fue necesario modificar fuentes, configuración del logger, procesamiento XML, scripts de desarrollo ni pruebas.

## Validación y límites

Se ejecutó `npm.cmd run build` antes y después de la actualización con Node 24.21.0 portable en `D:\Herramientas\node-v24.21.0-win-x64\node.exe`, verificando versión y ruta del ejecutable en ambas sesiones. Ambas compilaciones finalizaron con código de salida 0: generación de Prisma Client 7.10.0, comprobación de tipos del backend y compilación ESM mediante tsdown de la API y los dos scripts programados.

Por instrucción del usuario no se ejecutaron pruebas. Tampoco se arrancaron el servidor ni los scripts programados, se conectó a bases de datos, se ejecutó una auditoría de seguridad ni se generó un paquete mediante `build-prod`. La generación de Prisma Client no aplica migraciones de base de datos.

La compilación principal excluye las pruebas y no certifica el funcionamiento de Supertest, la ejecución de tsx, la salida de pino-pretty ni el procesamiento de XML en runtime. Esos comportamientos quedan fuera de esta validación.
