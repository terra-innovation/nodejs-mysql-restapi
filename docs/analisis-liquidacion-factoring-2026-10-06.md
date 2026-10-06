# Informe ejecutivo: auditoría del cálculo de liquidación de factoring

**Fecha:** 6 de octubre de 2026. **Alcance:** análisis y pruebas; sin cambios al cálculo de producción ni propuestas de solución.

## Resultado ejecutivo

El caso previo que esperaba **10 días de mora y obtenía 9 se reprodujo**. El resultado depende de la zona del servidor: con los mismos instantes, el cálculo da 9 en UTC y 10 en Lima. La fecha pactada se interpreta en la zona predeterminada del servidor y el cobro en Perú. Esto demuestra una inconsistencia de fechas; no demuestra un fallo general de la fórmula de interés compuesto.

Con fechas coherentes en Perú, los **480 escenarios de calendario** y los **1.440 escenarios de sensibilidad financiera** cumplieron las comprobaciones principales de liquidación. Sin embargo, los escenarios financieros también revelaron observaciones sobre redondeo, distribución del capital, tasa cero y gasto interbancario. Por ello, estos resultados no certifican todas las reglas financieras como correctas.

La auditoría ejecutó **2.281 escenarios controlados**. Encontró **78 escenarios con discrepancias frente a los criterios declarados** y 2.203 sin ellas. No son 78 defectos independientes: muchas combinaciones reproducen el mismo comportamiento y algunas conclusiones dependen de la interpretación de la fecha almacenada o de combinaciones de catálogo aún no verificadas en la base real.

Los hallazgos con impacto más directo son:

- **Dependencia de la zona del servidor.** En cuatro escenarios, un pago realizado un día después del vencimiento no genera el cargo adicional de S/ 10,78. El saldo devuelto es S/ 4.000,00 frente a S/ 3.989,22 según las propias reglas actuales del servicio.
- **Pago anterior al inicio aceptado.** Se generan días e intereses negativos y un reintegro superior al descuento inicial.
- **Cargos con importe o cantidad negativos aceptados.** Un cargo de 100 puede convertirse en un abono de 118 en los datos controlados.
- **Tratamiento de IGV inconsistente entre rutas.** Tres combinaciones sintéticas de tipo y concepto difieren de la bandera `afecto_igv`; falta comprobar si esas combinaciones existen o pueden seleccionarse en el catálogo real.

## Criterio y límites de interpretación

El usuario confirmó **días calendario en Perú**, incluidos sábados y domingos. La referencia principal cuenta diferencias entre días civiles de Lima; el día de inicio no añade un día extra, y pagar el mismo día del vencimiento representa cero días de mora.

Hay una ambigüedad adicional observada en el código: `toLimaDate` conserva el componente de fecha UTC como fecha local, mientras que `toLimaDateTime` conserva el instante y lo convierte a Lima. React muestra el vencimiento en UTC. Por tanto, un valor como `2026-10-01T00:00:00Z` puede representar:

| Lectura | Fecha resultante |
|---|---|
| Instante convertido a Perú | 30/09/2026, 19:00 |
| Fecha preservada por `toLimaDate` | 01/10/2026 |
| Fecha mostrada por React en UTC | 01/10/2026 |

La auditoría conserva **dos referencias**, sin presumir que la fecha visible sustituya la fecha contractual:

1. **Instantes interpretados en Perú:** 71 discrepancias en días de mora, distribuidas en 68 combinaciones del servidor, una reproducción de la prueba previa y dos conversiones del frontend en zona UTC.
2. **Vencimiento tal como aparece actualmente en pantalla y cobro interpretado en Perú:** 44 discrepancias en días de mora.

Estos conteos se solapan y **no deben sumarse**. La dependencia de la zona del servidor está confirmada bajo ambas referencias. La cantidad de operaciones reales afectadas requiere conocer cómo se originaron sus fechas almacenadas. Los cuatro casos con cargo omitido tienen el mismo vencimiento tanto en Perú como en pantalla; su conclusión no depende de esta ambigüedad.

## Datos base y pagos antes, durante y después del vencimiento

