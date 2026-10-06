# Corrección de precarga y trazabilidad de fechas de factoring

Fecha de verificación: 6 de octubre de 2026.

## Resultado ejecutivo

Se corrigió la regresión que mostraba 29/10/2026 al crear una propuesta a partir de una factura con vencimiento 30/10/2026. Los formularios de administrador y financiero conservan el día civil de factura, convierten el día elegido en Lima al instante UTC enviado al backend y recuperan los instantes de propuestas existentes en Lima. Se mantuvieron la utilidad `calculateCalendarDaysInLima` en `dateUtils.ts` y los controles de requisitos faltantes.

Pasaron 93 pruebas específicas de backend y 54 de frontend. Entre ellas, 14 recorren los servicios reales desde una factura de prueba hasta el guardado de liquidación, incluyendo publicación, aceptación e inicio de operación; 12 ejecutan los formularios reales de nueva propuesta. Compilan backend y frontend; este último conserva advertencias de lint y tamaño de bundle. El lint del archivo nuevo de pruebas de propuesta pasó.

La validación fue automatizada con persistencia y notificaciones sustituidas. No hubo escrituras en una base real ni despliegues. La auditoría extensa anterior registró siete discrepancias fuera de este alcance; estos resultados específicos no certifican toda la suite del proyecto.

## Causa y corrección

La configuración UTC del motor no convierte un campo SQL DATE en un instante. La factura se serializa como `2026-10-30T00:00:00.000Z`; el wizard copia su `fecha_pago_mayor_estimado` a `fecha_pago_estimado` de la operación. El servicio de creación conserva esa representación en un timestamp. En este recorrido el dato sigue representando el día civil de factura.

La conversión general a Lima transformaba esa representación en 29/10 a las 19:00 y el formulario precargaba 29/10. Se corrigió la precarga usando el helper civil existente `toDateInputValue` y la etiqueta usando `formatDateUTC`. El origen del campo determina el tratamiento, no una regla que examine si su hora es medianoche.

Si se recibe una propuesta existente, su vencimiento tiene prioridad para el campo editable y se interpreta con `toDateInputValueLima`. Simulación y creación envían `toIsoUtcFromLima`. Las pantallas y fórmulas de liquidación continúan interpretando los instantes de la propuesta aceptada en Lima.

| Paso | Valor comprobado para la factura del 30/10/2026 |
|---|---|
| Factura DATE recibida | `2026-10-30T00:00:00.000Z`, representación del día 30 |
| Operación creada | Misma representación; relación con la factura conservada |
| Etiqueta y campo de nueva propuesta | `30/oct/2026` y `2026-10-30` |
| Solicitudes de simulación y creación | `2026-10-30T05:00:00.000Z`, medianoche de Lima |
| Propuesta publicada y aceptada | Mismo vencimiento; estado de propuesta 6 y vínculo de aceptación en la operación |
| Inicio de operación | Se ejecuta el servicio real del estado 36, que registra el instante de inicio |
| Pago puntual y liquidación | Pago `2026-10-30T05:00:00.000Z`; 29 días financiados y 0 días de mora |

La corrección conserva la presentación y las fórmulas financieras existentes. No modifica esquema, zona del proceso, configuración de base ni registros históricos. Los datos ya guardados con un día incorrecto requieren revisión aparte; la corrección del formulario no los reescribe.

## Escenarios y resultados

Los tres vencimientos de factura probados fueron **30/10/2026, 31/12/2026 y 29/02/2028**. Cada recorrido empieza 29 días antes, con emisión de factura un día antes del inicio. Se prueban pagos cinco días antes, el mismo día, un día después y diez días después: doce recorridos. Otros dos conservan factura 30/10 pero pactan 02/11, pagando el 02/11 y el 03/11.

Datos financieros de prueba: USD 57.200,50 brutos, retención USD 1.716,01 y USD 55.484,49 netos, financiamiento 98%, tasa mensual 1,5%, comisión sin descuento, IGV 18%, banco del cedente igual al banco del factor y sin gasto interbancario. Se ejecutan las fórmulas reales V4/V3; las expectativas de días usan una diferencia civil independiente y los importes esperados usan una fórmula de interés separada. Garantía USD 1.109,69; descuento de propuesta a 29 días USD 788,24.

