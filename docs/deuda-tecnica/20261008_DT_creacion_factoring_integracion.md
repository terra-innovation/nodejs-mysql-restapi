# Creación de factoring y actualización administrativa de líneas

Fecha: 2026-10-08. Suite real: `tests/mariadb/operation.test.ts`.
El usuario confirmó mantener el comportamiento actual: crear la operación
no reserva ni consume líneas. Los saldos se actualizan desde administración.

## DT-IT-04 — Concatenación de importes Decimal (corregido)

El servicio sumaba los valores Prisma Decimal usando `+`. En una operación
con dos facturas, bruto 1180 y 100.25 se guardaba como 1180100.25, y neto
1180 y 90.15 como 118090.15. Una factura aislada podía ocultar el defecto.

Las cuatro sumas (bruto, neto, detracción y retención) ahora usan
`Prisma.Decimal.plus`, partiendo de Decimal cero y tratando NULL como cero.
No se cambian las fórmulas: se suman los mismos campos con aritmética decimal.
La prueba exige 1280.25, 1270.15, 5.05 y 5.05, dos asociaciones y la fecha de
emisión más antigua. El importe declarado por el cliente no sustituye los
importes persistidos de las facturas.

## DT-IT-05 — Doble creación concurrente con la misma factura (corregido)

Antes: dos transacciones podían leer ausencia de duplicados y confirmar dos
operaciones activas con la misma factura, duplicando historiales, asociaciones
e invocaciones de correo. La prueba inicial falló exigiendo una sola operación.

Ahora, en producción, `lockFactoringCedente` adquiere un bloqueo de fila sobre
el cedente indicado por la solicitud. Se repite la consulta de factura activa
después de adquirirlo. La transacción de creación usa `ReadCommitted` para
que la solicitud que espera vea el commit anterior, en lugar de un snapshot
viejo. El bloqueo se libera con commit/rollback. El duplicado mantiene el 404
y mensaje existentes; no se cambia el criterio RUC/serie/número ni se crea
una reserva de línea o una tabla nueva.

Las solicitudes del mismo cedente se serializan durante esta transacción.
Se verifican la misma factura, copias XML con distintos IDs de factura,
solicitudes simultáneas sin coordinador y facturas distintas del mismo cedente
(ambas pueden crear su operación). La prueba coordinada pausa solo lecturas
reales iniciales; la revalidación posterior se ejecuta sin fabricar resultados.

## Alcance de las 27 pruebas nuevas

| Área | Casos | Evidencia |
|---|---:|---|
| Creación PEN/USD | 2 | Estado inicial 1, historial, actor, asociación, importe de BD y lectura del DAO; líneas intactas |
| Varias facturas | 1 | Sumas Decimal y emisión mínima |
| Referencias inexistentes | 8 | Factura, cedente, aceptante, cuenta, moneda, contacto, persona o colaborador: 404 sin escrituras parciales |
| Payload repetido | 1 | Restricción del vínculo revierte operación/historial; conserva facturas |
| Duplicado secuencial | 1 | Solo queda una operación y asociación |
| Fallos SQL/proveedor | 4 | Historial, asociación, segunda asociación y email: rollback completo |
| Concurrencia | 4 | Misma factura, copias XML, solicitudes sin coordinación, facturas distintas |
| Actualización de líneas | 3 | Factor/cedente/pagador: total 2000.25, usado 1180.10, disponible 820.15 y actor |
| Fallo SQL en líneas | 3 | Los saldos anteriores permanecen y otras líneas no cambian |

Servicios, DAOs, parser, Prisma y transacciones son reales; archivos y datos
son sintéticos. Configuración, almacenamiento y proveedores de mensajes
están aislados. Las fixtures se eliminan con FK activas y los triggers de fallo
se eliminan en `finally`; el runner elimina el contenedor incluso ante fallos.

La regresión de Jest de trazabilidad conserva sus 14 escenarios y sus
expectativas de fechas/importes. Solo se actualizaron sus mocks de infraestructura
para los DAOs de bloqueo/reserva/aprobación vigentes; no se eliminaron aserciones.

## Resultado y comandos

**73 pruebas reales aprobadas**: 27 de operaciones/líneas, 27 de registro XML
empresario, 15 de XML administrativo/aprobación y 4 de entorno.
**344 pruebas rápidas aprobadas**, 8 criterios previos pendientes de decisión;
**14 pruebas Jest de trazabilidad aprobadas**. Tipos backend/integración aprobados.

```powershell
npm run test:integration -- tests/mariadb/operation.test.ts
npm run test:integration
npm run test:vitest:ci
npm test -- --runInBand tests/unit/services/factoring.dateTrace.test.ts
```

## Límites y siguientes pasos

- Auditoría posterior de solo lectura: 35 operaciones en desarrollo, ninguna
  con varias facturas dentro del alcance; no se repararon datos. El comando
  repetible y sus límites se documentan en [auditoría e integración posterior](20261008_integracion_liquidaciones_transferencias_auditoria.md).
- Las fixtures usan cedente, pagador, moneda, cuenta y contacto coherentes.
  Los rechazos por referencia inexistente no certifican toda la política de
  pertenencia de facturas/cuentas/contactos ante payloads inconsistentes.
- Se prueba actualización administrativa de saldos; no se introduce consumo,
  reserva automática ni incrementos concurrentes de líneas. Esos cambios
  requerirían una decisión comercial diferente a la confirmada por el usuario.
- Email/Telegram permanecen en su punto actual dentro de la transacción; no
  se afirma atomicidad entre mensajes externos y commit de MariaDB.
- Liquidación y transferencias incorporan posteriormente 36 casos SQL reales;
  HTTP/Multer, proveedores externos y carga en Ubuntu ARM64 siguen pendientes.
