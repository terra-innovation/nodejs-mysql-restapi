# Actualización de Helmet a 8.3.0

Fecha: 9 de octubre de 2026.

## Alcance y decisiones

- Se actualiza Helmet de 8.1.0 a la versión exacta 8.3.0 en `package.json` y `package-lock.json`, mediante npm.
- La instalación se realizó sin scripts de instalación ni auditoría automática. Solo cambió el paquete Helmet.
- Se conserva la configuración existente en `src/middlewares/helmetMiddleware.ts`, incluidas CSP, HSTS y las políticas de origen.

## Validación y límites

Se ejecutó `npm.cmd run build` con Node 24.21.0 portable, verificando versión y ruta del ejecutable. Finalizaron correctamente la generación del cliente Prisma 7.10.0, la comprobación de tipos con `tsc --noEmit` y la compilación ESM de la API y los dos scripts programados. No fue necesario corregir código.

Por instrucción del usuario no se ejecutaron pruebas. Tampoco se arrancó el servidor ni se ejecutó el empaquetado de producción. La compilación no verifica las cabeceras HTTP efectivas ni el comportamiento del navegador.
