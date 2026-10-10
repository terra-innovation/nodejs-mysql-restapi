# Validación real de conexión antes del arranque con Prisma 7

## Diagnóstico

El usuario reportó que el caso de credenciales inválidas de `test:runtime`
excedía 45 segundos, mientras que el arranque normal sí pasaba.

La inspección de `@prisma/adapter-mariadb` 7.10.0 muestra que `connect()` crea
el pool y consulta sus capacidades. Si falla esa consulta, `getCapabilities()`
devuelve capacidades por defecto en lugar de propagar el error. Por ello,
`$connect()` por sí solo no demuestra que las credenciales permitan consultar
la base. El código anterior podía continuar hacia `app.listen()`.

## Corrección

- Ejecutar `SELECT 1` después de `$connect()` en cada intento de validación.
  Solo registrar conexión satisfactoria y continuar el arranque si pasa.
- Conservar cinco intentos, las pausas exponenciales y la salida con código 1.
- En el caso de credenciales inválidas de la base desechable, fijar únicamente
  `connect_timeout=1` y `pool_timeout=2` segundos. El pool espera al adquirir
  conexiones; sus tiempos por defecto pueden exceder el presupuesto de la prueba
  al combinarse con los reintentos. No cambiar los valores de producción.
- Conservar el límite de 45 segundos y las expectativas existentes; añadir que
  no se registre conexión satisfactoria con credenciales inválidas.

## Validación y límites

Se comprobaron los tipos del backend y de la selección MariaDB con Node 24.21.0
portable. No se ejecutaron pruebas, conexiones a bases de datos ni empaquetado.
La corrección necesita confirmación funcional con `npm.cmd run test:runtime`.
No interpretar una comprobación de tipos como evidencia de runtime aprobado.

Referencia: [Opciones de pool de MariaDB](https://mariadb.com/docs/connectors/mariadb-connector-nodejs/connector-nodejs-promise-api).
