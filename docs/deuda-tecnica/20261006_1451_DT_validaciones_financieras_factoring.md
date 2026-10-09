# Deuda técnica: validaciones y consistencia financiera de factoring

- **Registro:** 2026-10-06 14:51 — America/Lima (UTC−05:00).
- **Estado final al 09/10/2026:** DT-LIQ-01, DT-LIQ-02, DT-LIQ-02-RANGO, DT-LIQ-03, DT-LIQ-04, DT-LIQ-05 y DT-LIQ-06 cerradas en el alcance aprobado tras validación conjunta. DT-LIQ-07/08 cerradas por decisión expresa de conservar las reglas actuales. DT-LIQ-09 diferida por decisión de mantener el comportamiento actual, sin acreditar cumplimiento normativo. [Evidencia final y límites](../validacion-conjunta-liquidacion-cierre-20261009.md). Las menciones posteriores a validación pendiente conservan la trazabilidad previa y quedan sustituidas por este cierre.
- **Origen:** auditoría de propuesta y liquidación de factoring del 06/10/2026 y revisión del código al registrar esta deuda.
- **Ámbito:** backend; las futuras correcciones que cambien el contrato de datos también deberán considerar formulario, presentación y persistencia.
- **Configuración acordada:** base de datos y backend en UTC; navegador en Lima. Las reglas de plazos usan días calendario de Perú, incluidos sábados y domingos.

## Objetivo y acuerdo de seguimiento

Registrar los seis hallazgos solicitados para su posterior solución. Todo hallazgo descubierto que se deje fuera del trabajo actual se registrará como deuda técnica, con evidencia, estado y alcance. Las observaciones cuya regla de negocio esté por confirmar se identificarán como tales; no se darán por defectos contractuales demostrados.

Cada deuda debe conservar causa, ejemplo reproducible, impacto, propuesta de solución, decisiones pendientes y criterios de aceptación. Para cerrarla se requiere resolver las decisiones necesarias, implementar la corrección y verificar esos criterios. Documentar una propuesta no equivale a autorizar su implementación.

Los importes, conteos e identificadores de escenarios citados proceden de la auditoría anterior con datos controlados. No se reejecutó esa batería para crear este documento ni se presupone que su resultado completo describa el estado actual del repositorio. Se revisaron las causas de los seis puntos al registrar la deuda; las actualizaciones posteriores se indican en cada sección.

## Resumen de deudas solicitadas

| ID | Hallazgo | Causa | Estado de evidencia | Solución profesional propuesta |
|---|---|---|---|---|
| DT-LIQ-01 | Pago anterior al inicio | Faltaba validación cronológica antes del cálculo | Cerrada el 09/10/2026; servicio y ausencia de registros en MariaDB verificados | Se rechazan días de pago anteriores al día de inicio en Perú, al simular y al guardar |
| DT-LIQ-02 | Cargos convertidos en abonos | Se aceptaban cantidades e importes negativos | Cerrado el rechazo de negativos el 09/10/2026; backend, frontend y MariaDB verificados | Conservar factor y ceros. Máximos/precisión separados en DT-LIQ-02-RANGO |
| DT-LIQ-02-RANGO | Precisión y capacidad de entradas/resultados | Cantidad y unitario solo se guardaban con dos decimales | Cerrada el 09/10/2026; precisión diez/dos, límites y guardado/lectura reales verificados | Mantener importe/IGV a dos; impedir precisión ampliada sobre base antigua |
| DT-LIQ-03 | IGV inconsistente | Las dos rutas usan ahora `afecto_igv` | Cerrada: regla aprobada, pruebas rápidas y persistencia real verificadas | Conservar importes históricos |
| DT-LIQ-04 | Diferencia de un centavo en capital | Se redondeaban ambas partes por separado | Cerrada el 09/10/2026; cálculo y guardado verificados | Financiamiento redondeado y garantía por diferencia; conservar aceptadas |
| DT-LIQ-05 | Cobertura infinita con tasa cero | División entre cero en la cobertura de garantía | Cerrada el 09/10/2026; API, presentación y guardado/lectura real verificados | Guardar null y mostrar «No calculable con tasa cero» en todos los casos de tasa cero |
| DT-LIQ-06 | Reintegro sin gasto interbancario | La condición omitía el reintegro y los adicionales | Cerrada el 09/10/2026; saldo, gasto y persistencia verificados | Evaluar saldo completo y dejar reembolso positivo; banco propio/exoneración sin gasto automático |

