# Actualización de cors a 2.8.6

Fecha: 9 de octubre de 2026.

## Alcance

- Se actualiza cors de 2.8.5 a la versión exacta 2.8.6 en package.json y package-lock.json mediante npm, conservando el lockfile en formato 2.
- Instalación con scripts desactivados y sin auditoría automática. No se actualizan otros paquetes.
- Se conserva el middleware CORS, sus orígenes permitidos, encabezados y manejo de errores. No fue necesario corregir código.

## Validación y límites

- Se ejecutó npm.cmd run build antes y después de la actualización, con Node 24.21.0 portable, verificando versión y ruta del ejecutable.
- Ambas compilaciones finalizaron correctamente: generación del cliente Prisma 7.10.0, comprobación de tipos y compilación ESM de la API y scripts programados con tsdown.
- Por instrucción del usuario no se ejecutaron pruebas. Tampoco se arrancó el servidor ni se ejecutó build-prod.
- La compilación no verifica respuestas CORS en ejecución, solicitudes preflight ni integración con el navegador.
