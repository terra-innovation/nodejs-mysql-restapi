# Solicitudes repetidas y concurrentes: liquidaciones y transferencias

Fecha: 2026-10-08. Se añaden **12 pruebas SQL reales** en
`tests/mariadb/settlementConcurrency.test.ts`, sin modificar servicios,
fórmulas, esquema ni reglas de negocio. La transacción independiente del
calculador continúa como límite conocido, sin cambio autorizado ni programado.

## Resultados de caracterización

| Casos | Escenario | Comportamiento observado |
| --- | --- | --- |
| 2 | Liquidación repetida, PEN/USD, mismo payload | Dos cabeceras con UUID distintos y dos detalles completos por cabecera |
| 2 | Transferencia repetida, PEN/USD, mismo número de operación y archivo | Dos transferencias con UUID distintos; cada una tiene su propio vínculo a la misma constancia |
| 2 | Solicitudes simultáneas sin coordinación, una por flujo | Ambas terminan correctamente y guardan registros independientes completos |
| 2 | Ambas cabeceras insertadas antes de commit, una por flujo | Conexiones SQL distintas; otra conexión no ve las cabeceras sin confirmar; después ambas conservan sus detalles/vínculos |
| 2 | Liquidación concurrente: fallo antes/después del éxito | Error SQL en el segundo detalle revierte cabecera y primer detalle de la solicitud fallida; la otra conserva sus dos detalles e importes conciliados |
| 2 | Transferencia concurrente: fallo antes/después del éxito | Error SQL al vincular constancia revierte la transferencia fallida; la otra conserva su transferencia y vínculo; archivo existente intacto |

Los casos de liquidación usan pago con mora: saldo a favor 3614.85, dos conceptos
(garantía y mora) y conciliación del total firmado por cada cabecera. Los de
transferencia comprueban importe 4000.15 y exactamente un vínculo por registro.
Se comprueba que no quedan detalles ni vínculos adicionales de la solicitud fallida.

## Límite de deduplicación

Los servicios actuales no ofrecen idempotencia ni rechazan estos payloads
repetidos. Los registros duplicados son una observación reproducible; **no se
adopta como regla de negocio que deban permitirse ni se introduce una corrección**.
En particular, repetir número de operación y constancia no certifica una nueva
transferencia bancaria: las pruebas solo registran datos administrativos en SQL.

Antes de imponer restricciones, debe definirse qué identifica una repetición
y qué representa una operación legítima adicional. No corresponde asumir que
solo puede existir una liquidación o transferencia por factoring: podría haber
versiones de liquidación, ajustes, pagos parciales u otras reglas aún no definidas.
También falta decidir si una repetición debe devolver el resultado original o
rechazarse. La unicidad técnica de UUID no evita duplicación del contenido.

## Método y límites de validación

Servicios, Prisma, DAOs, transacciones y calculador reales sobre MariaDB 11.4.10
exclusiva y desechable, usando datos sintéticos. Solo se sustituyen configuración
local, logging y proveedores externos. No se consulta desarrollo ni producción.

Los casos coordinados ejecutan el INSERT original del DAO y lo pausan después,
antes de persistir detalles/constancia. Se comprueba `CONNECTION_ID()` y se liberan
las solicitudes en el orden indicado. Los fallos son triggers SQL temporales
selectivos para una solicitud. El coordinador libera y espera las solicitudes
en `finally`; los triggers y fixtures se eliminan entre casos.

Son pruebas de dos solicitudes y de intercalaciones concretas; no prueban carga
masiva, todas las carreras posibles, endpoint HTTP, envío de dinero, ni entrega
real de correo/Telegram. No verifican cambios de estado concurrentes en esta suite.

## Ejecución reproducible

```powershell
npm run test:integration -- tests/mariadb/settlementConcurrency.test.ts
npm run test:integration:typecheck
npm run test:integration
```

La integración completa pasa de 133 a **145 casos en ocho archivos**.
Las suites rápidas no cambiaron; no se volvieron a ejecutar en esta etapa.
JUnit y resumen con estado/limpieza quedan en `coverage/mariadb/`.
Validación completa: 145 casos aprobados, ocho archivos, cero fallos; tipos de
integración aprobados. RunId `ff53795491c6f1700a0e7b44`, estado `passed`, limpieza
`removed`. Se confirmó que no quedaron contenedores con la etiqueta del runner.

## Siguientes pasos propuestos

1. Ampliación posterior completada: 36 casos HTTP/Multer con MariaDB real,
   XML/PDF sintético, guardado/lectura, roles y rechazos; total 181. Ver
   [alcance y límites de limpieza](20261008_integracion_HTTP_Multer_facturas.md).
2. Cuando negocio lo defina, especificar identidad y respuesta de solicitudes
   repetidas antes de implementar deduplicación/idempotencia.

La política de deduplicación continúa sin implementación; el recorrido HTTP/Multer
se completó en la ampliación posterior indicada arriba.
