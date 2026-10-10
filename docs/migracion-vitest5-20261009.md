# Migración de Vitest a 5.0.3

Fecha: 9 de octubre de 2026.

## Alcance y decisiones

- Se actualizan únicamente las dependencias directas de desarrollo `vitest` y `@vitest/coverage-v8` de 4.1.11 a la versión exacta 5.0.3, junto con sus dependencias transitivas resueltas por npm.
- Se conserva Vite 7.3.7, compatible con los peers de Vitest 5.0.3. Se mantiene `package-lock.json` en formato 2.
- Se utiliza Node 24.21.0 portable, verificando versión y ruta del ejecutable antes de instalar y compilar. Vitest 5.0.3 declara Node `^22.12.0 || ^24.0.0 || >=26.0.0`.
- La instalación se realiza con `--ignore-scripts --no-audit --no-fund`. No se modifican Jest, el código de negocio, las expectativas, los mocks, la selección de pruebas ni los umbrales de cobertura.
- Se conservan las configuraciones de Vitest y MariaDB. Ambas ya establecen `clearMocks: true` explícitamente y los scripts seleccionan su archivo de configuración.

## Validación y límites

Antes de actualizar pasaron `tsc --noEmit`, `test:vitest:typecheck` y `test:integration:typecheck`. Estos dos últimos comandos solo comprueban tipos y no ejecutan pruebas.

Después de actualizar pasaron:

- `npm.cmd run build`: generación del cliente Prisma 7.10.0, comprobación de tipos del backend y compilación ESM de la API y los dos scripts programados.
- `npm.cmd run test:vitest:typecheck`: comprobación de tipos de la configuración y suites rápidas de Vitest.
- `npm.cmd run test:integration:typecheck`: comprobación de tipos de la configuración y suites MariaDB.
- `npm.cmd ls vitest @vitest/coverage-v8 vite --depth=0`: versiones instaladas 5.0.3, 5.0.3 y 7.3.7 respectivamente, sin conflictos reportados por ese comando.

No fue necesario corregir errores de compilación. Por instrucción del usuario no se ejecutaron pruebas, cobertura, integración, runtime ni empaquetado de producción. No se accedió a bases de datos. La generación del cliente forma parte del `prebuild` existente y no ejecuta migraciones de esquema.

La compilación no certifica la transformación ni la ejecución de las suites con Vitest 5. La guía oficial introduce cambios en mocks hoisted, aserciones asíncronas sin esperar y coincidencia de patrones de cobertura, entre otros. La regresión funcional y la comprobación del conjunto de archivos cubiertos quedan pendientes de autorización; se conservaron las expectativas y los umbrales existentes.

## Referencia

- [Guía oficial de migración a Vitest 5](https://vitest.dev/guide/migration/).