## Evidencia común y límites

El caso base de liquidación utiliza monto neto S/ 20.000,00, financiamiento 80 % (S/ 16.000,00), garantía S/ 4.000,00, tasa mensual 2 %, inicio 01/09/2026 y vencimiento 01/10/2026. La propuesta de 30 días tiene descuento S/ 320,00. Los ejemplos indican expresamente cuando cambian estos datos.

La auditoría ejercita controlador, servicio y calculadores reales con `Decimal`; sustituye acceso a base de datos, catálogos, configuración e infraestructura externa. IGV 18 % y tarifas de 7,50 PEN / 2,50 USD son datos controlados. Los ejemplos no prueban que existan operaciones reales afectadas, que las combinaciones sintéticas estén habilitadas en el catálogo o que la base real permita guardar valores no finitos.

Las pruebas con servidor Madrid o navegador Madrid/Tokio están fuera de la configuración operativa acordada. Sus resultados no fundamentan las seis deudas aquí registradas. El desfase de fechas UTC/Lima tiene seguimiento separado y no se declara como nueva deuda pendiente en este archivo.

## DT-LIQ-01 — Pago anterior al inicio de operación

**Estado:** corregida en backend el 09/10/2026, por autorización de implementar la Opción Alfa 1. Las evidencias de la auditoría que siguen describen el comportamiento anterior.

**Cierre:** validación conjunta aprobada, incluida ausencia de registros en MariaDB desechable. [Informe final](../validacion-final-deudas-factoring-20261009.md). Las limitaciones de las pruebas iniciales descritas abajo corresponden a esa etapa, no al cierre actual.

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

**Implementación y verificación actual:** `runSimulation`, compartida por simulación y creación, compara ambos instantes mediante `calculateCalendarDaysInLima` antes de consultar tarifas o invocar el calculador. Si el resultado es negativo, lanza `ClientError` 400 con el mensaje «La fecha de pago no puede ser anterior al día de inicio de la operación». Se conservan los instantes UTC, las fórmulas y los importes aceptados.

La regresión activa está en [factoringliquidacion.business.test.ts](../../tests/vitest/unit/factoringliquidacion.business.test.ts), bloque `DT-LIQ-01`. Cubre ambas operaciones: rechazo uno y diez días antes; frontera de medianoche peruana aunque UTC indique el día de inicio; equivalencia UTC/−05:00 y entradas `Date`; mismo día con hora de pago anterior al inicio y cero días/descuento; pagos anticipados válidos, puntuales y tardíos. Antes del cambio fallaron los diez casos de rechazo porque se aceptaba la entrada. Después aprobaron los 22 casos del bloque y las regresiones de liquidación, fechas y calculador seleccionadas. Se retiró el `todo` correspondiente de criterios pendientes sin cambiar las expectativas de las otras deudas.

**Límite:** las pruebas usan servicios y calculador reales, con DAOs y transacción simulados. Verifican que el rechazo ocurre antes del cálculo y sin llamadas a inserción de cabecera o detalles; no constituyen una prueba de persistencia o rollback en MariaDB. No se ejecutaron la suite completa, navegador ni empaquetado de producción.

Comprobaciones focalizadas del 09/10/2026:

