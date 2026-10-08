# Hallazgos de integración real con MariaDB 11.4.10

Fecha: 2026-10-08. Suite: `tests/mariadb/business.test.ts`.
Datos y archivos sintéticos; estructura exportada previamente de desarrollo.
No se consultan ni modifican desarrollo/producción al ejecutar las pruebas.

## DT-IT-01 — Aprobación concurrente duplicada (abierto)

El servicio `acceptFactoringpropuestaService` verifica propuesta vigente
(estado 4) mediante una lectura y después escribe el historial y actualiza
la propuesta sin exigir en la escritura que siga vigente.

Reproducción estable: dos transacciones reales leen la misma propuesta vigente;
se deja confirmar la primera antes de liberar la segunda. El coordinador solo
pausa el retorno de la lectura real del DAO; no inventa resultados ni sustituye
escrituras, servicios o transacciones. No depende de sleeps ni de carga del equipo.

Resultado observado: **dos aprobaciones exitosas, dos historiales de propuesta,
dos historiales de factoring y dos invocaciones de cada proveedor de notificación**.
No se enviaron mensajes reales: email y Telegram están sustituidos por spies.
La repetición secuencial sí se rechaza, pero no protege la carrera concurrente.

La prueba exige una sola aprobación y un registro por historial. Permanece activa
y falla: no se usa `skip`, `todo`, `fails` ni una expectativa de duplicación para
hacer pasar el diagnóstico. `npm run test:integration` retorna código 1 hasta
resolver el defecto. El JUnit y `last-run.json` reflejan el fallo y la limpieza.

Próximo cambio recomendado: hacer indivisible la validación de vigencia y la
actualización (por ejemplo actualización condicional o bloqueo/revalidación),
antes de generar historiales/notificaciones. Validar también dos propuestas
distintas de la misma operación al diseñar la protección. Esta entrega incorpora
pruebas y diagnóstico; no cambia el servicio ni define nuevas transiciones.

## DT-IT-02 — Importación confirmada antes del enriquecimiento (abierto)

La importación administrativa usa una transacción para cabecera, detalles y
vínculos, seguida de otra para consultar el maestro de moneda. Con XML EUR
sintético y sin maestro EUR, la segunda etapa falla, pero la factura, el ítem
y sus dos vínculos ya permanecen guardados. La prueba caracteriza esta frontera
actual; no la declara política comercial aprobada ni atomicidad completa.

Próximo paso: decidir si validar la moneda antes de guardar o integrar la consulta
en la primera transacción; cubrir también errores posteriores del flujo empresario.

## Comprobaciones aprobadas

- PEN/USD: parser y servicio administrativo reales, guardado y lectura de moneda
  y cantidad del ítem, emisión/vencimiento, notas, cuotas, impuestos, medios de
  pago y vínculos; lectura adicional mediante DAO real.
- Vencimiento ausente: NULL en MariaDB.
- XML mal formado/boleta: rechazo sin escritura parcial.
- Fallo SQL tardío al vincular PDF: rollback de cabecera, detalles y vínculo XML.
- Aprobación normal: propuesta 6, operación 4, vínculo aceptado, ambos historiales
  y rechazo de repetición secuencial o actor ajeno.
- Fallo SQL al actualizar la operación y fallo de proveedor de email: rollback
  de cambios de estado, vínculo aceptado y ambos historiales.

Los fallos SQL se provocan mediante triggers temporales en la base exclusiva;
se eliminan en `finally`. Las FK permanecen activas durante las pruebas y limpieza.
Las fixtures se eliminan entre casos y el runner elimina el contenedor al terminar.

Resultado: **16 pruebas reales: 15 aprobadas y 1 fallida (DT-IT-01)**.
Tipos de integración aprobados. Contenedor eliminado aun con la suite fallida.
No es una prueba completa de subida HTTP/Multer ni de entrega real de mensajes,
elegibilidad empresarial, liquidación, transferencias o todas las transiciones.