Datos controlados: monto neto **S/ 20.000,00**, financiamiento **80 % = S/ 16.000,00**, garantía **S/ 4.000,00**, tasa mensual **2 %**, inicio **01/09/2026 a las 10:00 en Perú**, vencimiento **01/10/2026**, propuesta con **30 días y descuento S/ 320,00**. Banco BCP, sin conceptos adicionales ni gasto interbancario.

Se ejercitó la fórmula actual: interés compuesto sobre el capital financiado, tasa diaria equivalente a una tasa mensual con divisor 30, tasa diaria redondeada a diez decimales e importes a dos. Un atraso no se calcula como una penalidad diaria independiente: el servicio cobra la diferencia positiva entre el descuento recalculado y el descuento de la propuesta.

| Escenario | Pago en Perú | Días financiados | Días de mora | Descuento recalculado | Reintegro | Cargo adicional | Saldo a favor |
|---|---|---:|---:|---:|---:|---:|---:|
| Pago el día de inicio | 01/09/2026 | 0 | 0 | 0,00 | 320,00 | 0,00 | 4.320,00 |
| Cinco días antes | 26/09/2026 | 25 | 0 | 266,23 | 53,77 | 0,00 | 4.053,77 |
| Un día antes | 30/09/2026 | 29 | 0 | 309,23 | 10,77 | 0,00 | 4.010,77 |
| El mismo día pactado | 01/10/2026 | 30 | 0 | 320,00 | 0,00 | 0,00 | 4.000,00 |
| Un día después | 02/10/2026 | 31 | 1 | 330,78 | 0,00 | 10,78 | 3.989,22 |
| Diez días después | 11/10/2026 | 40 | 10 | 428,08 | 0,00 | 108,08 | 3.891,92 |
| Noventa días después | 30/12/2026 | 120 | 90 | 1.318,91 | 0,00 | 998,91 | 3.001,09 |

**Resultado:** estas entradas producen fechas, reintegros, cargos y saldos consistentes con el comportamiento financiero vigente. No se observaron reintegro y cargo de mora positivos simultáneamente.

## Cobertura ejecutada

“Sin discrepancia principal” significa que el escenario cumple las comprobaciones de esta auditoría. Las observaciones se contabilizan por escenario y pueden coexistir con un resultado principal conforme o discrepante.

| Grupo | Escenarios | Sin discrepancia principal | Con discrepancia | Con observaciones |
|---|---:|---:|---:|---:|
| Calendario y fechas límite | 480 | 480 | 0 | 0 |
| Sensibilidad financiera | 1.440 | 1.440 | 0 | 852 |
| Zonas y horas del servidor | 320 | 252 | 68 | 128 |
| Inicio real frente al de la propuesta | 5 | 5 | 0 | 4 |
| Reproducción de la prueba previa | 2 | 1 | 1 | 1 |
| Pago anterior al inicio | 2 | 0 | 2 | 0 |
| Validación de entradas | 4 | 2 | 2 | 0 |
| Conceptos adicionales e IGV | 5 | 2 | 3 | 0 |
| Comparación de simulación y guardado sustituido | 3 | 3 | 0 | 0 |
| Conversión de fechas del frontend | 20 | 18 | 2 | 12 |
| **Total** | **2.281** | **2.203** | **78** | **997** |

Las combinaciones incluyen:

- Vencimientos: **01/10/2026, 01/02/2026, 01/03/2027, 01/03/2028, 01/01/2027 y 08/11/2026**. Cubren cambio de mes y año, febrero de 28 y 29 días y vencimiento en domingo.
- Anticipación o atraso: **−30, −10, −5, −1, 0, +1, +5, +10, +30 y +90 días** en la matriz de calendario. El inicio siempre está 30 días antes del vencimiento.
- Capitales: **100,01; 20.000,00; 99.999.999,99**. Tasas mensuales: **0 %, 1,5 %, 2 % y 10 %**. Financiamiento: **50 %, 80 % y 100 %**.
- Monedas: **PEN y USD**. Banco propio y otro banco; gasto interbancario exonerado y no exonerado. Tarifas controladas: **7,50 PEN y 2,50 USD**.
- Servidor: **UTC, Lima, Nueva York y Madrid**. Horas de vencimiento almacenadas en UTC: **00:00, 04:59, 05:00, 12:00 y 23:59**. Horas de pago en Perú: **00:00, 04:59, 12:00 y 23:59**.
- Frontend: funciones reales de fecha ejecutadas en procesos con zonas **Lima, UTC, Madrid, Bogotá y Tokio**, para pagos −1, 0, +1 y +10 días. No son pruebas de interacción del navegador.

