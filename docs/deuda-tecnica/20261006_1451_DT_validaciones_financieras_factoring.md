# Deuda técnica: validaciones y consistencia financiera de factoring

- **Registro:** 2026-10-06 14:51 — America/Lima (UTC−05:00).
- **Estado:** pendiente de solución; este documento no implementa correcciones.
- **Origen:** auditoría de propuesta y liquidación de factoring del 06/10/2026 y revisión del código al registrar esta deuda.
- **Ámbito:** backend; las futuras correcciones que cambien el contrato de datos también deberán considerar formulario, presentación y persistencia.
- **Configuración acordada:** base de datos y backend en UTC; navegador en Lima. Las reglas de plazos usan días calendario de Perú, incluidos sábados y domingos.

## Objetivo y acuerdo de seguimiento

Registrar los seis hallazgos solicitados para su posterior solución. Todo hallazgo descubierto que se deje fuera del trabajo actual se registrará como deuda técnica, con evidencia, estado y alcance. Las observaciones cuya regla de negocio esté por confirmar se identificarán como tales; no se darán por defectos contractuales demostrados.

Cada deuda debe conservar causa, ejemplo reproducible, impacto, propuesta de solución, decisiones pendientes y criterios de aceptación. Para cerrarla se requiere resolver las decisiones necesarias, implementar la corrección y verificar esos criterios. Documentar una propuesta no equivale a autorizar su implementación.

Los importes, conteos e identificadores de escenarios citados proceden de la auditoría anterior con datos controlados. No se reejecutó esa batería para crear este documento ni se presupone que su resultado completo describa el estado actual del repositorio. Se revisaron las causas de los seis puntos en el código actual.

## Resumen de deudas solicitadas

| ID | Hallazgo | Causa | Estado de evidencia | Solución profesional propuesta |
|---|---|---|---|---|
| DT-LIQ-01 | Pago anterior al inicio | Falta validación cronológica antes del cálculo | Reproducido en auditoría; ausencia del control revisada en código | Rechazar días de pago anteriores al día de inicio en Perú, al simular y al guardar |
| DT-LIQ-02 | Cargos convertidos en abonos | Se aceptan cantidades e importes negativos | Aceptación e inversión del saldo reproducidas; política de ajustes negativos pendiente | Validar límites y dejar la dirección cargo/abono al concepto financiero |
| DT-LIQ-03 | IGV inconsistente | Una ruta usa el tipo y otra `afecto_igv` | Criterios diferentes confirmados; combinaciones reales pendientes de revisión | Confirmar combinaciones válidas y aplicar una única regla al cálculo y desglose |
| DT-LIQ-04 | Diferencia de un centavo en capital | Financiamiento y garantía se redondean por separado | Diferencia reproducida; conciliación contable pendiente de definición | Conservar el neto en propuestas nuevas y respetar los importes ya aceptados |
| DT-LIQ-05 | Cobertura infinita con tasa cero | División entre cero en la cobertura de garantía | Infinity y NaN reproducidos en cálculo; guardado real no probado | Representar explícitamente la cobertura sin límite o el caso no aplicable, sin valores numéricos no finitos |
| DT-LIQ-06 | Reintegro sin gasto interbancario | La condición omite el reintegro y se evalúa antes de conceptos adicionales | Omisión reproducida; política de cobro pendiente | Si se cobra por transferencia realizada, evaluar el saldo final reembolsable |

## Evidencia común y límites

El caso base de liquidación utiliza monto neto S/ 20.000,00, financiamiento 80 % (S/ 16.000,00), garantía S/ 4.000,00, tasa mensual 2 %, inicio 01/09/2026 y vencimiento 01/10/2026. La propuesta de 30 días tiene descuento S/ 320,00. Los ejemplos indican expresamente cuando cambian estos datos.

La auditoría ejercita controlador, servicio y calculadores reales con `Decimal`; sustituye acceso a base de datos, catálogos, configuración e infraestructura externa. IGV 18 % y tarifas de 7,50 PEN / 2,50 USD son datos controlados. Los ejemplos no prueban que existan operaciones reales afectadas, que las combinaciones sintéticas estén habilitadas en el catálogo o que la base real permita guardar valores no finitos.

