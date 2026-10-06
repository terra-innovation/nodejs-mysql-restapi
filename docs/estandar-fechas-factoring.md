# Estándar de fechas en factoring

El motor de base de datos y el backend trabajan en UTC. Los días de negocio se interpretan en `America/Lima`, incluidos sábados y domingos. Una fecha civil y un instante tienen contratos distintos; el tipo SQL por sí solo no determina el significado del dato.

## Contratos

| Dato | Significado | Transporte y persistencia | Interpretación y presentación |
|---|---|---|---|
| Emisión o vencimiento original de factura | Fecha civil, sin hora ni zona | `YYYY-MM-DD`; Prisma puede serializar SQL DATE como `00:00Z` | Conservar el día original; no restar cinco horas |
| Vencimiento de operación copiado desde factura | Conserva el origen civil de factura, aunque la columna sea timestamp | Representación original copiada por el wizard | Precarga de propuesta: helpers civiles |
| Emisión ingresada en simulación | Fecha civil | Frontend envía `YYYY-MM-DD`; creación normaliza el timestamp a `00:00Z` | Conservar el día en formulario, cálculo de antigüedad y detalle |
| Vencimiento elegido en propuesta o simulación | Instante correspondiente al día elegido en Lima | ISO UTC con zona explícita; `2026-10-30` elegido en Lima se envía como `2026-10-30T05:00:00.000Z` | Convertir el instante a Lima antes de obtener su día; mismo criterio en cálculo, pantallas y PDF |
| Inicio de operación, emisión de propuesta/simulación y cobro efectivo | Instantes | UTC | Convertir a Lima; contar diferencias entre días calendario peruanos |

SQL DATE no está en una zona horaria. La representación `00:00Z` de una fecha civil es una convención de transporte, no la hora real de un evento.

## Utilidades existentes

| Operación | Frontend | Backend |
|---|---|---|
| Conservar una fecha civil en un campo de fecha | `toDateInputValue` | `parseDateUtcMidnight` para persistir; `toLimaDate` para interpretar el día civil en el cálculo |
| Mostrar una fecha civil serializada a medianoche UTC | `formatDateUTC` | Mantener su día civil |
| Enviar un día seleccionado en Lima como instante UTC | `toIsoUtcFromLima` | Validar y conservar el instante recibido |
| Restaurar un instante en un campo de fecha de Lima | `toDateInputValueLima` | `toLimaDateTime` |
| Mostrar un instante como fecha de Perú | `formatDateLocale` | `formatDateLocale`, también en PDF |
| Contar días de negocio | Mostrar el resultado del backend | `calculateCalendarDaysInLima` en `src/utils/dateUtils.ts` |

El cálculo financiero continúa centralizado en el calculador existente. Simulación y propuesta usan `simulateFactoringLogicV4`; los servicios coordinan catálogos y persistencia. El frontend y el PDF presentan los días e importes devueltos, sin recalcular las fórmulas.

## Origen e históricos

No inferir que un timestamp es civil únicamente porque su hora sea `00:00`. La precarga de propuesta conserva el vencimiento civil porque se conoce su origen en factura. Los vencimientos propios de propuesta y simulación se interpretan como instantes.

Un timestamp propio de simulación `2026-10-30T00:00:00Z` corresponde a **29/10/2026 19:00 en Lima**. Cálculo, detalle, lista y PDF deben coincidir en el día 29. Si un registro antiguo usó ese valor para codificar el día civil 30, requiere revisar su procedencia antes de una eventual migración; cambiar el formateador no corrige ese contrato histórico.

## Regresión requerida

- Fecha civil de factura `30/10/2026` → precarga de propuesta `30/10/2026` → envío `05:00Z`.
- Emisión civil de simulación → transporte `YYYY-MM-DD` → persistencia `00:00Z`, conservando el día.
- Vencimiento propio como string ISO y objeto Date; límites `00:00Z`, `04:59:59Z` y `05:00Z`.
- Resultado idéntico de simulación y propuesta con entradas, banco, moneda y catálogos iguales.
- Fines de semana, cambio de mes/año y febrero bisiesto.
- Formulario, lista, detalle, resultado, vista previa y PDF con el mismo día local.
- Factura → operación → propuesta publicada y aceptada → inicio → liquidación según la propuesta aceptada.

Evidencia vigente: [alineación de simulación](alineacion-simulacion-fechas-2026-10-06.md) y [trazabilidad de factoring](trazabilidad-fechas-factoring-2026-10-06.md).