- `npm run test:vitest -- tests/vitest/unit/factoringliquidacion.business.test.ts tests/vitest/unit/dateUtils.test.ts tests/vitest/unit/factoring.Calculator.test.ts`: aprobadas.
- `npx --no-install tsc --noEmit` y `npm run test:vitest:typecheck`: aprobadas.
- Jest: aprobada la suite `factoringliquidacion.Service.test.ts` y los escenarios `pago-dia-antes-inicio` y `pago-diez-dias-antes-inicio` de `factoringliquidacion.audit.test.ts`, sin modificar sus expectativas. La selección restante de la auditoría se omitió mediante filtro; la prueba de auditoría seleccionada atraviesa el controlador de simulación real.
- La lectura de rutas de Vite encontró `EPERM` dentro del sandbox; la ejecución focalizada fuera de esa restricción aprobó sin cambios de configuración.

## DT-LIQ-02 — Cantidades o importes negativos invierten cargos

**Actualización del 09/10/2026:** el usuario confirmó que `factor` ya define la dirección y autorizó implementar el rechazo de cantidades e importes negativos en backend y formulario (Opción Bravo 4), conservando el comportamiento actual del cero. No se introduce un mecanismo de reversión ni se recalculan registros históricos. La evidencia y la revisión anteriores que siguen describen el estado previo a esta corrección.

**Cierre del alcance aprobado:** el rechazo de negativos aprobó la validación de formulario, HTTP, servicio y ausencia de registros en MariaDB. Los límites máximos/precisión no se dan por resueltos: se trasladan a [DT-LIQ-02-RANGO](20261009_DT_limites_entrada_financiera.md). [Informe final](../validacion-final-deudas-factoring-20261009.md). Las menciones a ejecución pendiente abajo conservan la trazabilidad de la etapa de implementación y quedan sustituidas por este cierre.

**Ubicación:** [esquemas de simulación y creación](../../src/controllers/admin/servicio/factoring/factoringliquidacion.Controller.ts), [getFinancialData y agregación del saldo](../../src/services/admin/factoringliquidacion.Service.ts).

**Causa:** los esquemas aceptan cualquier número para cantidad e importe unitario. El servicio multiplica ambos, calcula el IGV y aplica el factor del concepto al saldo. Un resultado negativo en un concepto de cargo produce el efecto económico de un abono.

**Evidencia:** escenarios `cargo-negativo` y `cantidad-negativa`. Con saldo base 4.000,00, tipo 2 afecto, factor −1 e IGV controlado 18 %:

| Cantidad | Importe unitario | Monto | IGV | Saldo resultante |
|---:|---:|---:|---:|---:|
| 1 | −100,00 | −100,00 | −18,00 | 4.118,00 |
| −1 | 100,00 | −100,00 | −18,00 | 4.118,00 |

**Impacto:** el signo de un dato de entrada modifica la naturaleza cargo/abono del concepto seleccionado.

**Decisión pendiente:** confirmar si existen ajustes negativos autorizados y cómo deben identificarse. La inversión está comprobada; su legitimidad contractual no se presume.

**Revisión del flujo actual (09/10/2026):** los controladores de simulación y creación siguen aceptando `cantidad` y `monto_unitario` sin restricción de signo. `getFinancialData` multiplica ambos y el desglose clasifica el movimiento por `financiero_concepto.factor`; por ello, un cargo de monto negativo aumenta el saldo y un abono negativo lo reduce. El DTO de conceptos adicionales contiene tipo, concepto, cantidad, importe unitario y descripción opcional; no declara un campo específico para vincular una reversión con un movimiento original ni una marca de reversión autorizada. Esto describe el contrato revisado, no demuestra cómo se usan los conceptos en operaciones reales. No se consultó una base compartida ni se ejecutaron nuevas pruebas en esta revisión. No se modificaron validaciones: permanece pendiente confirmar si el negocio permite corregir cargos o abonos mediante entradas negativas, y definir cantidad/importe cero y límites antes de implementar el rechazo.

**Propuesta:** para conceptos ordinarios, exigir cantidad positiva e importe unitario no negativo, con límites definidos y validación en backend. Si existen reversos, modelarlos como un ajuste explícito y trazable. El factor del concepto debe determinar la dirección del movimiento.

**Criterios de aceptación:**