Las pruebas con servidor Madrid o navegador Madrid/Tokio están fuera de la configuración operativa acordada. Sus resultados no fundamentan las seis deudas aquí registradas. El desfase de fechas UTC/Lima tiene seguimiento separado y no se declara como nueva deuda pendiente en este archivo.

## DT-LIQ-01 — Pago anterior al inicio de operación

**Ubicación:** [runSimulation y creación de liquidación](../../src/services/admin/factoringliquidacion.Service.ts), [validaciones del controlador](../../src/controllers/admin/servicio/factoring/factoringliquidacion.Controller.ts).

**Causa:** el controlador valida que el pago sea una fecha y el servicio comprueba que exista fecha de inicio. No se comprueba que el día de pago sea igual o posterior al día de inicio antes de invocar el calculador. Un plazo negativo entra en la fórmula exponencial y produce descuento negativo.

**Evidencia de la auditoría:** escenarios `pago-dia-antes-inicio` y `pago-diez-dias-antes-inicio`, con los datos del caso base.

| Pago en Perú | Días financiados | Descuento recalculado | Reintegro | Saldo a favor | Comportamiento |
|---|---:|---:|---:|---:|---|
| 31/08/2026 | −1 | −10,56 | 330,56 | 4.330,56 | Entrada aceptada |
| 22/08/2026 | −10 | −105,27 | 425,27 | 4.425,27 | Entrada aceptada |

**Impacto:** se calcula un reintegro superior al descuento original de 320,00 y se permite una liquidación con una secuencia temporal inválida para una operación cuyo financiamiento comienza el 01/09.

**Propuesta:** validar la relación entre ambos días civiles de Lima en el punto compartido por simulación y creación, antes del cálculo financiero. Devolver un error de cliente comprensible y evitar escrituras. Conservar UTC para transporte y almacenamiento de instantes.

**Criterios de aceptación:**

- Rechazar pagos uno y diez días antes del inicio, con respuesta de validación controlada y sin registros financieros creados.
- Admitir pago el mismo día de inicio, con cero días financiados según la regla calendario, incluso si la hora del pago es anterior a la hora del inicio.
- Admitir pago al vencimiento, anticipado después del inicio y tardío.
- Verificar equivalencia de representaciones UTC y con desplazamiento −05:00 del mismo instante.
- Comprobar el rechazo tanto al simular como al crear; no limitar el control al formulario.

## DT-LIQ-02 — Cantidades o importes negativos invierten cargos

**Ubicación:** [esquemas de simulación y creación](../../src/controllers/admin/servicio/factoring/factoringliquidacion.Controller.ts), [getFinancialData y agregación del saldo](../../src/services/admin/factoringliquidacion.Service.ts).

**Causa:** los esquemas aceptan cualquier número para cantidad e importe unitario. El servicio multiplica ambos, calcula el IGV y aplica el factor del concepto al saldo. Un resultado negativo en un concepto de cargo produce el efecto económico de un abono.

**Evidencia:** escenarios `cargo-negativo` y `cantidad-negativa`. Con saldo base 4.000,00, tipo 2 afecto, factor −1 e IGV controlado 18 %:

| Cantidad | Importe unitario | Monto | IGV | Saldo resultante |
|---:|---:|---:|---:|---:|
| 1 | −100,00 | −100,00 | −18,00 | 4.118,00 |
| −1 | 100,00 | −100,00 | −18,00 | 4.118,00 |

**Impacto:** el signo de un dato de entrada modifica la naturaleza cargo/abono del concepto seleccionado.

**Decisión pendiente:** confirmar si existen ajustes negativos autorizados y cómo deben identificarse. La inversión está comprobada; su legitimidad contractual no se presume.

**Propuesta:** para conceptos ordinarios, exigir cantidad positiva e importe unitario no negativo, con límites definidos y validación en backend. Si existen reversos, modelarlos como un ajuste explícito y trazable. El factor del concepto debe determinar la dirección del movimiento.

**Criterios de aceptación:**

- Rechazar los dos ejemplos negativos en simulación y creación sin persistencia.
- Validar la política elegida para cantidad cero e importe cero; evitar ceros implícitos que oculten entradas inválidas.
- Mantener cargo positivo como reducción y abono positivo como aumento.
- Validar entradas numéricas no válidas y límites de precisión/rango del contrato.
- Si se admiten reversos, probar autorización, motivo y dirección resultante.

