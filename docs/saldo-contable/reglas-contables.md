# Saldo Contable: reglas confirmadas y alcance inicial

Fecha: 14/10/2026. Versión: NETO-DESCUENTO-PERIODOS-02. Alcance: definición del módulo administrativo, sin implementación funcional ni pruebas ejecutadas.

## 1. Decisiones confirmadas

1. Base única: monto_neto de la propuesta aceptada de la operación, confirmado por el pagador. No restar nuevamente detracción, retención o garantía ni usar neto inicial/facturas como respaldo.
2. Actualmente solo hay cobro total, no abonos parciales.
3. Fuente del cobro total: `factoring_liquidacion.fecha_pago_efectivo` de la liquidación vigente activa. Descartar anuladas/reemplazadas.
4. Una operación pendiente al corte vuelve a sugerirse en períodos sucesivos aunque ya haya sido reportada. Evitar duplicados únicamente dentro del mismo período.
5. Cierre: congelar asociaciones, importes y evidencias del reporte; permitir pagos posteriores en las operaciones originales.
6. Crear períodos con fecha de inicio, fecha de fin y fecha de corte independientes, sin imponer trimestre, semestre o año en el modelo.
7. Tipo de operación del reporte: selector con una sola opción habilitada, **Descuento**. Los nombres internos/comerciales “factoring” se conservan; no renombrar tablas operativas. La empresa confirmó que sus operaciones actuales son descuentos.
8. Tipo de instrumento: conservar clasificación por instrumento y sustento; no confundirla con el tipo de operación Descuento.
9. USD: usar el tipo de cambio contable SBS existente en BBDD para la fecha exacta del corte.
10. PEN: usar tipo de cambio aplicado 1.
11. Persistir en el detalle el neto, moneda, tipo de cambio aplicado e importe calculado en PEN. El total se obtiene de esos importes guardados.
12. Dos tablas operativas y dos catálogos nuevas principales: período y detalle período-operación. No añadir tablas independientes para snapshots, historial de abonos ni tipos de cambio del nuevo módulo.

La propuesta de descartar toda operación asociada a un período anterior se retiró después de confirmar que debe reaparecer mientras siga pendiente. No implementar una exclusión global mediante NOT EXISTS contra todos los detalles históricos.

## 2. Elegibilidad al corte

Una operación se sugiere cuando:

- Se inició/reconoció hasta la fecha de corte inclusive.
- Pertenece al alcance Descuento confirmado.
- No tiene una liquidación vigente activa con fecha efectiva de cobro hasta el corte inclusive.
- Sus datos permiten calcular el neto, clasificar el instrumento y, para USD, obtener el tipo de cambio contable del corte.

La fecha de inicio del período describe la cobertura del reporte; **no excluye cartera antigua todavía pendiente al corte**. La fecha determinante del saldo es la de corte. Una operación liquidada hoy puede corresponder a un saldo pendiente en un corte histórico si su fecha efectiva de cobro fue posterior.

| Caso | Sugerencia / motivo |
| --- | --- |
| Inició antes o durante el período y sigue pendiente al corte | Sugerir por su neto |
| Inició y fue cobrada totalmente dentro del período, hasta el corte | No cumple: pagada hasta el corte |
| Inició antes del período y fue cobrada durante este, hasta el corte | No cumple: pagada hasta el corte |
| Cobro total posterior al corte | Sugerir; estaba pendiente en ese corte |
| Ya reportada antes y sigue pendiente | Volver a sugerir; no duplicar en el mismo período |
| Inicio posterior al corte | No cumple: operación no iniciada al corte |
| Varias liquidaciones vigentes activas | Requiere revisión: liquidación ambigua |
| USD sin tipo de cambio contable del corte | Bloqueo de cálculo/asociación USD; indicar actualizarlo |
| PEN sin registro SBS de ese día | Calcular con 1; no requiere conversión externa |

