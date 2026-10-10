# Migración de dependencias complementarias

Fecha: 9 de octubre de 2026.

## Alcance

Se actualizan exclusivamente las seis dependencias solicitadas y sus dependencias transitivas mediante npm. Se fijan versiones exactas en package.json y se conserva package-lock.json en formato 2.

| Dependencia | Antes | Después | Grupo |
| --- | --- | --- | --- |
| dotenv | 16.4.5 | 18.0.7 | Producción |
| html-to-text | 9.0.5 | 10.0.1 | Producción |
| pino-roll | 3.1.0 | 4.0.0 | Producción |
| cross-env | 7.0.3 | 10.1.0 | Desarrollo |
| globals | 15.8.0 | 17.13.0 | Desarrollo |
| pdfjs-dist | 5.5.207 | 6.4.299 | Desarrollo |

La instalación se realizó con --ignore-scripts --no-audit --no-fund. No se cambiaron código de negocio, contratos HTTP, permisos, fórmulas, plantillas, opciones de rotación ni scripts del proyecto. No fue necesario corregir código para compilar.

## Revisión de compatibilidad

- dotenv: se conservan las llamadas config/parse y la selección de archivos de entorno. Durante el prebuild se observó el nuevo mensaje informativo de carga, sin valores de las variables. Dotenv 18 incorpora un comando llamado dotenv; la instalación local ahora resuelve ese comando al paquete dotenv, mientras dotenv-cli continúa instalado. Los scripts de package.json y la configuración .vscode revisados no invocan ese comando. No se retiró dotenv-cli ni se verificaron comandos externos o personales; no asumir equivalencia entre sus interfaces.
- html-to-text: se conserva htmlToText y sus opciones en TemplateManager. La versión 10.0.1 requiere Node >=20.19.0 y actualiza el parser HTML; la compilación no demuestra igualdad del texto convertido.
- pino-roll: se conserva el transporte de Pino y las opciones file, frequency, mkdir, size, limit, dateFormat y extension. La versión 4 documenta nombres de archivo con la extensión al final y el alcance de retención por proceso. No se comprobó escritura, rotación ni limpieza de registros existentes.
- cross-env: se conservan los scripts y sus variables TZ/NODE_ENV. La versión 10.1.0 requiere Node >=20. No se ejecutaron scripts de pruebas ni tareas programadas.
- globals: se conserva globals.node en la configuración de ESLint. No se ejecutó lint.
- pdfjs-dist: se conserva el import legacy/build/pdf.mjs utilizado por las suites PDF. La versión 6.4.299 requiere Node >=22.13.0 o >=24 y actualiza la dependencia opcional nativa @napi-rs/canvas. Es una herramienta de pruebas; no sustituye PDFKit ni modifica el generador de documentos del backend.

## Compilación y límites

Se ejecutó npm.cmd run build antes y después de instalar las seis dependencias. Ambas ejecuciones finalizaron con código 0 bajo Node 24.21.0 portable, verificando node --version y process.execPath antes de cada ejecución.

El build ejecutó el prebuild de generación del cliente Prisma 7.10.0, la comprobación de tipos con tsc --noEmit y tsdown 0.23.0. Generó la API y los dos scripts programados en dist. La generación del cliente no aplicó migraciones ni conectó a una base de datos.

Por instrucción del usuario no se ejecutaron pruebas. Tampoco se arrancaron servidores, se enviaron correos, se procesaron PDF ni se ejecutó build-prod. El build principal excluye las suites de pruebas: no certifica los imports ni la ejecución de PDF.js en esas suites. La compilación tampoco verifica comportamiento de conversión HTML, carga de entorno en todos los procesos, rotación de logs ni ejecución de los scripts con cross-env. El target node18 del bundler se conserva; no certifica soporte de Node 18 para estas dependencias.

## Referencias

- [Dotenv: cambios](https://github.com/motdotla/dotenv/blob/master/CHANGELOG.md).
- [HTML to Text: cambios](https://github.com/html-to-text/node-html-to-text/blob/master/packages/html-to-text/CHANGELOG.md).
- [Pino Roll 4](https://github.com/mcollina/pino-roll/releases/tag/v4.0.0).
- [Cross-env 10.1.0](https://github.com/kentcdodds/cross-env/releases/tag/v10.1.0).
- [Globals 17.13.0](https://www.npmjs.com/package/globals/v/17.13.0).
- [PDF.js: distribución estable](https://mozilla.github.io/pdf.js/getting_started/).