## DT-LIQ-03 — Dos reglas distintas para IGV

**Ubicación:** [getFinancialData, getFinancialDataById y desglose](../../src/services/admin/factoringliquidacion.Service.ts).

**Causa:** en conceptos adicionales se calcula IGV cuando el tipo financiero es distinto de 4. En conceptos internos se utiliza `financiero_concepto.afecto_igv`. La agrupación del desglose también usa la bandera del concepto. Cálculo y clasificación pueden discrepar si tipo y bandera no están alineados.

**Evidencia:** escenarios `cargo-inafecto-tipo2`, `cargo-afecto-tipo4` y `abono-inafecto-tipo2`, con concepto adicional de 100,00 y saldo base 4.000,00.

| Combinación sintética | IGV según bandera | IGV calculado | Saldo según bandera | Saldo calculado |
|---|---:|---:|---:|---:|
| Cargo tipo 2, inafecto | 0,00 | 18,00 | 3.900,00 | 3.882,00 |
| Cargo tipo 4, afecto | 18,00 | 0,00 | 3.882,00 | 3.900,00 |
| Abono tipo 2, inafecto | 0,00 | 18,00 | 4.100,00 | 4.118,00 |

Las combinaciones tipo 2 afecto y tipo 4 inafecto coinciden con la bandera.

**Impacto:** impuesto y saldo diferentes según la ruta, y posible clasificación de un movimiento como inafecto aunque se le haya calculado IGV.

**Decisión pendiente:** revisar catálogo real y relaciones permitidas, y establecer qué dato determina la afectación. No se afirma que las tres combinaciones sintéticas estén disponibles en producción.

**Propuesta:** centralizar la regla autorizada para cálculo, clasificación y presentación; validar coherencia entre tipo y concepto. Respetar los datos históricos ya aceptados y separar cualquier revisión de registros existentes.

**Criterios de aceptación:**

- Documentar la matriz de combinaciones permitidas del catálogo.
- Rechazar combinaciones inválidas o aplicar de manera uniforme la regla aprobada.
- Obtener el mismo IGV para un concepto por las rutas interna y adicional.
- Conciliar monto, IGV, total, clasificación y saldo para cargos y abonos.
- Cubrir IGV cero y la tasa configurada, sin fijar la tasa de la auditoría como constante nueva.

## DT-LIQ-04 — Financiamiento más garantía no conserva el neto

**Ubicación:** [calculateFactoringV3 y calculateFactoringV2](../../src/domain/factoring/factoring.Calculator.ts).

**Causa:** se calcula financiamiento como neto × porcentaje y garantía como neto × (1 − porcentaje), redondeando ambas partes independientemente a dos decimales. Dos mitades de centavo pueden redondearse hacia arriba.

**Evidencia:** 320 combinaciones de la auditoría registraron diferencia de 0,01. Con neto 100,01 y financiamiento 50 %, las dos partes exactas son 50,005: se obtienen **50,01 financiado + 50,01 de garantía = 100,02**. También se reprodujo con neto 99.999.999,99 al 50 %.

**Impacto:** el desglose del capital supera el monto neto y dificulta la conciliación de propuesta, desembolso y garantía. La liquidación consume la garantía aceptada; no corresponde corregirla silenciosamente durante ese cálculo.

**Decisión pendiente:** definir cuál componente conserva prioridad de redondeo y cuál recibe el residual, además del tratamiento de propuestas históricas.

**Propuesta:** en propuestas nuevas, redondear el componente prioritario y obtener el complementario por diferencia respecto del neto. Mantener importes ya aceptados, y hacer explícito cualquier eventual ajuste histórico.

**Criterios de aceptación:**

- Financiamiento + garantía debe igualar el neto a dos decimales bajo la política aprobada.
- Cubrir netos con centavos impares y financiamiento 0 %, 50 %, 80 % y 100 %, conforme a las combinaciones válidas del producto.
- No generar garantía negativa ni aumentar el capital total por redondeo.
- Verificar tanto V2 como V3 y las rutas que las invocan.
- Mantener las liquidaciones de propuestas aceptadas sujetas a sus importes originales.

## DT-LIQ-05 — Cobertura no finita con tasa mensual cero

