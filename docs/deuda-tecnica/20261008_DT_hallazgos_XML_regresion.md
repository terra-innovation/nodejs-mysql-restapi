# Hallazgos al ampliar pruebas de XML, aprobación y estados

Fecha: 2026-10-08, America/Lima. DT-XML-01 y DT-XML-02 cerrados en código
y pruebas de regresión. Los límites de integración descritos abajo siguen abiertos.

## DT-XML-01 — Fecha de vencimiento al persistir

Estado: corregido manualmente por el usuario. Se confirmó que el constructor usa
`new Date(facturaJson.fecha_vencimiento)`. Las pruebas activas comprueban
emisión 2026-10-01 frente a vencimiento 2026-12-01, el vencimiento ausente nulo
y el payload enviado al DAO. La siguiente descripción conserva el hallazgo original.

Fuente: [getFacturaToCreate](../../src/utils/facturaUtils.ts).

El parser extrae correctamente `DueDate`. Sin embargo, el constructor asigna:

```ts
fecha_vencimiento: facturaJson.fecha_vencimiento
  ? new Date(facturaJson.fecha_emision)
  : null
```

En el XML sintético, emisión es 2026-10-01 y vencimiento 2026-12-01.
El JSON y la respuesta HTTP conservan 2026-12-01; el payload destinado al DAO
utiliza 2026-10-01. La asignación se confirmó por revisión del código; no se
consultaron facturas de producción. La suite valida extracción y respuesta,
pero no cuenta la persistencia correcta del vencimiento como cubierta.

El criterio `DT-XML-01` ya tiene regresión activa y salió de `todo`.
Evaluar por separado los registros afectados y su fuente antes de corregir
datos históricos.

## DT-XML-02 — Moneda de los ítems al persistir

Estado: corregido cambiando `moneda: item.cantidad` por `moneda: item.moneda`.
Cuatro casos nuevos comprobaron el fallo antes de corregirlo y pasan después:
PEN/USD en el constructor y en el registro real hasta el DAO. La cantidad
permanece "2". La siguiente descripción conserva el hallazgo original.

Fuente: [getItemsToCreate](../../src/utils/facturaUtils.ts).

El parser extrae la moneda desde `LineExtensionAmount.$.currencyID`.
El constructor utiliza `moneda: item.cantidad`. En el fixture la cantidad es
"2" y la moneda "PEN"; el payload recibe "2". Se confirmó la asignación por
revisión del código; no se inspeccionaron registros de producción.

La suite valida moneda distinta de cantidad y PEN/USD en los payloads.
`DT-XML-02` salió de `todo`; la lectura posterior con MariaDB sigue pendiente.
No se modificaron datos históricos.

## Límites transaccionales y de estados

- El registro administrativo guarda cabecera, detalles y vínculos en una
  transacción y consulta la moneda en otra. Un error de la segunda consulta
  se propaga después de las primeras escrituras. Las pruebas comprueban esta
  separación; no certifican atomicidad de ambas operaciones ni rollback real.
- La aprobación comprueba pertenencia y vigencia. Se ejecutan los DAOs reales
  sobre clientes mínimos para verificar propietario, operación, estado de
  propuesta 4 y registro activo. No garantiza exclusión mutua ante solicitudes
  simultáneas.
- Crear historial actualiza el estado actual. Editar/activar/eliminar una entrada
  de historial no actualiza el estado actual de la operación.
- El servicio de historial comprueba existencia del estado destino, sin una
  matriz explícita de transiciones permitidas origen/destino. La suite valida
  efectos de los estados 29, 10 y 36; no inventa prohibiciones o idempotencia
  como reglas aprobadas.
- Correo y Telegram se sustituyen. Se comprueban destinatarios, datos y fallos
  de correo sin enviar mensajes. En aprobación Telegram se invoca sin `await`;
  no se afirma entrega ni manejo de rechazos asíncronos del proveedor.
- `/admin/factura/factor/subir` requiere actualmente rol 3. Las pruebas conservan
  el permiso del router real, sin cambiarlo por su prefijo.

## Próximas comprobaciones

1. Comprobar lectura posterior de ambos campos con persistencia real en MariaDB.
2. Probar persistencia, restricciones, rollback y concurrencia con MariaDB 11.4
   desechable y protección contra URLs de producción.
3. Acordar la matriz de transiciones si se requieren restricciones adicionales.
4. Ampliar la carga específica del empresario (duplicados, empresa, elegibilidad
   y creación de operación), diferente del registro administrativo cubierto aquí,
   y el recorrido completo hasta liquidación con lectura real.

DT-XML-01/02 tienen regresión activa en
[`facturaXML.business.test.ts`](../../tests/vitest/unit/facturaXML.business.test.ts)
y [`facturaRegistro.business.test.ts`](../../tests/vitest/unit/facturaRegistro.business.test.ts).
Validación: 327 casos aprobados, 8 `todo`, cobertura CI y controles de tipos
aprobados. Los ocho criterios restantes siguen abiertos en sus documentos.