- Rechazar los dos ejemplos negativos en simulación y creación sin persistencia.
- Validar la política elegida para cantidad cero e importe cero; evitar ceros implícitos que oculten entradas inválidas.
- Mantener cargo positivo como reducción y abono positivo como aumento.
- Validar entradas numéricas no válidas y límites de precisión/rango del contrato.
- Si se admiten reversos, probar autorización, motivo y dirección resultante.

**Cambio implementado:** los esquemas de simulación y creación validan `cantidad >= 0` y `monto_unitario >= 0`, conservando sus valores predeterminados. El punto compartido `runSimulation` también comprueba el signo antes de consultar tarifas o calcular importes, para proteger llamadas directas al servicio. El rechazo ocurre sin insertar cabecera ni detalles. No cambia la clasificación por `factor` ni el contrato del manejador HTTP: las validaciones Yup conservan respuesta 400 «Datos no válidos».

Los formularios de alta de Administración y Financiero muestran el mensaje junto al campo negativo, bloquean cálculo/creación y protegen el envío directo del formulario. Introducir un negativo descarta la simulación visible y exige recalcular después de corregirlo. Se conserva el filtro de filas incompletas, la conversión del payload y las restricciones nativas previas del formulario (incluido `min: 1` de cantidad); no se unifica la política de ceros entre navegador y backend en este cambio.

**Validación actual:** aprobadas las suites focalizadas `tests/vitest/unit/factoringliquidacion.business.test.ts` y `tests/vitest/http/factoring.business.test.ts`, con servicios, calculadores, rutas, autenticación y validación reales y DAOs simulados. Los casos nuevos cubren negativos individuales y dobles, decimales negativos, ceros, valores predeterminados, dirección de cargos/abonos y ausencia de inserciones; por HTTP se comprueba además que los negativos no abren transacción. `npx --no-install tsc --noEmit` y `npm run test:vitest:typecheck` aprobados.

También aprobó la selección Jest de `factoringliquidacion.Service.test.ts` y los escenarios originales `cargo-negativo` y `cantidad-negativa` de `factoringliquidacion.audit.test.ts`, sin modificar sus expectativas. Se usó filtro por nombre; los demás casos de auditoría no se ejecutaron.

**Límites y pendientes:** no se probó persistencia/rollback real en MariaDB ni navegador. La regresión del frontend está preparada en `src/test-utils/factoringPropuestaLiquidacion.business.test.js` del repositorio frontend, pero no ejecutada por el modelo: su `AGENTS.md` y skill `frontend-validation` exigen ejecución manual. El procedimiento está en `docs/pruebas/FACTORING_PROPUESTA_LIQUIDACION.md` de ese repositorio. Permanecen sin definir límites máximos de rango/precisión; el `todo` de DT-LIQ-02 se acota a esa decisión y no al control de signo ya implementado.

## DT-LIQ-03 — Dos reglas distintas para IGV

**Regla aprobada e implementada el 2026-10-09 (Opción Alfa 6):** `financiero_concepto.afecto_igv` determina el impuesto para conceptos internos y adicionales, independientemente del tipo financiero. Afecto aplica la tasa IGV configurada; inafecto aplica cero. Se mantienen redondeos, `factor`, contratos y permisos. La excepción del tipo 4 se elimina en los cálculos nuevos. No se migran ni recalculan liquidaciones guardadas. La evidencia siguiente describe el comportamiento anterior; las decisiones pendientes descritas en la revisión quedaron resueltas por esta aprobación.

**Cierre:** 192 casos Vitest aprobados (incluidos 48 nuevos), tres casos originales de auditoría Jest aprobados sin cambiar expectativas, 49 casos MariaDB aprobados (incluidos ocho nuevos) y tipos de backend/Vitest/integración correctos. [Evidencia y límites](../validacion-igv-liquidaciones-20261009.md).

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