**Ubicación:** [fórmula de cobertura V2/V3](../../src/domain/factoring/factoring.Calculator.ts), [validación de tasa de propuesta](../../src/controllers/admin/servicio/factoring/factoringpropuesta.Controller.ts), [guardado de propuesta](../../src/services/admin/factoringpropuesta.Service.ts), [esquema Prisma](../../prisma/ft_factoring/schema.prisma).

**Causa:** la cobertura se obtiene como:

```text
floor(ln((financiado + garantía) / financiado) / ln(1 + tasa mensual) × 30)
```

Con tasa cero el denominador es cero. Con garantía positiva aparece Infinity; con financiamiento 100 % y garantía cero aparece NaN. El controlador permite tasa cero y el servicio asigna el resultado al campo de cobertura de la propuesta.

**Evidencia:** 360 escenarios de tasa cero registraron cobertura no finita. El esquema actual define `dias_cobertura_garantia_estimado` como `Int?`, tanto en propuesta como en simulación. La auditoría no comprobó un guardado real de esos resultados.

**Impacto:** el cálculo produce valores incompatibles con una cantidad entera ordinaria de días. Hay riesgo de fallo de persistencia o presentación engañosa; ninguno se da por reproducido en base real. Los importes de liquidación de los escenarios de tasa cero permanecieron finitos.

**Decisiones pendientes:** distinguir garantía positiva sin crecimiento de interés, garantía cero y otros casos no aplicables. Definir cómo comunica la API y la pantalla cada significado.

**Propuesta:** tratar tasa cero antes de evaluar la fórmula y representar explícitamente cobertura sin límite o no aplicable. El campo nullable permite considerar ausencia de valor numérico, pero debe acompañarse de una semántica clara; no reemplazar Infinity/NaN por cero o un entero arbitrario sin definición de negocio.

**Criterios de aceptación:**

- Ninguna respuesta ni operación de guardado debe contener Infinity o NaN.
- Probar tasa cero con garantía positiva y con garantía cero.
- Comprobar serialización, validación Prisma y lectura/presentación de la representación elegida.
- Mantener descuento e interés cero cuando corresponda.
- Conservar la cobertura actual para tasas positivas válidas.

## DT-LIQ-06 — No se considera reintegro al decidir gasto interbancario

**Ubicación:** [condición del gasto y agregación posterior](../../src/services/admin/factoringliquidacion.Service.ts).

**Causa:** el saldo probable usado por la condición es garantía − cargo de mora − tarifa. No suma el reintegro anticipado y se evalúa antes de incorporar conceptos adicionales. La tarifa se agrega solamente si ese saldo probable es positivo, el banco es distinto de BCP y no hay exoneración.

**Evidencia:** 24 escenarios con reintegro positivo no incluyeron tarifa pese a tener saldo superior a esta. Ejemplo `fin-20000-0.015-1--5-2-1-false`:

- Neto 20.000,00; financiamiento 100 %; garantía 0,00; tasa mensual 1,5 %.
- Inicio 01/09; vencimiento 01/10; pago 26/09; banco distinto; tarifa PEN 7,50; sin exoneración.
- Descuento aceptado 300,00; descuento efectivo 249,69; reintegro 50,31.
- La condición calcula 0 − 0 − 7,50 = −7,50 y no agrega gasto.
- Saldo actual: 50,31. Si corresponde cobrar la transferencia de ese reintegro, saldo después de tarifa: 42,81.

**Impacto condicionado:** posible omisión de la tarifa en transferencias financiadas únicamente con reintegro; los conceptos adicionales también pueden modificar el saldo real respecto del saldo probable.

**Decisión pendiente:** confirmar si la tarifa se cobra por transferencia realizada, sobre qué saldo, cómo se trata un saldo igual o inferior a la tarifa y cómo opera la exoneración.

**Propuesta:** si se aprueba cobro por transferencia, decidirlo sobre el saldo reembolsable después de garantía, reintegro, mora y conceptos adicionales, antes de aplicar la propia tarifa. Evitar reglas circulares y cobro duplicado.

**Criterios de aceptación:**