El divisor financiero 30 no significa que cada mes tenga 30 días calendario: el plazo se obtiene de las fechas reales, incluido febrero y fines de semana.

## Explicación del fallo previo: 10 frente a 9

La prueba previa utiliza estas fechas:

| Campo | Valor UTC de la prueba | Instante en Perú |
|---|---|---|
| Inicio | 01/09/2026 00:00Z | 31/08/2026 19:00 |
| Vencimiento | 01/10/2026 00:00Z | 30/09/2026 19:00 |
| Pago | 11/10/2026 00:00Z | 10/10/2026 19:00 |

Entre **30/09 y 10/10 en Perú hay 10 días calendario**. Sin embargo, cuando el servidor usa UTC, el código compara el comienzo del **01/10 en UTC** con el comienzo del **10/10 en Lima**. El intervalo es 9 días y 5 horas y se redondea hacia abajo a **9**.

Comprobación adicional con procesos reales y distintos valores de zona:

| Mismos valores de vencimiento y pago | Servidor UTC | Servidor Lima | Servidor Madrid |
|---|---:|---:|---:|
| 01/10 00:00Z → 11/10 00:00Z | 9 | 10 | 9 |
| 01/10 23:59Z → 02/10 05:00Z | 1 | 1 | 0 |

Con fechas explícitas de Perú —vencimiento `2026-10-01T00:00:00-05:00` y pago `2026-10-11T00:00:00-05:00`— la simulación devuelve **10 días** en el escenario de control UTC.

La prueba anterior, además, sustituye el calculador financiero y fija manualmente un descuento original de **400**. La nueva auditoría utiliza el calculador real para construir la propuesta. Los importes de ambas pruebas no son equivalentes; la reproducción que se compara aquí es la del desfase de fechas.

La ejecución actual del archivo previo mantiene **14 pruebas aprobadas y una fallida**, por el mismo Expected 10 / Received 9. No se modificó su expectativa.

## Discrepancias reproducidas y efecto económico

### Zona del servidor

En los 320 escenarios de zona/hora, las discrepancias frente a días civiles de Perú fueron: **UTC 24/80**, **Lima 0/80**, **Nueva York 12/80** y **Madrid 32/80**. Son resultados de combinaciones controladas, no tasas de incidencia en operaciones reales.

Caso con impacto económico: vencimiento almacenado **01/10/2026 23:59Z**, servidor Madrid y pago **02/10/2026 en Perú**. Se probaron cuatro horas de pago. En las cuatro, el servicio informa cero días de mora, omite **10,78** de cargo y devuelve **4.000,00**. La referencia Perú y la fecha visible coinciden en vencimiento 01/10; ambas esperan un día de atraso y **3.989,22** de saldo a favor.

Los otros desfases de días no implican automáticamente un cargo incorrecto: el importe se obtiene por diferencia de descuentos, no multiplicando los días de mora mostrados por una penalidad.

### Pago anterior al inicio

Inicio real 01/09 y descuento original 320:

| Pago | Días financiados | Descuento | Reintegro | Saldo a favor | Resultado |
|---|---:|---:|---:|---:|---|
| 31/08/2026 | −1 | −10,56 | 330,56 | 4.330,56 | Entrada aceptada |
| 22/08/2026 | −10 | −105,27 | 425,27 | 4.425,27 | Entrada aceptada |

Se confirmó que controlador y servicio permiten esta secuencia temporal. No hay una respuesta de validación antes del cálculo en estos dos casos.

### Importes y cantidades negativos

Con un concepto de cargo afecto, factor −1 e IGV controlado del 18 %, tanto **importe −100 / cantidad 1** como **importe 100 / cantidad −1** se aceptan. El cargo y su IGV se vuelven negativos y el saldo sube de **4.000 a 4.118**.