**Revisión estática del 2026-10-09:** el esquema `prisma/ft_factoring/schema.prisma` define `afecto_igv` en `financiero_concepto`; `financiero_tipo` no tiene esa bandera ni una relación que restrinja los conceptos seleccionables. `financiero_concepto_liquidacion` habilita conceptos para liquidación, sin vincularlos a un tipo. En los formularios de nueva liquidación de administrador y financiero se muestran todos los conceptos habilitados, independientemente del tipo seleccionado, y su etiqueta de afectación usa `afecto_igv`. El servicio busca tipo y concepto por separado, sin validar una combinación permitida. Por tanto, el flujo revisado no impide las combinaciones divergentes; esto no demuestra que existan actualmente en el catálogo de producción.

**Recomendación pendiente de aprobación:** usar `financiero_concepto.afecto_igv` también para los conceptos adicionales, con la tasa IGV configurada y el redondeo existente. Así, un concepto inafecto tendría IGV cero con cualquier tipo, y uno afecto tendría el impuesto configurado con cualquier tipo. `factor` seguiría determinando cargo o abono. La excepción actual del tipo 4 desaparecería para cálculos nuevos; no se modificarían liquidaciones guardadas. Si el tipo 4 debe imponer una excepción de negocio, primero debe especificarse esa regla y su compatibilidad con la bandera del concepto.

Esta revisión no modifica cálculos ni consulta bases compartidas. No se ejecutaron pruebas nuevas: la decisión financiera sigue pendiente y DT-LIQ-03 permanece abierta.

**Propuesta:** centralizar la regla autorizada para cálculo, clasificación y presentación; validar coherencia entre tipo y concepto. Respetar los datos históricos ya aceptados y separar cualquier revisión de registros existentes.

**Criterios de aceptación:**

- Documentar la matriz de combinaciones permitidas del catálogo.
- Rechazar combinaciones inválidas o aplicar de manera uniforme la regla aprobada.
- Obtener el mismo IGV para un concepto por las rutas interna y adicional.
- Conciliar monto, IGV, total, clasificación y saldo para cargos y abonos.
- Cubrir IGV cero y la tasa configurada, sin fijar la tasa de la auditoría como constante nueva.

## DT-LIQ-04 — Financiamiento más garantía no conserva el neto

**Implementación autorizada el 09/10/2026:** V2/V3 calculan primero `monto_efectivo = redondear(neto × porcentaje, 2)` (financiamiento) y luego `monto_garantia = redondear(neto − monto_efectivo, 2)`. Con neto monetario 100,01 y 50 %, se obtiene 50,01 financiado y 50,00 de garantía. Se conserva el modo de redondeo vigente, intereses y comisiones. La liquidación continúa usando la garantía aceptada; no se migran importes existentes. No se cambió el rango de porcentajes ni se normalizaron entradas de neto fuera de dos decimales; esos contratos no forman parte de esta corrección. Preparadas pruebas V2/V3, servicio con garantía histórica y guardado de propuesta en MariaDB. **No ejecutadas; pendiente del cierre conjunto.** [Detalle](../precision-sunat-y-residual-garantia-20261009.md). Las decisiones siguientes describen el antecedente previo a esta aprobación.

**Revisión del 09/10/2026:** [propuesta concreta y decisiones](../revision-pendientes-liquidacion-20261009.md). Se recomienda conservar el financiamiento redondeado y calcular la garantía por diferencia respecto del neto monetario para cálculos nuevos. Pendiente de aprobación; no se cambió código financiero ni se ejecutaron validaciones en esta revisión.

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

**Estado al 09/10/2026:** cerrada tras la validación conjunta. El usuario eligió «No calculable con tasa cero» para todos los casos de tasa cero, conservando `null` en API/persistencia. Se verificó guardado y lectura real de propuestas y simulaciones, además de cálculo, HTTP y presentación. [Informe final](../validacion-final-deudas-factoring-20261009.md). Las causas, evidencias anteriores y menciones a pruebas preparadas que siguen conservan la trazabilidad previa al cierre.

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

**Implementación:** V2 y V3 omiten la fórmula de cobertura si la tasa mensual usada por esa fórmula es cero y devuelven `null`. Se comprueba la tasa ya redondeada a cinco decimales, igual que en el denominador anterior; por ello una tasa de entrada muy pequeña que se redondee a cero también tendrá cobertura nula. No cambian los cálculos de descuento, intereses, cargos ni redondeos. En altas de propuestas y simulaciones se conserva explícitamente el `null` al preparar la escritura, sin modificar el esquema nullable ni registros existentes.

