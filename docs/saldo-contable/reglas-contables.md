# Saldo Contable: reglas funcionales y base neta

Fecha: 14/10/2026. Versión de trabajo: NETO-COBRO-TOTAL-01. Alcance: primera versión del módulo administrativo. Este documento concreta decisiones del usuario; no sustituye la conciliación contable ni acredita datos históricos de la base.

## 1. Decisiones confirmadas

| ID | Decisión | Efecto en la primera versión |
| --- | --- | --- |
| D-01 | Usar valor neto | La base no es valor nominal, financiado ni desembolso |
| D-02 | Congelar el reporte cerrado y permitir pagos posteriores | Asociaciones, importes, tasa, clasificación y evidencias del cierre son inmutables; las operaciones continúan su actividad |
| D-03 | Clasificar según cada instrumento y su sustento | No imponer Facturas Comerciales ni Facturas Negociables a toda la cartera |
| D-04 | Actualmente solo se registra cobro total | La primera versión no calcula abonos parciales ni incorpora un libro nuevo de movimientos parciales |

La instrucción «proceder con el siguiente paso» autoriza avanzar en este bloque de definición y viabilidad. Las decisiones de los adjuntos se tratan como evidencia del requerimiento, no como instrucciones para enviar, modificar o presentar documentación.

## 2. Fuente candidata del valor neto

El flujo actual crea `factoring.monto_neto` sumando `factura.importe_neto` de las facturas seleccionadas. La función `calcularImporteNeto` obtiene el importe desde el nodo de crédito del XML, desde la suma de cuotas o, como alternativa, desde bruto menos detracción convertida a moneda de factura y retención. Por ello:

1. Usar el neto almacenado de la operación como candidato para la base del reporte.
2. Usar los netos almacenados por factura para distribuir esa base entre los instrumentos asociados.
3. Comprobar que la suma por instrumento coincide con el neto de la operación; una discrepancia exige revisión y no se corrige silenciosamente.
4. No volver a restar detracción o retención de un neto que ya las incorpora.
5. No restar garantía para convertir la base en monto financiado.
6. No recalcular ni actualizar importes históricos desde el XML como preparación del reporte.
7. No sustituir la base por `factoring_propuesta.monto_neto`: la propuesta recibe parámetros de simulación y debe compararse si difiere, no adoptarse automáticamente como libro contable.

El uso del neto de la operación como fuente se funda en su productor actual; verificar su correspondencia con los libros y con las facturas históricas sigue siendo parte de SC-016/SC-118. No se añadieron ni eliminaron componentes contables mediante esta documentación. Si una operación requiere ajustes, deterioro, castigos u otro componente no representado en el neto, queda en revisión antes de calcularla con una regla inventada.

Referencias de código: [creación de operación](../../src/services/empresario/factoring.Service.ts), [cálculo de neto XML](../../src/utils/facturaUtils.ts), [propuestas](../../src/services/admin/factoringpropuesta.Service.ts), [esquema](../../prisma/ft_factoring/schema.prisma).

## 3. Saldo al corte para cobro total

Entradas necesarias: neto reconocido, fecha efectiva de reconocimiento, situación acreditada de cobro total, fecha efectiva de cobro total cuando exista, moneda y clasificación sustentada. La ausencia de evidencia de cobro no demuestra por sí sola que la operación siga pendiente.

| Hechos acreditados al corte | Resultado en moneda original |
| --- | --- |
| Reconocimiento posterior al corte | No cumple: todavía no forma parte de la cartera al corte |
| Reconocida al corte y pendiente de cobro total | Valor neto |
| Reconocida al corte; cobro total efectivo hasta el corte inclusive | Cero; no cumple por cancelación al corte |
| Reconocida al corte; cobro total posterior al corte | Valor neto, aunque hoy esté liquidada |
| Información contradictoria, pago sin fecha o cobertura incompleta de facturas | No calculable; requiere revisión con motivo |
| Cobros parciales o facturas de la misma operación cobradas a ambos lados del corte | Fuera de la regla de cobro total de V1; requiere revisión, no asignar automáticamente neto completo ni cero |
| Vencimiento estimado anterior al corte pero cobro aún pendiente | Valor neto; vencimiento no equivale a cancelación |

La fecha civil de corte se incluye completa en America/Lima. Para TIMESTAMP, usar límite exclusivo del siguiente día civil convertido a UTC; por ejemplo, corte 31/03/2026 implica instantes anteriores a 01/04/2026 05:00:00 UTC. No convertir una columna DATE en instante local de pago.

Una operación pendiente puede repetirse en trimestres sucesivos. La unicidad debe aplicarse por período y operación, no globalmente. No se filtra únicamente por fecha de origen dentro del trimestre.

### Evidencia del cobro total: criterio técnico pendiente de verificar

La fuente candidata es `factoring_factura_factor.fecha_pago_factura` junto con un estado cuyo significado de cobro total se haya verificado y con cobertura completa de las facturas de la operación. No se conoce todavía el mapeo real del catálogo `factura_estado` ni la consistencia de sus datos históricos.

- Confirmar una sola asignación pertinente por operación/factura, sin duplicados activos.
- Confirmar que todas las facturas de la operación están representadas y que sus fechas/estados son coherentes.
- Para excluir una operación completa, todas sus facturas deben acreditar cancelación total al corte.
- Si algunas estaban cobradas al corte y otras no, el dato contradice el alcance declarado de cobro total por operación: mostrar revisión, sin calcular una fracción por estimación.
- La fecha de detracción no sustituye la de cobro del neto ni genera una nueva deducción.
- `factoring_liquidacion.fecha_pago_efectivo` procede de una simulación y no acredita por sí sola recepción de fondos.
- `factoring_pago` se mantiene como fuente no acreditada hasta verificar quién la alimenta y qué flujo económico representa.

