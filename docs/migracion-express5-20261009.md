# Migración a Express 5.3.0

Fecha: 9 de octubre de 2026.

## Alcance

- Express pasa de 4.22.3 a 5.3.0, fijado explícitamente en package.json y package-lock.json.
- Se conservan los tipos de Express 5 ya presentes en el proyecto.
- No se modifican rutas, permisos, fórmulas financieras ni acceso a datos.
- Se conserva el wrapper catchedAsync existente; su retirada no forma parte de esta migración.

## Compatibilidad

Express 5 cambia el parser de query por defecto de extended a simple y deja req.body
sin definir cuando no se analiza un cuerpo. Para conservar el comportamiento previo:

- src/app.ts configura explícitamente query parser como extended.
- Después de express.json(), un middleware establece req.body como objeto vacío
  únicamente si es null o undefined. Los cuerpos ya analizados se conservan.

La revisión estática de rutas no identificó patrones de texto que requieran adaptar
comodines u opcionales. No se identificaron usos de los métodos retirados buscados.
Esta revisión no sustituye la ejecución de solicitudes HTTP.

Referencia: [Guía oficial de migración](https://expressjs.com/en/guide/migrating-5/).

## Validación y límites

- Node utilizado: 24.21.0 portable, verificado mediante versión y process.execPath.
- npm run build: aprobado, incluyendo prebuild de generación de Prisma Client,
  tsc --noEmit y compilación ESM mediante tsup de API y scripts programados.
- No fue necesario corregir errores de compilación.
- No se ejecutaron pruebas, servidor, solicitudes HTTP, conexiones a bases de datos,
  npm audit ni build-prod, conforme al alcance solicitado.
- La compilación no certifica compatibilidad funcional ni despliegue en producción.
- Queda pendiente la comprobación manual de autenticación, consultas, cargas de
  archivos, descargas y manejo de errores cuando el usuario la realice.