El frontend usa `src/utils/factoringCoverage.js` para mostrar el texto elegido en alta, detalle, edición, listas, resúmenes y propuesta aceptada de Administración/Financiero, y las pantallas de simulaciones administrativas. Con tasa positiva mantiene los días, incluido cero; con dato ausente o no finito y tasa desconocida/positiva muestra «No disponible», sin inventar una cantidad de días.

**Pruebas preparadas, no ejecutadas en este cambio:** calculador V2/V3 (garantía positiva/cero y financiamiento cero), serialización/respuesta HTTP y payload de propuesta, payload de simulación, guardado y lectura de propuestas con Prisma/MariaDB desechable, utilidad de presentación y formularios de alta de propuesta de ambos roles. Retirado el criterio `todo` de decisión de negocio: la semántica ya fue elegida; esto no declara las pruebas aprobadas. Procedimiento completo y límites en [corrección de cobertura](../correccion-cobertura-tasa-cero-factoring.md).

## DT-LIQ-06 — No se considera reintegro al decidir gasto interbancario

**Implementación autorizada el 09/10/2026:** el gasto automático se decide después de garantía, reintegro/mora y adicionales, usando totales con IGV y dirección por concepto. Solo se añade si banco distinto, sin exoneración, gasto positivo de cargo y saldo previo estrictamente superior al gasto total. Saldo igual/inferior no genera gasto automático. Un gasto explícito evita otro automático; repetir el concepto se rechaza con mensaje, sin borrar movimientos silenciosamente. Banco propio y exoneración conservan el control del gasto automático; un movimiento explícito mantiene su importe ingresado. Se conserva el ID del concepto usado por el servicio, las tarifas configuradas y registros históricos. Implementado, **pendiente de validación conjunta**, sin cierre. [Detalle de cambios y normativa](../implementacion-gasto-limites-liquidacion-20261009.md). Las causas y decisiones siguientes conservan la trazabilidad previa a esta autorización.

**Revisión del 09/10/2026:** [propuesta concreta y decisiones](../revision-pendientes-liquidacion-20261009.md). Se recomienda decidir el gasto sobre el saldo completo anterior al propio gasto y cobrarlo una sola vez únicamente si deja un reembolso positivo, manteniendo banco propio y exoneración. Pendiente de aprobación; no se cambió código financiero ni se ejecutaron validaciones en esta revisión.

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

**Estado:** cerrada por definición de política el 09/10/2026. El usuario decidió conservar la precisión tal como está: tasa diaria equivalente redondeada a diez decimales antes de calcular el interés compuesto, con importes monetarios a dos decimales. Se mantienen fórmula, modo de redondeo y tratamiento actual de propuestas aceptadas. No requiere modificación de código ni recálculo histórico. Las pruebas conjuntas de las demás implementaciones siguen pendientes.

**Consulta oficial del 09/10/2026:** SUNAT especifica cinco decimales para TIM tributaria; SBS calcula determinados factores oficiales con ocho y publica cinco. Sus alcances no establecen por sí solos una precisión obligatoria para este factoring. BBVA publica una fórmula directa de descuento por plazo sin especificar precisión diaria interna; no se encontró una política explícita de decimales diarios para factoring BCP en las páginas revisadas. Mantener la política vigente hasta aprobar cualquier cambio. [Fuentes, fórmulas, límites y recomendación](../precision-tasa-diaria-fuentes-peru-20261009.md).

La tasa diaria equivalente se redondea a diez decimales antes de calcular el interés compuesto. La referencia independiente, sin ese redondeo intermedio, presentó diferencias mayores de 0,01 en 360 escenarios. El máximo observado fue 0,18: neto 99.999.999,99, financiamiento 100 %, tasa mensual 1,5 % y pago diez días tarde; descuento actual 2.004.983,62 frente a 2.004.983,44 en la referencia.

