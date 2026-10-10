# Actualización de ip-range-check a 0.2.1

Fecha: 9 de octubre de 2026.

## Alcance y decisiones

- Se actualiza ip-range-check de 0.2.0 a la versión exacta 0.2.1 mediante npm, conservando package-lock.json en formato 2.
- La instalación se realizó sin scripts de instalación ni auditoría automática.
- La nueva versión incorpora ipaddr.js 2.5.0 como dependencia transitiva propia. Se conserva ipaddr.js 1.9.1 requerido por otras dependencias.
- Se conserva el middleware de control de IP, sus listas de acceso y sus respuestas HTTP. No se requirieron cambios de código.

## Validación y límites

Se ejecutó `npm.cmd run build` con Node 24.21.0 portable, verificando versión y ruta del ejecutable. Finalizaron correctamente la generación del cliente Prisma 7.10.0 mediante el prebuild existente, la comprobación de tipos con `tsc --noEmit` y la compilación ESM de la API y los dos scripts programados. No hubo errores de compilación que corregir.

Por instrucción del usuario no se ejecutaron pruebas. Tampoco se arrancó el servidor ni se ejecutó el empaquetado de producción. La compilación no verifica el comportamiento del filtro con direcciones IPv4, IPv6, rangos CIDR ni solicitudes a través del proxy.
