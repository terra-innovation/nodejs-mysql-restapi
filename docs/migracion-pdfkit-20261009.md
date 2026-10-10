# Actualización de PDFKit y pdfkit-table

Fecha: 9 de octubre de 2026.

## Alcance

- PDFKit pasa de 0.16.0 a la versión exacta 0.20.2.
- pdfkit-table pasa de 0.1.99 a la versión exacta 0.2.11.
- Se actualizan `package.json` y `package-lock.json` mediante npm, conservando el formato 2 del lockfile. La instalación se realizó con `--ignore-scripts --no-audit --no-fund`.
- No fue necesario modificar `src/utils/document/PDFgenerator.ts` para compilar. Se conservan las plantillas y llamadas existentes; no se cambian fórmulas, fechas, permisos ni contratos HTTP.

## Dependencia interna y limitación

pdfkit-table 0.2.11 declara `pdfkit: ^0.18.0`. El árbol instalado contiene PDFKit 0.20.2 como dependencia directa y PDFKit 0.18.0 dentro de pdfkit-table. Se conserva el rango declarado por el paquete, sin overrides.

El generador de Factoring importa PDFDocument desde pdfkit-table, por lo que utiliza la copia interna 0.18.0, no la dependencia directa 0.20.2. Unificar ambas versiones requeriría otra decisión de compatibilidad y validación funcional; esta actualización no lo demuestra.

## Compilación y límites

Se ejecutó `npm.cmd run build` antes y después de actualizar, con Node 24.21.0 portable en `D:\Herramientas\node-v24.21.0-win-x64\node.exe`, verificando versión y ruta del ejecutable. Ambas compilaciones finalizaron correctamente: generación del cliente Prisma, comprobación de tipos con `tsc --noEmit` y compilación ESM de la API y los dos scripts programados.

`npm.cmd ls pdfkit pdfkit-table --all` confirmó las versiones indicadas. Por instrucción del usuario no se ejecutaron pruebas. Tampoco se arrancó el servidor, generaron PDF ni ejecutó `build-prod`. Quedan pendientes la revisión visual de simulación, propuesta y liquidación, y sus flujos de descarga y correo.

Referencias: [PDFKit 0.20.2](https://github.com/foliojs/pdfkit/releases/tag/v0.20.2) y [metadatos de pdfkit-table 0.2.11](https://registry.npmjs.org/pdfkit-table/0.2.11).
