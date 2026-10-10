# Compatibilidad de Jest con dependencias ESM y Express 5

Fecha: 9 de octubre de 2026.

## Diagnóstico

La ejecución reportada de Jest fallaba antes de ejecutar varias suites: `uuid` y el cliente generado de Prisma 7 son ESM, mientras las suites existentes se transforman a CommonJS para conservar `jest.mock`. El script de Jest no habilitaba los módulos VM de Node. Además, el espía de `pdfkit-table` ya no infería el argumento de tabla con sus tipos nuevos.

Se reprodujeron estos fallos con Node 24.21.0 en las suites de archivos, accesos y PDF. La ejecución aprobada compartida anteriormente corresponde a otras versiones de dependencias; no demuestra compatibilidad de la selección actual.

## Correcciones

- `npm test` invoca Jest con `node --experimental-vm-modules`. No requiere activar flags manuales ni modificar `NODE_OPTIONS` globalmente.
- `jest.config.js` permite a ts-jest emitir ESM cuando Jest lo solicita. El adaptador `tests/transformers/prismaEsm.cjs`, limitado al código generado de Prisma, fuerza la emisión ESM también al iniciar una carga desde CommonJS. Conserva los diagnósticos y la caché de ts-jest. No se edita el cliente generado ni se sustituye UUID por un mock.
- Las suites existentes mantienen su carga CommonJS y los mocks actuales. No se convierten todas las pruebas a ESM ni se omiten suites.
- El test PDF identifica los argumentos del espía como `Table`, el tipo exportado por la biblioteca.

Al superar la carga aparecieron dos fallos adicionales:

- Express 5 puede dejar `req.body` indefinido. `isAuth` usa ahora `req.body?.token`, preservando el orden de las fuentes del token, las validaciones y los permisos. Los casos existentes de acceso y ficha de empresa verifican los estados originales; se añaden casos GET y POST sin cuerpo ni token que exigen 403 sin consultas de datos.
- El test PDF esperaba `bold:$ 53286.12`. El formateador existente define `es-PE` y `useGrouping: true`, y las pruebas independientes de PDF con MariaDB también esperan agrupación de miles. La expectativa se corrige a `bold:$ 53,286.12`, manteniendo igualdad exacta, el importe, los dos decimales y todas las comprobaciones de fechas UTC/Lima. No se cambia el formateador, las fórmulas ni el PDF de producción para acomodar la prueba.

## Validación y límites

Al avanzar `test:all`, la comprobación de tipos de Vitest detectó `isEvalSupported`, una opción retirada de la API instalada de PDF.js 6.4.299. Se elimina ese argumento de los lectores PDF de Vitest y MariaDB, manteniendo la extracción real del texto y las expectativas. No se usa una conversión de tipos para ocultar el error.

Los logs completos se conservan localmente en `coverage/jest-node24-diagnostico/`. La validación se realiza con Node 24 portable. El sandbox bloqueó `realpath` antes de iniciar Jest, por lo que las ejecuciones de pruebas requirieron salir de ese aislamiento.

Resultado actual: aprobado `tsc --noEmit` del backend; aprobada toda la selección Jest de `test:all`, incluidos los casos HTTP añadidos. Esa ejecución se detuvo después en tipos de Vitest por el argumento obsoleto de PDF.js. Tras retirarlo se aprobaron `test:vitest:typecheck`, `test:integration:typecheck` y toda la selección `test:vitest`. Por tanto, los componentes de `test:all` se verificaron por etapas; no se repitió Jest después del cambio exclusivo de los lectores PDF de Vitest y MariaDB. Vitest conserva el archivo omitido y los casos `todo` existentes; no se cuentan como validación aprobada.

Los registros `baseline.log`, `final.log`, `vitest-final.log`, `typecheck.log`, `vitest-types.log` e `integration-types.log` distinguen cada etapa. No se ejecutaron `test:runtime`, integración real ni empaquetado de producción para esta corrección.

Las suites HTTP usan infraestructura simulada; no equivalen a integración real con MariaDB ni a una certificación de producción. El uso de módulos VM puede mostrar el aviso experimental de Node; no se suprime ese aviso.

Referencias: [ESM y require(esm) en Jest](https://jestjs.io/docs/ecmascript-modules), [opción useESM de ts-jest](https://kulshekhar.github.io/ts-jest/docs/getting-started/options/useESM).
