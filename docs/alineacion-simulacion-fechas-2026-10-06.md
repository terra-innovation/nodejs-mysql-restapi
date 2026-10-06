# Alineación de fechas de simulación

Verificación: 6 de octubre de 2026.

## Resultado ejecutivo

Simulación aplica el mismo contrato de fechas que propuesta: emisión civil conservada y vencimiento propio interpretado como instante UTC en Lima. El formulario, los servicios, la persistencia sustituida, el listado, el detalle, el resultado, la vista previa y el PDF coinciden en ese criterio.

Pasaron **713 pruebas específicas**: **604 de backend** y **109 de frontend**. Incluyen **566 nuevas** para esta implementación y **147 de regresión**. Las 55 nuevas de React también pasaron con el proceso en Lima; la regresión conjunta del frontend se ejecutó con el proceso en UTC. Se generaron **40 PDF reales**, se extrajeron y verificaron sus fechas, días e importes, y se inspeccionó visualmente un PDF de simulación. Backend y frontend compilan; el frontend mantiene advertencias previas de lint y tamaño de bundle.

Estas pruebas no escriben en una base real ni despliegan cambios. La persistencia, los catálogos y las notificaciones se sustituyen; las fórmulas, los servicios, los controladores, Formik, Yup, los formateadores y el renderizador PDF son reales.

## Implementación

- `src/services/admin/factoringsimulacion.Service.ts`: creación y simulación usan `toLimaDateTime` para el vencimiento, igual que propuesta. La emisión mantiene su interpretación civil y se normaliza a `00:00Z` al guardar. Los DTO aceptan Date o string, como las entradas cubiertas por las pruebas.
- `FactoringsimulacionNuevo.js`: emisión enviada como `YYYY-MM-DD`; vencimiento convertido con `toIsoUtcFromLima`. Se restaura el vencimiento existente con `toDateInputValueLima` y se obtiene el día actual explícitamente en Lima.
- Lista, detalle, edición, resultado y vista previa: vencimiento mostrado con `formatDateLocale`; emisión civil conservada. Se probaron los componentes activos; el componente de edición no está integrado en el listado actual.
- PDF: se conserva `formatDateLocale` del generador, ya alineado en el cambio anterior; se añade regresión del renderizador real.
- [Estándar reutilizable](estandar-fechas-factoring.md): contrato y utilidades para evitar criterios distintos en nuevos módulos.

No se cambiaron tasas, fórmulas, redondeos, comisiones, costos, gastos o IGV.

## Cobertura y resultados

| Grupo | Casos | Resultado |
|---|---:|---|
| Simulación frente a propuesta: simulación, creación y datos entregados a persistencia | 480 | Todos aprobados |
| Controladores reales: validar, simular y crear con el mismo vencimiento | 5 | Todos aprobados |
| Fechas ausentes o inválidas: rechazo antes de cálculo y escritura | 6 | Todos aprobados |
| Generador PDF real: simulación y propuesta, diez instantes en dos zonas | 20 pruebas / 40 PDF | Todos aprobados |
| Formulario real React: enviar, guardar, restaurar, cambiar fechas y rechazar entradas | 25 | Todos aprobados |
| Lista, detalle, resultado y vista previa para diez instantes | 30 | Todos aprobados |
| Regresión backend: calendario, calculador, servicios y recorrido completo | 93 | Todos aprobados |
| Regresión frontend: helpers y formularios de propuesta/liquidación | 54 | Todos aprobados |

Los 480 casos cruzan seis recorridos de calendario, cinco horas UTC (`00:00`, `04:59:59`, `05:00`, `12:00`, `23:59:59`), cuatro zonas predeterminadas de Luxon (UTC, Lima, Nueva York y Madrid), dos bancos y dos monedas (PEN y USD). Se comprueba igualdad completa de resultados de simulación y propuesta, conservación del instante al guardar, antigüedad civil y persistencia de los cargos financieros. Para las 96 combinaciones con vencimiento `05:00Z` también se comprueba equivalencia de importes y cargos respecto al criterio anterior.

## Datos financieros de ejemplo

Entrada común: neto **55.484,49**, financiamiento **98 %**, tasa mensual **1,5 %**, una factura emitida el día anterior al inicio, banco con ID 1 y moneda USD. Catálogos y cargos controlados por los fixtures de pruebas. Cada fila dio el mismo resultado en simulación y propuesta, tanto al calcular como al crear.

| Inicio en Lima | Vencimiento elegido en Lima | Días esperados/obtenidos | Descuento USD | IGV USD | Adelanto USD |
|---|---|---:|---:|---:|---:|
| 01/10/2026 | 30/10/2026 | 29 / 29 | 788,24 | 100,61 | 52.927,00 |
| 20/12/2026 | 01/01/2027 | 12 / 12 | 324,79 | 100,61 | 53.390,45 |
| 01/02/2027 | 01/03/2027 | 28 / 28 | 760,87 | 100,61 | 52.954,37 |
| 01/02/2028 | 01/03/2028 | 29 / 29 | 788,24 | 100,61 | 52.927,00 |
| 28/02/2028 | 29/02/2028 | 1 / 1 | 26,99 | 100,61 | 53.688,25 |
| Viernes 06/11/2026 | Lunes 09/11/2026 | 3 / 3 | 81,02 | 100,61 | 53.634,22 |