Para no confundir con históricos irrelevantes, la vista “No cumplen” se centra por defecto en operaciones iniciadas o cobradas dentro de la cobertura del período, siempre explicando el motivo. Las pagadas antes del inicio pueden quedar fuera de esa vista inicial o consultarse con filtro histórico; no se excluye cartera pendiente por esa reducción visual. No limitar “no cumplen” únicamente a operaciones iniciadas y pagadas dentro del mismo período, porque también puede haber cartera antigua cobrada en el período actual.

La clasificación y el dato de tipo de cambio se informan separados de la situación de cobro: una operación puede estar pendiente y, aun así, requerir completar datos para asociarse.

## 3. Fechas y flexibilidad

Datos de entrada: `fecha_inicio`, `fecha_fin`, `fecha_corte` como fechas civiles YYYY-MM-DD almacenadas en DATE.

- No pedir año/trimestre como identificador obligatorio ni derivar el corte de un número de trimestre.
- Puede ofrecerse un atajo trimestral que complete fechas, manteniéndolas explícitas; no es necesario para V1.
- Validar fechas válidas e inicio <= fin. Propuesta técnica: corte >= inicio y valor inicial de corte igual a fin; no imponer corte = fin sin definir expresamente esa restricción.
- La cobertura temporal se calcula con inicio/fin en Lima: futuro, en curso o anterior. Para asociar/cerrar deben haber terminado la cobertura y el día del corte.
- Un período actual permite sugerencias preliminares hasta la fecha actual, identificadas como tales, pero no asociación/cierre.
- Un período futuro permite creación y consulta; no asociación ni saldo definitivo.
- Un período anterior con corte todavía futuro también bloquea asociación/cierre por corte pendiente.
- Para comparar TIMESTAMP con el corte, usar el límite exclusivo de las 00:00 del día siguiente en America/Lima convertido a UTC, incluyendo así todo el día de corte.
- No desplazar DATE al huso del navegador como si fuera un instante de evento.

Estos controles hacen independiente el modelo de la frecuencia regulatoria. Si la frecuencia cambia, no basta con afirmar automáticamente que no cambia ninguna regla regulatoria: se conserva la estructura y se revisa la normativa aplicable.

## 4. Fuente del neto y del cobro

Fuente única del neto: factoring.factoring_propuesta_aceptada.monto_neto, enlazada por idfactoringpropuestaaceptada. Guardar referencia a esa propuesta y copia del importe en el detalle. No sustituir por factoring.monto_neto, suma de facturas, otra propuesta o simulación. Si falta propuesta aceptada válida, motivo SIN_PROPUESTA_ACEPTADA y no asociar. Diferencias con neto inicial o facturas no son error por sí solas.

Ayuda en interfaz: «Monto neto pendiente de pago confirmado por el pagador, tomado de la propuesta aceptada de la operación». En cerrado mostrar copia guardada y propuesta usada, aunque después cambie la actual.

Fuente del cobro: factoring_liquidacion.fecha_pago_efectivo de vigente activa, según criterio existente funcional4. Sin vigente se evalúa pendiente; varias vigentes requieren revisión. Fechas de factura/detracción/vencimiento no sustituyen esta fuente.

La [propuesta concreta de campos y relaciones](esquema-propuesto.md) prevalece sobre las descripciones genéricas anteriores.

## 5. Cálculo uniforme y persistencia

```text
tipo_cambio_aplicado = 1                         para PEN
tipo_cambio_aplicado = precio_contable_SBS(corte) para USD

saldo_pen_operacion = monto_neto_propuesta_aceptada_pendiente_al_corte × tipo_cambio_aplicado
saldo_pen_periodo = suma de saldo_pen_operacion de detalles asociados activos
```

La selección del multiplicador ocurre una sola vez, antes de llamar al calculador. El cálculo de importe usa la misma función para ambas monedas.

