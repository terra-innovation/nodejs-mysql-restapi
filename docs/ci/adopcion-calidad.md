# Adopción gradual de calidad: punto 4

## Decisiones

- Reutilizar `eslint --fix` mediante `npm run lint:fix` para los patrones que ya reconoce la herramienta. No duplicar esas reglas con un script propio ni afirmar un ahorro de tokens medido.
- Desactivar `no-undef` únicamente para TypeScript: la regla JavaScript no interpreta los namespaces de tipos, como `Express.Multer.File`. TypeScript sigue comprobando los nombres; JavaScript conserva la regla.
- Retirar inicializaciones sobrescritas en ambas ramas del cálculo de liquidación y de la sincronización SUNAT/SBS. Conservar las ramas, fórmulas, redondeos y manejo de errores.
- En la carga de factura, eliminar un resultado descartado de `removeAttributesPrivates`, después de verificar que la utilidad devuelve una copia y no modifica el objeto original. Conservar la secuencia efectiva de filtrado y la respuesta HTTP.
- Unificar imports duplicados y retirar anotaciones inferibles mediante ESLint. Conservar `.js` en el import ESM de ratelimiter.
- Formatear solo los archivos modificados. El script `scripts/quality/format-changed.mjs` usa Git y la API de Prettier instalada, respeta exclusiones, admite archivos nuevos y staged, y permite `--base` para cambios confirmados. No ejecuta el código revisado ni descarga herramientas.

## Uso habitual

```powershell
npm.cmd run lint:fix
npm.cmd run format:changed:write
npm.cmd run lint
npm.cmd run format:changed
```

Usar el Node portable indicado en la [guía de comandos](comandos-calidad.md), revisar el diff y comprobar tipos. Los comandos de escritura son acciones deliberadas del desarrollador; el futuro CI debe usar las variantes de comprobación.

## Límites y pendientes

Las advertencias de `any` y variables sin usar requieren clasificación y revisión por módulo; no conviene borrarlas en bloque, porque pueden formar parte de contratos, firmas o manejo de errores. Se conservan visibles y no se han degradado errores a advertencias para aprobar lint.

El formato histórico fuera de los archivos modificados sigue pendiente. `format:check` lo informa; el control gradual es `format:changed -- --base <base-del-PR>`, con la referencia y el merge base disponibles. No equivale a certificar el formato de todo el repositorio.

No se ejecutan pruebas por la restricción vigente del usuario. La comprobación de tipos y la compilación no demuestran equivalencia funcional ni integración real con MariaDB. `prisma-sync` y `build-prod` quedan fuera de este trabajo.

Los registros de esta ejecución quedan localmente en `coverage/ci-adoption/`, ignorado por Git.

## Validación del 10 de octubre de 2026

Con Node 24.21.0 portable y npm 11.19.0:

| Comprobación | Resultado |
| --- | --- |
| `npm run lint` | Aprobado, sin errores; permanecen advertencias para revisión gradual |
| `npm run typecheck:all` | Aprobado en backend, Jest, Vitest y MariaDB; sin ejecutar pruebas |
| `npm run format:changed` | Aprobado, sin diferencias en los archivos modificados |
| `npm run format:changed -- --base HEAD` | Aprobado, incluyendo los cambios de trabajo actuales |
| `npm run build` | Aprobado: Prisma, comprobación de tipos y tsdown |
| `git diff --check` | Aprobado |

Se ejecutó la compilación con `NODE_ENV=production` para que la configuración de Prisma no cargara archivos `.env`; la generación del cliente no consultó la base de datos. La compilación escribió `dist` y el cliente generado, ambos ignorados por Git. El target de tsdown sigue siendo el `node18` existente (compatibilidad de sintaxis de salida), aunque la herramienta se ejecutó con Node 24; su revisión corresponde al paso de compilación del plan.

La revisión estática del JavaScript normalizado antes y después aisló las diferencias a inicializaciones descartadas, filtrado redundante e imports duplicados. Las ramas y fórmulas de liquidación permanecen iguales; esta revisión no sustituye pruebas funcionales. El lockfile, el esquema Prisma y las suites no cambiaron.
