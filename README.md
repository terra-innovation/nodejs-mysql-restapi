# Nodejs MYSQL REST API

### Installation

Usar Node 24.21.0 y npm 11.19.0 como referencia. Instalar con `npm ci` y generar el cliente Prisma antes de arrancar. Procedimiento para Windows y CI: [instalación reproducible](docs/ci/instalacion-reproducible.md).

`npm run prisma-sync` conserva el flujo manual de introspección y transformación del esquema desde la base de desarrollo; no se ejecuta para instalar ni preparar CI.

### TODO

- [ ] upload images
- [ ] create authentication and authorization
- [ ] add validation
- [ ] improve error handling
- [ ] complete the tests
- [ ] docker for production

### ESLint

npx eslint --init  / genera el archivo ce configuración
npx eslint .  // revisa los problemas en el código