- Cubrir banco propio y otro banco; PEN y USD; exoneración activa e inactiva.
- Probar garantía cero con reintegro positivo.
- Probar cargos y abonos adicionales que reduzcan o incrementen el saldo.
- Probar saldo cero, negativo, igual a la tarifa, inferior y superior.
- Verificar coincidencia entre simulación y creación y aplicación de la tarifa una sola vez.
- Ajustar expectativas a la regla contractual aprobada; no declarar obligatorio el cargo mientras esa regla siga pendiente.

## Observaciones adicionales pendientes de análisis de negocio

Se registran por el acuerdo de tratar como deuda técnica los hallazgos que quedan fuera del trabajo actual. No se clasifican como errores financieros demostrados.

### DT-LIQ-07 — Política de redondeo de la tasa diaria

**Estado:** pendiente de definición y evaluación de compatibilidad.

La tasa diaria equivalente se redondea a diez decimales antes de calcular el interés compuesto. La referencia independiente, sin ese redondeo intermedio, presentó diferencias mayores de 0,01 en 360 escenarios. El máximo observado fue 0,18: neto 99.999.999,99, financiamiento 100 %, tasa mensual 1,5 % y pago diez días tarde; descuento actual 2.004.983,62 frente a 2.004.983,44 en la referencia.

La diferencia es de descuento acumulado, no del cargo adicional aislado. Es un comportamiento histórico: la referencia matemática no demuestra por sí sola que el contrato exija otro resultado.

**Trabajo pendiente y cierre:** documentar precisión y momentos de redondeo autorizados, verificar equivalencia con importes históricos y definir tolerancias. Mantener la fórmula vigente hasta aprobar una política diferente; si se cambia, distinguir cálculos nuevos de importes aceptados.

### DT-LIQ-08 — Inicio de propuesta distinto del inicio real

**Estado:** pendiente de interpretación del descuento aceptado y del desembolso.

El descuento aceptado puede haberse calculado desde la fecha de propuesta, mientras que la liquidación recalcula desde el inicio real. La decisión de generar reintegro o cargo también depende de si el pago se hizo antes o después del vencimiento.

Ejemplos anteriores, inicio real 01/09, pago puntual 01/10, capital financiado 16.000 y tasa 2 %:

| Inicio usado en propuesta | Descuento aceptado | Descuento efectivo | Tratamiento observado |
|---|---:|---:|---|
| 27/08 | 373,95 | 320,00 | Reintegro 53,95 |
| 03/09 | 298,47 | 320,00 | Diferencia 21,53 sin cargo de mora |

El segundo ejemplo es una secuencia sintética cuya validez operativa debe verificarse. Se observaron cuatro casos con comportamientos que requieren interpretación, dentro de cinco desfases probados.

**Trabajo pendiente y cierre:** definir si el descuento aceptado es fijo o ajustable al desembolso, validar la secuencia permitida propuesta/aceptación/inicio y documentar el resultado esperado para pagos puntuales, anticipados y tardíos. No alterar propuestas aceptadas mientras esa política siga pendiente.

## Referencias y trazabilidad

- [Informe de la auditoría anterior](../analisis-liquidacion-factoring-2026-10-06.md).
- [Batería de auditoría](../../tests/unit/services/admin/factoringliquidacion.audit.test.ts).
- [Pruebas del servicio de liquidación](../../tests/unit/services/admin/factoringliquidacion.Service.test.ts).
- [Resultados por escenario, cuando estén disponibles localmente](../../temporal/liquidacion-audit/resultados.json).

Los resultados de `temporal` son regenerables y pueden no acompañar el repositorio. Este archivo conserva los ejemplos necesarios para comprender y reproducir la deuda. El informe previo también incluye configuraciones fuera del entorno acordado y es evidencia histórica, no un diagnóstico actualizado de todos sus hallazgos.

## Condiciones comunes para resolver estas deudas

- Preservar base de datos/backend en UTC y aplicar las reglas calendario en Perú.
- Mantener la arquitectura, estilo de programación y diseño existentes.
- Verificar las reglas pendientes antes de convertir una observación en una corrección financiera.
- Cubrir simulación y creación con pruebas de comportamiento y comprobar ausencia de escrituras cuando corresponda rechazar una entrada.
- Mantener trazabilidad de importes históricos aceptados; no recalcularlos silenciosamente.
- Actualizar estado, fecha, evidencia de pruebas y referencia al cambio cuando cada deuda sea atendida. Las deudas restantes seguirán pendientes.

