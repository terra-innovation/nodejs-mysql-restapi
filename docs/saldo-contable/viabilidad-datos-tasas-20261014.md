# Fuentes y viabilidad: alcance simple confirmado

Fecha: 14/10/2026. Este documento apoya el [plan](../plan-saldo-contable-sbs-20261014.md) y las [reglas vigentes](reglas-contables.md). Reemplaza la exploración inicial de fuentes alternativas: la fecha de cobro y el alcance ya fueron confirmados por el usuario.

## Fuentes elegidas

| Dato | Fuente | Uso |
| --- | --- | --- |
| Neto | factoring_propuesta.monto_neto de la propuesta aceptada enlazada | Base confirmada por pagador; copiar referencia e importe en detalle |
| Instrumentos | factoring_factura y sustento documental | Clasificar sin sustituir ni distribuir arbitrariamente neto de propuesta aceptada |
| Inicio | factoring.fecha_operacion | Comparar con corte y explicar datos faltantes |
| Cobro total | factoring_liquidacion.fecha_pago_efectivo | Solo liquidación vigente activa; cobro hasta corte excluye |
| Vigencia | getFactoringliquidacionVigenteByIdfactoring | Criterio actual funcional 4 y estado lógico; detectar varias vigentes |
| Multiplicador PEN | Decimal(1) | Convertir PEN a PEN sin consultar SBS |
| Multiplicador USD | sbs_tipo_cambio.precio_contable | USD/PEN, fecha exacta de corte, activo y válido |
| Tipo de operación | DESCUENTO confirmado | No deducirlo de nombres comerciales factoring |
| Instrumento SBS | Sustento por instrumento | Copiar clasificación/desglose en el detalle |

Referencias: [esquema](../../prisma/ft_factoring/schema.prisma), [creación de operación](../../src/services/empresario/factoring.Service.ts), [neto XML](../../src/utils/facturaUtils.ts), [DAO liquidación](../../src/daos/factoringliquidacion.Dao.ts), [DAO SBS](../../src/daos/sbstipocambio.Dao.ts).

No se requieren factoring_pago, factoring_ejecutado ni catálogo de pagos por factura para volver a decidir la fuente de cobro. La empresa confirmó que actualmente solo registra cobro total y que su fecha real está en la liquidación vigente.

## Persistencia confirmada

Dos tablas operativas y dos catálogos nuevas: período y detalle. El período guarda inicio/fin/corte DATE, Descuento, estados, versión, total PEN y cierre/auditoría. El detalle guarda operación, neto pendiente, moneda, multiplicador, referencia SBS nullable, importe PEN preciso y copias de fechas/código/clasificación. Unique período+operación, nunca unique global por operación.

La copia histórica vive en esas dos tablas operativas y dos catálogos. Los catálogos nuevos de estado/tipo están aprobados como parte del diseño; no añadir tablas de snapshots, eventos, abonos ni tipos de cambio. El desglose de instrumentos puede ser un dato estructurado del detalle. Recalcular explícitamente en elaboración y congelar al cerrar; pagos posteriores siguen permitidos.

La propuesta de descartar operaciones reportadas antes se retiró: una operación sigue sugerida en cada corte mientras permanezca impaga. No implementar NOT EXISTS contra todos los detalles históricos. Cada reporte es un saldo independiente, no se suman períodos sucesivos como movimientos.

## Observaciones técnicas separadas

- El productor de inicio escribe new Date al pasar al estado 36; cubrir fecha nula/contradictoria sin cambiar reglas históricas.
- La base elegida por el usuario es específicamente monto_neto de la propuesta aceptada, confirmado por pagador; no el neto inicial de la operación. Referenciar la propuesta utilizada y conservar copia al cierre.
- Las fechas operativas son editables, por lo que la pantalla de cerrado utiliza sus copias guardadas.
- Algunos productores SBS existentes guardan venta como respaldo contable o null. El upsert puede preservar contable anterior cuando no llega otro. Esto no demuestra que los registros actuales sean erróneos.
- obtenerSbsLogic puede sincronizar y escribir ante falta de caché; el reporte usa DAO de lectura estricta.
- Correcciones compartidas de sincronización y metadatos de procedencia siguen como trabajo separado, no requisito implícito para crear más tablas.

Referencias: [productor SBS](../../src/services/admin/tipocambio.Service.ts), [mantenimiento SBS](../../src/services/financiero/sbstipocambio.Service.ts), [inicio de operación](../../src/services/admin/factoringhistorialestado.Service.ts).

## Validación posterior

Las [consultas de diagnóstico](verificacion-datos.sql) están preparadas y no ejecutadas. Revisan integridad de netos, liquidaciones vigentes y contables de cortes de referencia; son opcionales en copia autorizada y no se piden para volver a definir fuentes confirmadas.

La implementación se valida con pruebas enfocadas de calendario flexible, cobro al corte, repetición entre períodos, PEN1/USDcontable, dos tablas operativas y dos catálogos, rollback/concurrencia y cierre inmutable; frontend manual salvo autorización explícita. La revisión estática no certifica datos históricos ni ejecución de aplicación.

**Siguiente paso del plan:** validar [campos y relaciones propuestos](esquema-propuesto.md) y proceder a crear las dos tablas operativas y dos catálogos cuando se confirme.


Actualización de diseño: cabecera y detalle llevan prefijo sbs_; nombre_periodo es obligatorio. El estado funcional y tipo de operación se normalizan en sbs_saldo_contable_periodo_estado y sbs_saldo_contable_operacion_tipo, manteniendo estado lógico habitual. Hay cuatro tablas nuevas. El catálogo incluye Factoring no habilitado y Descuento habilitado; el DDL propuesto contiene comentarios detallados de todas las tablas/columnas. Ver [estructura vigente](esquema-propuesto.md).
