# Hallazgos de integración real con MariaDB 11.4.10

Fecha: 2026-10-08. Suite: `tests/mariadb/business.test.ts`.
Datos y archivos sintéticos; estructura exportada previamente de desarrollo.
No se consultan ni modifican desarrollo/producción al ejecutar las pruebas.

## DT-IT-01 — Aprobación concurrente duplicada (corregido)

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

Corrección autorizada: `claimFactoringApproval` reserva la operación mediante
un UPDATE condicional (`estado=1` y propuesta aceptada NULL). El bloqueo de fila
permanece hasta commit/rollback. Una segunda solicitud no puede sobrescribir
la aceptación, aunque intente una propuesta distinta: devuelve conflicto 409.
La reserva, los estados y ambos historiales están en la misma transacción.

`approveFactoringpropuestaVigente` utiliza otro UPDATE condicional en SQL
(propuesta correcta, operación correcta, estado de propuesta 4 y registro activo)
antes de leer el resultado. No depende de una lectura de snapshot para decidir
vigencia. Si no afecta una fila, devuelve 409 y revierte también la reserva.
Una prueba real invalida la propuesta desde otra conexión después de leerla.

Las pruebas originales siguen activas con aprobación única. Se añaden dos
propuestas distintas de la misma operación y solicitudes simultáneas sin
coordinador. La repetición secuencial conserva el rechazo 404 existente.
No se modifican esquemas, registros históricos ni cálculos financieros.

## DT-IT-02 — Importación confirmada antes del enriquecimiento (corregido en administración/financiero)

Antes de la corrección, la importación administrativa usaba una transacción para cabecera, detalles y
vínculos, seguida de otra para consultar el maestro de moneda. Con XML EUR
sintético y sin maestro EUR, la segunda etapa falla, pero la factura, el ítem
y sus dos vínculos permanecían guardados.

La consulta y enriquecimiento de moneda ahora ocurren dentro de la misma
transacción que cabecera, detalles y vínculos. Si falta el maestro se responde
422 con mensaje explícito y se revierte todo; también se propagan errores SQL
para provocar rollback. El perfil financiero delega en este mismo servicio.
La prueba EUR exige cero facturas/ítems/vínculos persistidos y conserva los
archivos previamente subidos. No se borran archivos ni se toca información histórica.

Ampliación posterior: `subirFacturaService` del empresario también se unificó
y se validó con 27 casos reales de elegibilidad, empresas, duplicados y rollback.
Ver [DT-IT-03](20261008_DT_XML_empresario_integracion.md).

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

Evidencia inicial: 16 pruebas, 15 aprobadas y 1 fallida (DT-IT-01).
Después de corregir: 19 pruebas reales aprobadas. La ampliación al empresario
elevó el total a 46. Con creación de factoring/líneas administrativas hay
**73 pruebas reales aprobadas**; ver [DT-IT-04/05](20261008_DT_creacion_factoring_integracion.md).
La suite rápida tiene 344 casos aprobados y 8 criterios pendientes de decisión.
Tipos de integración/backend aprobados y contenedor eliminado al finalizar.
La ampliación posterior llega a **114 pruebas**, incluidas 36 de liquidaciones y
transferencias y cinco del auditor histórico: [alcance posterior](20261008_integracion_liquidaciones_transferencias_auditoria.md).
No es una prueba completa de subida HTTP/Multer, entrega real de mensajes,
transferencias bancarias ni todas las transiciones.

Las notificaciones externas permanecen en el punto actual dentro de la
transacción. Esto no ofrece atomicidad entre mensajes externos y commit SQL;
una futura cola/outbox requeriría un diseño y pruebas específicos.
