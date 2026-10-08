# Regresión del backend compilado — 2026-10-08

## Ejecución repetible

```powershell
npm run test:runtime
```

Requiere Docker con contenedores Linux, dependencias instaladas y el cliente
Prisma generado para el equipo. Reutiliza el runner y la estructura inicial
guardada de integración; no consulta ni copia datos de desarrollo/producción.
MariaDB 11.4.10 se crea exclusivamente para esta ejecución y se elimina al terminar.
El comando termina con error si la compilación o las expectativas fallan.
También forma parte de `npm run test:integration`, como `runtime.test.ts`.

## Dos pruebas implementadas

1. Comprueba tipos del backend y compila con la configuración existente de
   `tsup.config.ts`, cambiando únicamente el directorio de salida. Inicia
   `index.js` en un proceso Node real. Solicita `/ping` por HTTP y exige 200
   con `{ "result": "pong" }`, obtenido mediante una transacción Prisma real.
   Solicita el cierre, exige código 0 y los mensajes de desconexión Prisma y
   finalización del hook; después comprueba que HTTP ya no responde.
2. Inicia el mismo compilado con una contraseña deliberadamente incorrecta
   de la misma MariaDB desechable. Exige agotamiento de reintentos, código 1,
   ausencia del mensaje de servidor iniciado y ausencia de respuesta HTTP.

No se sustituyen app, configuración, Prisma, logger ni manejador de cierre.
La configuración del proceso usa `NODE_ENV=production`, secretos sintéticos,
Telegram desactivado y proveedores de tipo de cambio dirigidos a localhost.
Se permite únicamente localhost en la lista IP sintética. La petición incluye
el Origin admitido por CORS y User-Agent válido. No se heredan conexiones,
secretos ni `NODE_OPTIONS` del proceso padre; tampoco se cargan archivos `.env`.

## Aislamiento y reportes

Compilado, archivos IP y logs del proceso quedan en una carpeta aleatoria bajo
`coverage/mariadb/runtime/`. Se verifica su ruta antes de eliminarla. No se
modifican `dist`, listas IP del proyecto ni ZIPs; no se ejecuta `build-prod`.
Los procesos hijos que no terminaron se finalizan en la limpieza.

- `coverage/mariadb/runtime/result-<runId>.json`: versión de Node, plataforma,
  arquitectura, compilación, casos aprobados y forma de entrega de señal.
- `coverage/mariadb/junit.xml`: resultado Vitest; se reemplaza en cada ejecución.
- `coverage/mariadb/run-<runId>.json` y `last-run.json`: preparación y limpieza
  del contenedor. Verificar fecha y runId; un reporte anterior puede persistir.

No se guardan credenciales, variables de entorno ni el contenido de logs del
proceso en el reporte runtime. Estos artefactos están ignorados por Git.

## Evidencia y límites

Ejecución inicial `573c893dfb109e1f4a23ab67`: 2/2 pruebas aprobadas,
MariaDB eliminada y carpeta temporal eliminada. Comprobación de tipos de
integración aprobada. Windows con Node 20.20.2; el reporte registra la
arquitectura efectiva. No se certifica todavía Ubuntu ARM64.
Repetición de la versión final `9cb6db0cdaf3d53cc805eacf`: 2/2 aprobadas,
tipos y compilación aprobados, reporte runtime `passed`, plataforma Windows
x64, MariaDB eliminada y carpeta temporal eliminada.

En Linux se entrega `SIGTERM` nativo. Windows no ofrece esa misma entrega con
`child.kill`; un módulo exclusivo de prueba recibe IPC y emite SIGTERM en el
proceso hijo para activar el hook real. El módulo no modifica el backend.
Esta evidencia comprueba el hook, no señales nativas POSIX en Windows.

El cierre actual desconecta Prisma y ejecuta `process.exit(0)`. No retiene el
servidor HTTP para esperar solicitudes en curso, por lo que no se declara
drenaje de peticiones ni cierre seguro durante una operación de negocio.
Tampoco se prueban aquí puerto ocupado, caída posterior de BD, PM2, Nginx,
HTTPS, jobs, envíos externos ni rendimiento. No se cambiaron esos comportamientos.

La matriz aumenta de 494 a 496 casos en 16 archivos. Esta ampliación ejecutó
solo los dos casos nuevos; no constituye una nueva ejecución completa de los 496.

## Próximo paso recomendado

Repetir `npm run test:runtime` y las regresiones de negocio en un entorno
Linux ARM64 equivalente a producción, con el cliente Prisma generado para
ese entorno. Conservar reportes y versiones como referencia antes de migrar.