Los ejemplos PDF usan importes fijos para verificar presentación, no para demostrar una fórmula financiera nueva. La equivalencia de fórmulas se valida en los 480 casos de servicios.

## Límites horarios

Con inicio 01/10/2026 en Lima:

| Vencimiento UTC propio de simulación | Día mostrado en Perú | Días de cálculo | Pantallas y PDF |
|---|---|---:|---|
| 30/10/2026 00:00 | 29/10/2026 | 28 | Coinciden |
| 30/10/2026 04:59:59 | 29/10/2026 | 28 | Coinciden |
| 30/10/2026 05:00 | 30/10/2026 | 29 | Coinciden |
| 30/10/2026 23:59:59 | 30/10/2026 | 29 | Coinciden |

La primera fila no se aplica al vencimiento original de factura, que sigue siendo civil. El formulario que selecciona 30/10 en Lima envía `2026-10-30T05:00:00.000Z`.

## Regresión y límites de validación

Se volvió a ejecutar el recorrido automatizado factura → operación → propuesta publicada → propuesta aceptada → inicio de operación → liquidación. Sus 14 escenarios conservan el origen civil, el instante de la propuesta aceptada y los saldos para pagos anticipados, puntuales y tardíos. La regresión previa de mora conserva la expectativa de diez días.

La auditoría amplia anterior tiene siete discrepancias documentadas fuera del alcance (cronologías negativas, entradas negativas y combinaciones controladas de IGV). No se modificaron ni debilitaron sus expectativas. El resultado de 713 pruebas específicas no certifica la suite global.

No se modificaron registros históricos ni el esquema. La consulta de lectura previa identificó nueve simulaciones de desarrollo con vencimiento a `05:00 UTC`; esta implementación mantiene el día y los resultados financieros para esa representación. No se volvió a consultar la base en esta ejecución ni se verificó producción. Un histórico que codificara una fecha civil dentro de un timestamp propio requiere revisar su origen antes de migrarlo.

## Evidencia y reproducción

- [Pruebas de servicios y controladores](../tests/unit/services/admin/factoringsimulacion.dates.test.ts).
- [Pruebas del generador PDF](../tests/unit/utils/document/PDFgenerator.dates.test.ts).
- Frontend: `src/pages/admin/servicio/factoring/factoringsimulacion/Factoringsimulacion.dates.test.js`.
- [480 resultados con fechas e importes](../temporal/simulacion-fechas/resultados.json).
- [Resultado Jest backend](../temporal/simulacion-fechas/backend-jest.json) y [registro](../temporal/simulacion-fechas/backend.log).
- [Resultado Jest frontend](../temporal/simulacion-fechas/frontend-jest.json), [regresión UTC](../temporal/simulacion-fechas/frontend-regresion.log) y [simulación Lima](../temporal/simulacion-fechas/react.log).
- [40 verificaciones de texto PDF](../temporal/simulacion-fechas/pdf-texto-resultados.json).
- [Compilación frontend](../temporal/simulacion-fechas/frontend-build.log).

Desde backend:

```powershell
$env:SIMULATION_DATES_OUTPUT_DIR = "$PWD/temporal/simulacion-fechas"
npm test -- --runInBand --verbose=false tests/unit/utils/dateUtils.test.ts tests/unit/utils/document/PDFgenerator.dates.test.ts tests/unit/domain/factoring tests/unit/services/factoring.Service.test.ts tests/unit/services/admin/factoringliquidacion.Service.test.ts tests/unit/services/admin/factoringpropuesta.Service.test.ts tests/unit/services/admin/factoringsimulacion.dates.test.ts tests/unit/services/factoring.dateTrace.test.ts
npm run build
```

Desde frontend:

```powershell
$env:CI = 'true'
$env:TZ = 'UTC'
node node_modules/react-scripts/scripts/test.js --watchAll=false --runInBand --runTestsByPath src/pages/admin/servicio/factoring/factoringsimulacion/Factoringsimulacion.dates.test.js src/utils/factoringDates.test.js src/pages/admin/servicio/factoring/factoring/FactoringCommon/FactoringliquidacionTable/FactoringliquidacionNuevo.test.js src/pages/admin/servicio/factoring/factoring/FactoringCommon/FactoringpropuestaTable/FactoringpropuestaNuevo.test.js
$env:TZ = 'America/Lima'
node node_modules/react-scripts/scripts/test.js --watchAll=false --runInBand --runTestsByPath src/pages/admin/servicio/factoring/factoringsimulacion/Factoringsimulacion.dates.test.js
npx eslint src/pages/admin/servicio/factoring/factoringsimulacion/Factoringsimulacion.dates.test.js
npm run build
```

Se invoca React Scripts directamente porque el script `npm test` depende de un `.env.test` que no existe en este checkout. Los PDF de prueba y los registros bajo `temporal` son evidencia local regenerable.
