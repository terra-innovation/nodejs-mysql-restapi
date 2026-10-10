# Migración de bcryptjs 2.4.3 a 3.0.3

Fecha: 2026-10-09.

## Alcance y compatibilidad

- Fijar `bcryptjs` en `3.0.3` en `package.json` y actualizar `package-lock.json`.
- Conservar los imports y las llamadas síncronas a `compareSync`, `genSaltSync` y `hashSync` en login, registro, recuperación y cambio de contraseña. Mantener coste 12 y contratos existentes.
- La revisión estática de bcryptjs 3.0.3 muestra que acepta hashes con prefijos `$2a$`, `$2b$` y `$2y$`. `compareSync` toma la sal y el coste del hash recibido; no se requiere reescribir los hashes almacenados para adoptar esta versión.
- Los hashes nuevos usan el prefijo `$2b$`. No se modifica el límite propio de bcrypt de 72 bytes de contraseña ni se introducen validaciones nuevas.

Referencia: [documentación oficial de bcryptjs 3.0.3](https://github.com/dcodeIO/bcrypt.js/blob/v3.0.3/README.md).

## Validación autorizada

Solo compilación con Node 24.21.0 portable y `npm.cmd run build` (generación local del cliente Prisma, TypeScript y tsup). No ejecutar pruebas, arrancar el servidor, acceder a bases de datos ni empaquetar producción.

Resultado: compilación completada con código de salida 0, sin errores de TypeScript ni de tsup. Se generaron la API y las dos entradas de tareas programadas; no fue necesario corregir código fuente.

La compilación no demuestra autenticación con credenciales existentes ni compatibilidad funcional de todos los flujos. Esa comprobación queda pendiente de validación manual o pruebas autorizadas.