La expectativa de rechazo supone que el signo cargo/abono corresponde al factor del concepto y que cantidad e importe unitario son magnitudes positivas. Si existen ajustes negativos autorizados por contrato, esa expectativa necesita otra definición. La aceptación y la inversión del efecto económico están comprobadas.

En contraste, la fecha vacía y la cadena `fecha-no-valida` son rechazadas por la validación real del controlador.

### Conceptos adicionales e IGV

La ruta de conceptos adicionales determina el IGV por el tipo financiero; la ruta de conceptos internos utiliza `afecto_igv`. El saldo base es 4.000 y el concepto adicional es 100:

| Concepto controlado | IGV según bandera | IGV calculado | Saldo según bandera | Saldo calculado |
|---|---:|---:|---:|---:|
| Cargo tipo 2, inafecto | 0,00 | 18,00 | 3.900,00 | 3.882,00 |
| Cargo tipo 4, afecto | 18,00 | 0,00 | 3.882,00 | 3.900,00 |
| Abono tipo 2, inafecto | 0,00 | 18,00 | 4.100,00 | 4.118,00 |

Las otras dos combinaciones —tipo 2 afecto y tipo 4 inafecto— coinciden. La inconsistencia entre criterios está reproducida; su alcance operativo depende del catálogo real y de las restricciones de selección, que no se consultaron.

## Observaciones financieras y de fechas que requieren interpretación

| Observación | Escenarios | Evidencia | Alcance de la conclusión |
|---|---:|---|---|
| Redondeo intermedio de tasa diaria | 360 | Diferencias mayores de 0,01 frente a interés mensual equivalente sin redondeo intermedio; máximo observado **0,18** | Comportamiento histórico; no se calificó automáticamente como error contractual |
| Financiamiento más garantía supera el neto | 320 | Neto 100,01 y financiamiento 50 % producen 50,01 financiado + 50,01 de garantía = **100,02** | Diferencia real de **un centavo**, derivada del redondeo independiente; falta definir la política de reparto |
| Cobertura de garantía no finita con tasa cero | 360 | El calculador de propuesta produce **Infinity** o **NaN** en días de cobertura | La liquidación permanece finita; no se probó guardado real de esa propuesta |
| Reintegro positivo sin gasto interbancario | 24 | Financiamiento 100 %, garantía 0, banco distinto y pago anticipado: reintegro **50,31**, gasto 0 | El filtro actual examina garantía menos mora y tarifa, sin reintegro; su corrección depende de la política del gasto |
| Inicio real distinto al de propuesta | 4 | Dos reintegros en pago puntual y dos diferencias de descuento sin cargo | Requiere interpretar el descuento aceptado y el momento real del desembolso |
| Fecha elegida no se conserva en frontend | 8 | En Madrid y Tokio, elegir 01/10 vuelve a mostrarse como **30/09** | Confirmado en funciones reales; no se verificó interacción completa ni necesidad de operar desde esas zonas |
| Fecha pactada visible distinta del día del instante en Perú | 133 | Medianoche UTC puede mostrarse 01/10 y corresponder al 30/09 en Lima | Evidencia de representaciones distintas; no identifica por sí sola cuál era la fecha contractual |

Los conteos de observaciones se solapan. **997 escenarios** tuvieron al menos una observación; no corresponde sumar las filas para obtener escenarios únicos.

Detalle del inicio distinto: con operación iniciada el 01/09 y pago puntual el 01/10, una propuesta calculada desde el 27/08 descuenta inicialmente **373,95**, se recalcula a **320,00** y devuelve **53,95**. Una propuesta calculada desde el 03/09 descuenta **298,47** y se recalcula a **320,00**, pero no cobra la diferencia **21,53** porque el pago no es tardío. Los cinco casos se ejecutaron con desfases de −2, −1, 0, +1 y +5 días en el plazo de propuesta.

En montos grandes, el máximo de redondeo observado fue con neto **99.999.999,99**, financiamiento **100 %**, tasa mensual **1,5 %** y pago diez días tarde: descuento actual **2.004.983,62** frente a **2.004.983,44** sin redondear primero la tasa diaria. Ese importe es descuento acumulado, no el cargo adicional de mora.

