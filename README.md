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

### Controles de calidad

Ejecutar `npm run typecheck:all`, `npm run lint` y `npm run format:check` de forma independiente. No ejecutan pruebas ni corrigen archivos. Alcance, preparación y limitaciones: [comandos de calidad](docs/ci/comandos-calidad.md).

GitHub Actions: [workflow rápido del backend](docs/ci/workflow-rapido.md), con tipos, lint, formato gradual, pruebas Vitest, compilación y artefactos para PR y pushes a `master`.

Tras aprobar los controles rápidos, se ejecuta [integración MariaDB y runtime compilado](docs/ci/integracion-runtime.md) con el runner desechable existente.

Ejecución completa aprobada en GitHub, diagnóstico y tiempos: [validación remota de CI](docs/ci/validacion-remota-20261010.md).

Política activa de `master`, checks obligatorios y trabajo mediante PR: [flujo diario y protecciones](docs/ci/flujo-diario-y-protecciones.md).

Actualizaciones mediante Dependabot, auditoría periódica y revisión de dependencias en PR: [mantenimiento y seguridad](docs/ci/mantenimiento-y-seguridad.md).


