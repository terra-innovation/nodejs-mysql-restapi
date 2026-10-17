# Sincronización de temporales en la prueba PDF del empresario

La recepción completa del PDF por el cliente HTTP no garantiza que el controlador
haya terminado el `unlink` asíncrono de su bloque `finally`. Comprobar la carpeta
inmediatamente después de la respuesta puede producir un fallo intermitente.
El nombre temporal ya incluye `randomUUID()`; añadir segundos o milisegundos no
resuelve esta sincronización.

La suite `tests/vitest/http/factoringpropuestaPDF.empresario.test.ts` espera hasta
un segundo, comprobando cada 10 ms, que no quede ningún temporal después de las
descargas exitosas. Conserva la exigencia de dos rutas distintas, respuestas 200,
contenido PDF válido y carpeta vacía. Las comprobaciones de errores y ausencia de
generación siguen siendo inmediatas.

El caso concurrente realiza el envío real y bloquea su retorno al controlador con
una promesa controlada por la prueba. Comprueba que ambos temporales existen tras
recibir las respuestas, libera la promesa en `finally` y exige su eliminación.
Esta reproducción falla con la comprobación inmediata y pasa con la espera
acotada; no introduce una pausa fija ni modifica el código de producción.

## Evidencia local del 17 de octubre de 2026

- Revisión de partida: `659d204`; cambios limitados a esta suite y este documento.
- Windows, Node portable 24.21.0, `CI=true`, `TZ=UTC`, `NODE_ENV=test`.
- Suite original: 22 pruebas aprobadas. Reproducción controlada con aserción
  inmediata: fallo por temporales presentes, con rutas distintas.
- Suite corregida: 22 pruebas aprobadas; comprobación de tipos Vitest aprobada.
- El aislamiento impidió conexiones HTTP locales (`EACCES`); la suite se ejecutó
  fuera del aislamiento. Se simulan datos y proveedores externos, sin acceso a
  MariaDB compartida.

La evidencia local no certifica el PR en Ubuntu. Falta ejecutar los controles
remotos sobre el commit que incluya la corrección. No se ejecutó la suite completa
ni integración MariaDB: el cambio está limitado a sincronización de esta prueba.
