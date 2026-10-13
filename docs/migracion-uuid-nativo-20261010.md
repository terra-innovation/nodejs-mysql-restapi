# Migración de UUID a Node — 10 de octubre de 2026

Se sustituye la generación `uuid.v4()` por `randomUUID()` importado de
`node:crypto`. Se retira `uuid` mediante npm, actualizando `package.json` y
`package-lock.json`, sin scripts de instalación ni actualizaciones de otros paquetes.

Se conservan UUID v4, recortes para códigos cortos, nombres de archivos y la
prioridad del encabezado `X-Correlation-Id`. No se modifican IDs existentes,
contratos HTTP, reglas financieras, transacciones ni el esquema de MariaDB.
Los archivos afectados se normalizan con el formateador del proyecto; se
comprobó que, descontando el formato, el cambio se limita a imports y llamadas.

## Validación

Ejecutada con Node 24.21.0 portable, verificando versión y ruta del ejecutable.

- `npm test`: misma selección y expectativas aprobadas antes y después; los
  criterios pendientes continúan pendientes. Estas pruebas rápidas no prueban
  persistencia real.
- `npm run typecheck:all`: aprobado antes y después, incluyendo backend,
  pruebas rápidas e integración.
- `npm run lint`: mantiene el error previo `no-useless-escape` en
  `src/utils/validationInputs.ts` y el mismo total de advertencias; no se
  corrige código ajeno a la migración.
- `npm run test:runtime`: aprobado tras la migración. Verifica arranque del
  backend compilado, HTTP con consulta real a MariaDB, cierre y rechazo de
  credenciales incorrectas. Ejecución `d175b80a0d81fa7ff0035ae2`, estado
  `passed` y limpieza `removed`. No se obtuvo una línea base previa de runtime.
- Comprobación de formato de archivos modificados y `git diff --check`.

Vitest encontró `EPERM` al resolver archivos dentro del aislamiento; la misma
selección se ejecutó correctamente fuera de él. El aislamiento también impidió
el acceso a Docker; la prueba de runtime utilizó el runner existente fuera del
aislamiento, con MariaDB desechable y sin consultar bases compartidas.

Los registros locales quedan en `coverage/uuid-migration/`; el resultado de
runtime y su limpieza se comprobaron en `coverage/mariadb/last-run.json`.
No se ejecutó `build-prod`, despliegue ni la suite completa de integración.
