# Migración de SheetJS a 0.20.3

## Alcance

- Se sustituye `xlsx@0.18.5` del registro npm por la distribución oficial versionada `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`.
- `package-lock.json` conserva la URL y la integridad del paquete. npm elimina las dependencias transitivas que ya no requiere esta distribución.
- Los dos consumidores, `src/services/admin/emailVentaFrio.Service.ts` y `scripts/excel/excel-to-json.js`, usan importación ESM por namespace y registran `fs` mediante `xlsx.set_fs(fs)`, como requiere SheetJS para `readFile` y `writeFile` en ESM.
- Se conservan la selección de hojas, las conversiones de fechas, los datos y la lógica de envío de correos.

## Validación y límites

- `npm.cmd run build` terminó correctamente con Node 24.21.0 portable. Incluye la generación local del cliente Prisma, `tsc --noEmit` y la compilación con tsup de la API y las tareas programadas.
- No se ejecutaron pruebas, scripts de Excel, envíos de correo, auditorías ni empaquetado de producción, por indicación del usuario.
- La compilación no demuestra lectura y escritura correctas de archivos reales ni compatibilidad funcional de formatos heredados. Esa verificación queda pendiente.
- Las instalaciones reproducibles necesitan acceso al CDN oficial de SheetJS; el paquete está fijado a una URL de versión, no a una URL flotante.

Fuente: [instalación y uso ESM oficiales de SheetJS](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/).