## 4. Clasificación SBS

La política aprobada es clasificación por instrumento y sustento. Al aplicar el Anexo A se requieren dos clasificaciones diferentes:

1. Tipo de operación: factoring o descuento, según el riesgo transferido y el sustento contractual. No fijar correspondencia solo por un nombre comercial.
2. Tipo de instrumento: factura comercial, negociable, conformada, letra u otro valor representativo de deuda, según documentación verificable.

`factura.codigo_tipo_documento` identifica un tipo tributario y no acredita por sí solo negociabilidad. El esquema revisado no contiene un campo específico de clasificación SBS del instrumento. Definir metadato explícito, responsable y referencia al sustento antes de permitir el cierre. No utilizar «otros» como sustituto de clasificación desconocida. Conservar la clasificación de cierre aunque luego cambie la ficha operativa.

La decisión D-03 resuelve la política general; el mapeo de instrumentos históricos y el sustento de cada uno siguen pendientes. La diferencia observada entre consulta y anexos no autoriza corregir automáticamente documentos presentados.

## 5. Reporte cerrado y actividad operativa

Al cerrar se conserva una copia de las asociaciones, netos, resultado al corte, tipo de cambio con fecha/procedencia, clasificación, motivos y evidencias utilizadas. Ninguna lectura del cierre vuelve a calcularlo desde fichas actuales.

| Acción posterior | Regla confirmada |
| --- | --- |
| Registrar un pago posterior al corte | Permitido en la operación; no altera el reporte cerrado |
| Consultar operación actual desde detalle del cierre | Permitido, separando datos actuales de históricos |
| Añadir/retirar operaciones del cerrado | Rechazado |
| Cambiar monto, tasa, clasificación o evidencias del cierre | Rechazado |
| Corregir una fecha operativa de forma retroactiva | No sobrescribe el cierre; señalar impacto para revisión/rectificación controlada |
| Editar una operación que interviene en varios trimestres | No modificar ninguno de sus snapshots cerrados |

No se implementará un bloqueo global de la operación por aparecer en un cierre. Las mutaciones de origen requieren sus permisos habituales. La forma de rectificación y el tratamiento lógico de la cabecera cerrada se concretan en SC-009/SC-012; ninguna alternativa puede reabrir o sobrescribir su contenido reportado.

## 6. Tipo de cambio y disponibilidad

Requisitos confirmados por la petición: consulta de la BBDD existente, fecha exacta del corte, tipo contable SBS y conversión USD a PEN. Si falta, bloquear e indicar que debe actualizarse. No reemplazarlo por venta, SUNAT, tasa de desembolso o último día disponible.

El código existente permite que `precio_contable` contenga venta de respaldo. La propuesta técnica es exigir evidencia de procedencia contable o verificación sustentada, no solo un campo no nulo. La lectura del reporte no debe invocar `obtenerSbsLogic`, porque su comportamiento cache-aside puede consultar proveedores y escribir la base. Usar consulta DAO estricta sin efectos secundarios.

La creación del período sigue permitida sin tasa. El bloqueo de asociación/cierre, incluido el caso de cartera exclusivamente PEN, se conserva como propuesta estricta del plan hasta concretar SC-027. Sin datos calculables mostrar «No disponible» y un motivo, no cero.

## 7. Ejemplos de aceptación de V1

| Caso sintético | Resultado esperado |
| --- | --- |
| Neto PEN 1000; operación iniciada antes del corte y pendiente acreditada | S/ 1000.00 |
| Neto PEN 1000; cobro total el 31/03/2026 y corte 31/03/2026 | Excluida por cobro total al corte |
| Neto PEN 1000; cobro total el 01/04/2026 y corte 31/03/2026 | S/ 1000.00 |
| Neto PEN 1000 y garantía 20; sigue pendiente | Base 1000, sin restar garantía |
| Neto USD 1000; pendiente al corte y tasa contable válida 3.491 | S/ 3491.00 |
| Neto USD 1000 y tasa no acreditada o de otra fecha | No calculable; bloqueo por tasa |
| Operación con dos facturas de neto 600 y 400, ambas pendientes acreditadas | Base 1000 distribuida por instrumento; no 1000 por factura |
| De esas dos facturas, una pagada antes del corte y la otra después | Revisión por cobro por instrumentos que contradice alcance total de V1 |
| Neto PEN 1000, estado pagado sin fecha de pago válida | Revisión por dato insuficiente |

Los ejemplos son requisitos para pruebas futuras; no fueron ejecutados. La política de redondeo de agregados continúa propuesta en SC-011 y no se da por aprobada mediante estos ejemplos exactos.

## 8. Estado de las decisiones y siguiente dependencia

D-01 a D-04 confirmadas. Falta: comprobar catálogo y datos de cobro total; acreditar reconocimiento histórico y netos; completar sustento de clasificación; verificar procedencia de tasas; cerrar redondeo, acciones lógicas y alcance de exportación/rectificación.

El siguiente paso técnico es la verificación de datos descrita en [viabilidad de datos y tasas](viabilidad-datos-tasas-20261014.md). No requiere añadir un libro de pagos parciales para el alcance actual. Si aparecen casos que contradigan D-04, se documentan y revisan antes de ampliar funcionalidad.
