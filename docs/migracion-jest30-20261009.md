# Migración de Jest a 30.5.2

Fecha: 9 de octubre de 2026.

## Alcance y decisiones

- Se actualiza Jest de 29.7.0 a la versión exacta 30.5.2 mediante npm, conservando el formato 2 de `package-lock.json`.
- Se conservan `ts-jest` 29.4.6 y `@types/jest` 30.0.0. El transformador instalado declara compatibilidad con Jest 30 y TypeScript 5.8.3 satisface sus requisitos.
- Se mantienen scripts, configuración, selección de pruebas, mocks, expectativas y código de negocio.
- La instalación se realiza sin scripts de instalación ni auditoría automática. npm advierte sobre `glob` 10.5.0 en el árbol transitivo; no se aplican overrides ni actualizaciones ajenas a la migración. El aviso no demuestra por sí solo exposición del backend.

## Validación y límites

Se ejecutó `npm.cmd run build` con Node 24.21.0 portable, verificando versión y ruta del ejecutable. Finalizaron correctamente la generación del cliente Prisma 7.10.0, la comprobación de tipos del backend mediante `tsc --noEmit` y la compilación ESM de la API y los dos scripts programados. No fue necesario corregir código de compilación.

La inspección de dependencias directas confirmó Jest 30.5.2, ts-jest 29.4.6 y @types/jest 30.0.0 instalados.

Por instrucción del usuario no se ejecutaron pruebas ni el empaquetado de producción. La compilación del backend excluye las pruebas y no certifica su compilación, transformación ni ejecución bajo Jest 30. La regresión de Jest queda pendiente de autorización.

## Referencia

- [Guía oficial de migración de Jest 29 a 30](https://jestjs.io/docs/upgrading-to-jest30).