La diferencia es de descuento acumulado, no del cargo adicional aislado. Es un comportamiento histórico: la referencia matemática no demuestra por sí sola que el contrato exija otro resultado.

**Cierre:** la decisión expresa resuelve la definición pendiente conservando el comportamiento actual. Las diferencias de la referencia anterior quedan como evidencia histórica de sensibilidad al redondeo, no como una corrección a implementar. Este cierre documental no representa una nueva ejecución de pruebas ni certificación normativa integral.

### DT-LIQ-08 — Inicio de propuesta distinto del inicio real

**Estado:** cerrada por definición de política el 09/10/2026. El usuario confirmó conservar el comportamiento actual: el descuento se ajusta desde el desembolso efectivo, representado en el cálculo por `factoring.fecha_operacion`, hasta el pago real. Se conserva como referencia el descuento de la propuesta aceptada, sin sobrescribirlo ni recalcular registros históricos.

El descuento aceptado puede haberse calculado desde la fecha de propuesta, mientras que la liquidación recalcula desde el inicio real. La decisión de generar reintegro o cargo también depende de si el pago se hizo antes o después del vencimiento.

Ejemplos anteriores, inicio real 01/09, pago puntual 01/10, capital financiado 16.000 y tasa 2 %:

| Inicio usado en propuesta | Descuento aceptado | Descuento efectivo | Tratamiento observado |
|---|---:|---:|---|
| 27/08 | 373,95 | 320,00 | Reintegro 53,95 |
| 03/09 | 298,47 | 320,00 | Diferencia 21,53 sin cargo de mora |

El segundo ejemplo es una secuencia sintética cuya validez operativa debe verificarse. Se observaron cuatro casos con comportamientos que requieren interpretación, dentro de cinco desfases probados.

**Cierre y regla conservada:** si el pago es anticipado o puntual respecto del vencimiento, se devuelve solo la diferencia positiva entre descuento aceptado y efectivo; si el pago es tardío, se cobra solo la diferencia positiva entre efectivo y aceptado. No se introduce un ajuste simétrico ni un cargo adicional por pago puntual. En el ejemplo de propuesta 27/08, inicio 01/09 y pago puntual 01/10, se conserva el reintegro de 53,95. El ejemplo sintético con propuesta posterior al inicio permanece como antecedente, sin autorizar cambios de cronología. No se modifica código ni se ejecutan pruebas; el cierre resuelve la política pendiente y no acredita una nueva validación funcional.

**Alcance de la fecha:** el código registra `fecha_operacion` al pasar al estado 36 (Inicio de Operación de Factoring), con la fecha/hora de esa transición. La decisión del usuario establece su interpretación de negocio como desembolso efectivo; esta lectura de código no verifica que el instante registrado coincida con una transferencia bancaria. No se modifica el registro de fechas ni se añade conciliación bancaria en este cierre.

## DT-LIQ-09 — Control normativo de tasas por fecha y moneda

**Estado al 09/10/2026:** mantener el comportamiento actual por decisión expresa del usuario. No implementar en este plan el control automático de topes BCRP, ni alterar tasas, validaciones actuales o contratos aceptados. La decisión de alcance queda resuelta; el control ausente se conserva como deuda diferida/riesgo aceptado, no como cumplimiento normativo acreditado ni como incumplimiento reproducido. No se modificó código financiero ni se ejecutaron pruebas. El análisis que sigue conserva el antecedente y los criterios para una eventual revisión futura. El usuario confirmó empresa de factoring fuera del ámbito de la Ley General. La búsqueda de máximos para cantidades/importes no identificó un máximo universal de esos campos en las fuentes consultadas; sí identificó topes de tasas del BCRP. No trasladar esos porcentajes a un límite monetario ni aplicar un valor actual a contratos aceptados de otra fecha. Revisar política de intereses/descuento, moneda, fecha contractual, historial de topes y conversión anual/mensual antes de implementar controles. [Fuentes oficiales y alcance](../implementacion-gasto-limites-liquidacion-20261009.md).

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