También se ejercitaron saldos por cobrar cuando la garantía no cubre el cargo: **144 escenarios** terminaron con saldo neto negativo. En ellos el servicio informó monto por cobrar y cero monto a favor, sin anomalía adicional en estas comprobaciones.

## Método, evidencia y reproducción

La batería llama al **controlador real, servicio real y calculadores V4/V3 reales**, con operaciones aritméticas `Decimal`. Se sustituyen acceso a base de datos, catálogos, configuración e infraestructura externa; no se sustituye el resultado del cálculo financiero. La propuesta base se genera con los helpers vigentes, conservando su tratamiento actual de fechas.

La referencia de días se obtiene mediante diferencias entre fechas civiles, independiente del método de Luxon utilizado en producción. La referencia adicional de descuento utiliza `capital × ((1 + tasa mensual)^(días / 30) − 1)`, redondeando al final; se registra como comparación, no como reemplazo de la política histórica de redondeo.

La comprobación del saldo verifica garantía, reintegro, cargo, gasto presente y conceptos adicionales. La aplicación o ausencia del gasto que pueda depender de contrato se registra por separado. IGV 18 % es configuración sintética de prueba, no una revisión tributaria.

Tres pruebas compararon los campos enviados a guardado con la simulación para pagos anticipado, puntual y tardío. El guardado está sustituido: **no verifican persistencia, transacciones ni conversión horaria de MySQL/Prisma reales**.

Archivos:

- [Pruebas de auditoría](../tests/unit/services/admin/factoringliquidacion.audit.test.ts).
- [Ayudante que ejecuta los conversores reales del frontend](../scripts/analisis/fecha-liquidacion-frontend.cjs).
- [Datos completos de los 2.281 escenarios](../temporal/liquidacion-audit/resultados.json), con entradas, resultado real, referencias y códigos de discrepancia u observación.
- [Salida estructurada de Jest](../temporal/liquidacion-audit-jest.json) y [registro de ejecución](../temporal/liquidacion-audit-run.log).
- [Registro de la prueba previa](../temporal/liquidacion-baseline.log).

Desde la raíz del backend:

```powershell
npm test -- --runInBand tests/unit/services/admin/factoringliquidacion.audit.test.ts --json --outputFile temporal/liquidacion-audit-jest.json
npm test -- --runInBand tests/unit/services/admin/factoringliquidacion.Service.test.ts
```

La auditoría final registra **2.262 pruebas Jest: 2.185 aprobadas y 77 fallidas**. La diferencia respecto de los 2.281 escenarios y 78 discrepantes se debe a que los veinte escenarios de conversión del frontend se agrupan en una sola prueba Jest, que contiene dos escenarios discrepantes.

Las expectativas se mantienen para que las discrepancias queden visibles; no se ajustaron para obtener una ejecución verde. Esta nueva batería se incluye en el descubrimiento habitual de Jest y hará fallar la ejecución completa mientras permanezcan esas discrepancias. Los resultados dentro de `temporal` son artefactos locales regenerables.

## Límites y cuestiones aún no comprobadas

No se modificó producción durante esta auditoría. Los ajustes previos de requisitos faltantes permanecen como estaban. No se cambió la expectativa de la prueba antigua ni se aplicaron correcciones a los hallazgos.

No se usaron operaciones de la base real, no se recorrió el formulario en un navegador y no se probaron pagos parciales, múltiples cobros, repetición de liquidaciones, concurrencia, restricciones de base de datos o una tasa penal independiente. Tampoco se certificó toda la contabilidad de comisiones, impuestos y costos de la propuesta: el objeto de esta batería es la liquidación y su relación con el descuento aceptado.

El significado contractual de las fechas almacenadas, las combinaciones válidas de catálogo, el reparto del centavo, el cobro interbancario sobre reintegros y el tratamiento del inicio distinto siguen siendo límites de interpretación. La evidencia permite identificar qué comportamientos están reproducidos y cuáles requieren esa definición antes de concluir que son fallos de negocio.