| Factura / plazo pactado | Pago | Días financiados | Mora | Reintegro por anticipación USD | Cargo por retraso USD | Saldo a favor USD |
|---|---|---:|---:|---:|---:|---:|
| 30/10 / 30/10 | 25/10 | 24 | 0 | 136,72 | 0,00 | 1.246,41 |
| 30/10 / 30/10 | 30/10 | 29 | 0 | 0,00 | 0,00 | 1.109,69 |
| 30/10 / 30/10 | 31/10 | 30 | 1 | 0,00 | 27,38 | 1.082,31 |
| 30/10 / 30/10 | 09/11 | 39 | 10 | 0,00 | 274,45 | 835,24 |
| 30/10 / 02/11 | 02/11 | 32 | 0 | 0,00 | 0,00 | 1.109,69 |
| 30/10 / 02/11 | 03/11 | 33 | 1 | 0,00 | 27,42 | 1.082,27 |

Los cuatro escenarios de cada vencimiento de 31/12 y 29/02 dieron los mismos días e importes relativos que los primeros cuatro de la tabla. Se atraviesan el cambio de año y el 29 de febrero sin perder un día. En el vencimiento pactado 02/11, el descuento de la propuesta es USD 870,43: el pago puntual no genera mora aunque la factura venza tres días antes.

En cada recorrido se crea otra propuesta posterior, con vencimiento siete días más tarde y tasa 3%. La liquidación conserva la fecha y tasa de la aceptada, no las de esa otra propuesta. También se comprueba que, después de aceptar y antes de registrar el inicio de operación, el servicio rechace calcular la liquidación con el mensaje de requisito faltante.

Las doce pruebas de formulario abarcan ambos roles: precarga y guardado para las tres fechas; prioridad de una propuesta existente del 02/11; instante histórico `02/11T00:00Z` mostrado como 01/11 en Lima; y modificación manual de la fecha precargada de 30/10 a 02/11. Se comprueban el DOM, Formik y las solicitudes API; solo se sustituyen APIs y componentes periféricos.

## Evidencia y reproducción

- [Prueba del recorrido de servicios](../tests/unit/services/factoring.dateTrace.test.ts).
- [Valores e importes de los 14 recorridos](../temporal/factoring-date-trace/resultados.json).
- [Resultado de regresión backend: 93 aprobadas](../temporal/trazabilidad-factoring-regresion.log).
- [Recorrido con comprobación adicional de antigüedad y saldo: 14 aprobadas](../temporal/trazabilidad-factoring-backend.log).
- [Resultado React: 54 aprobadas](../temporal/trazabilidad-propuesta-react.log).
- [Compilación backend](../temporal/trazabilidad-factoring-build.log) y [frontend](../temporal/trazabilidad-propuesta-react-build.log).

Desde el backend, para regenerar la traza local:

```powershell
$env:FACTORING_TRACE_OUTPUT_DIR = 'temporal/factoring-date-trace'
npm test -- --runInBand tests/unit/services/factoring.dateTrace.test.ts
```

Desde el frontend:

```powershell
$env:CI = 'true'
$env:TZ = 'America/Lima'
node node_modules/react-scripts/scripts/test.js --watchAll=false --runInBand src/utils/factoringDates.test.js src/pages/admin/servicio/factoring/factoring/FactoringCommon/FactoringliquidacionTable/FactoringliquidacionNuevo.test.js src/pages/admin/servicio/factoring/factoring/FactoringCommon/FactoringpropuestaTable/FactoringpropuestaNuevo.test.js
```

La prueba del backend utiliza `scripts/analisis/fecha-liquidacion-frontend.cjs` para ejecutar los helpers reales de React. Su ruta predeterminada es `D:/10_Workspace_react/ft-app-frontend-mantis`; puede ajustarse con `LIQUIDACION_FRONTEND_ROOT`. La traza valida los contratos entre etapas mediante servicios y DAOs sustituidos; no valida el comportamiento del motor SQL, la red, la sesión autenticada ni una navegación manual completa.