Propuesta de precisión: neto Decimal(10,2), igual a la propuesta fuente, tipo de cambio Decimal(12,6), resultado Decimal(24,8), porque dos decimales por seis producen hasta ocho. Conservar ese resultado en el detalle y presentar dos decimales. Sumar los resultados precisos y redondear el agregado según política explícita; no redondear cada fila almacenada a dos decimales sin revisar diferencias con los Excel históricos. Esta precisión mantiene el control de junio 709689.1659 → 709689.17. La suma de filas presentadas con dos decimales puede diferir por residuos; su presentación queda documentada, sin ajustes ocultos.

PEN guarda tipo aplicado 1 y referencia SBS nula. USD guarda referencia al registro existente, fecha de corte, valor aplicado e importe PEN. Si falta el contable exacto, bloquear USD y explicar la actualización requerida, sin venta/compra, SUNAT o último día de respaldo. No consultar proveedores ni escribir tipos de cambio en un GET.

El hallazgo previo sobre respaldos de venta en productores existentes sigue documentado como observación técnica separada; no demuestra que los registros actuales sean erróneos ni obliga a crear un subsistema adicional.

## 6. Dos tablas operativas y dos catálogos y cierre

**sbs_saldo_contable_periodo:** UUID, nombre_periodo, fechas inicio/fin/corte, FK tipo regulatorio y FK estado funcional, estado lógico, versión de concurrencia, total PEN guardado, fecha/usuario de cierre y auditoría habitual.

**sbs_saldo_contable_detalle:** UUID, FK período, FK operación, FK propuesta aceptada utilizada, copia de su neto pendiente al corte, moneda, tipo de cambio aplicado, referencia SBS nullable, importe PEN preciso, fechas fuente, código de operación y clasificación/instrumentos necesarios como copia de lo reportado, motivo de retiro si corresponde, estado lógico y auditoría.

El detalle contiene la copia histórica: no se agrega una tercera tabla de snapshots. Para instrumentos mixtos puede guardarse un desglose estructurado en el mismo detalle; no duplicar el total de la operación por factura. La relación única es período+operación. Retirar/reactivar la asociación reutiliza la relación y conserva su identidad; una operación puede tener detalles en distintos períodos.

En elaboración se puede recalcular expresamente y mostrar diferencias, conservando selección manual. Al cerrar se revalidan reglas, se guarda total y se congelan cabecera/detalles del reporte en una transacción. Pagos o cambios de tipo de cambio posteriores no recalculan el cerrado. La pantalla muestra las copias guardadas; el enlace a la operación actual se distingue del dato histórico.

V1 no implementa reapertura, firma, presentación automática, rectificación versionada, libro de pagos parciales ni tablas de auditoría nuevas. Estas ampliaciones quedan fuera del alcance inicial. Las acciones lógicas de elaboración siguen el estándar admin; el cerrado se conserva consultable y no se elimina por el flujo genérico propuesto.

## 7. Validación prevista y siguiente paso

Pendiente de implementación: probar selección al corte, operación repetida entre períodos, cobro exactamente en corte, antes/después, Descuento único, fechas flexibles, PEN × 1, USD × contable del corte, valor faltante, integridad de dos tablas operativas y dos catálogos, transacción/concurrencia y cierre inmutable.

No se ejecutaron pruebas ni consultas a BBDD para redactar estas reglas. Las consultas de diagnóstico existentes son opcionales para validar integridad; no se solicitan para redefinir las fuentes confirmadas.

**Siguiente paso del plan:** validar los campos y relaciones de [las dos tablas operativas y dos catálogos propuestas](esquema-propuesto.md) y pasar a implementación conforme al [checklist](../plan-saldo-contable-sbs-20261014.md).


Actualización de diseño: cabecera y detalle llevan prefijo sbs_; nombre_periodo es obligatorio. El estado funcional y tipo de operación se normalizan en sbs_saldo_contable_periodo_estado y sbs_saldo_contable_operacion_tipo, manteniendo estado lógico habitual. Hay cuatro tablas nuevas. El catálogo incluye Factoring no habilitado y Descuento habilitado; el DDL propuesto contiene comentarios detallados de todas las tablas/columnas. Ver [estructura vigente](esquema-propuesto.md).
