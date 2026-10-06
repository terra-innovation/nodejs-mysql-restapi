# Unificación de fechas de factoring: resultado de implementación

**Fecha:** 6 de octubre de 2026. **Configuración acordada:** base de datos y backend UTC; navegador Lima; días calendario de Perú.

## Resultado

Propuesta, liquidación y presentación interpretan los instantes en `America/Lima` antes de obtener su día calendario. **La fecha de factura es una fecha civil y conserva su día al precargar una propuesta**, aunque la operación la haya copiado en un campo timestamp. El caso previo Expected 10 / Received 9 devuelve **10 días**, manteniendo intacta su expectativa.

La validación manual detectó una regresión de precarga: `2026-10-30T00:00:00Z`, procedente de factura, aparecía como 29/10 al convertirlo a Lima. Se corrigió en administrador y financiero, separando el origen de factura del instante de una propuesta existente. Véase el [informe de trazabilidad y pruebas de regresión](trazabilidad-fechas-factoring-2026-10-06.md).

No se cambiaron la zona del proceso, la configuración de base de datos, el esquema ni los instantes existentes. No se realizaron migraciones ni actualizaciones de registros históricos. Tampoco se modificaron tasas, redondeos, importes aceptados, IGV ni reglas de gasto interbancario.

## Implementación

- `calculateCalendarDaysInLima`, disponible en `src/utils/dateUtils.ts`, centraliza el conteo de días. El cálculo de plazo y antigüedad, y la clasificación de mora, usan este criterio.
- La simulación y creación de propuestas convierten el vencimiento con `toLimaDateTime`, conservando el instante del DTO que se envía a persistencia.
- La fecha de emisión conserva el tratamiento existente de fecha sin hora. No se cambiaron `toLimaDate` ni `parseDateUtcMidnight` de forma global.
- El frontend incorpora `toDateInputValueLima` y `toIsoUtcFromLima` para instantes de propuesta y liquidación. La precarga y la etiqueta de fecha de factura conservan `toDateInputValue` y `formatDateUTC`, respectivamente. Una propuesta existente tiene prioridad para el campo editable y se interpreta como instante en Lima. Se conservan componentes y diseño.
- Los PDF de simulación, propuesta y liquidación presentan vencimiento y pago efectivo con el formato local existente de Lima.

## Fechas actuales e históricas

| Origen | Instante UTC | Día interpretado en Perú |
|---|---|---|
| Día 01/10 elegido en navegador Lima | 2026-10-01T05:00:00Z | 01/10/2026 |
| Instante histórico a medianoche UTC | 2026-10-01T00:00:00Z | 30/09/2026 |
| Campo DATE que conserva 01/10 | 2026-10-01T00:00:00Z como representación de fecha | 01/10/2026, mediante su helper específico |

Los timestamps de propuestas y liquidaciones se tratan como instantes, conforme a la alternativa aprobada. La precarga desde la operación conserva la fecha civil porque el recorrido del wizard identifica su origen en factura; no se infiere ese origen por la hora almacenada. Otros timestamps históricos que codifiquen fechas civiles requieren una revisión de datos separada. No se realizan migraciones.

## Verificación

| Comprobación | Resultado |
|---|---|
| Pruebas específicas del backend, seis archivos | **93 aprobadas**: 79 de regresión y 14 del recorrido de servicios |
| Pruebas del frontend | **54 aprobadas**: 25 de helpers, 17 del formulario de liquidación y 12 de ambos formularios de propuesta |
| Prueba previa de mora | **10 días**, expectativa original conservada |
| Calendario y sensibilidad financiera | **1.920 escenarios sin discrepancias principales** |
| Zonas y horas del servidor | **320 escenarios sin discrepancias** |
| Inicio frente a propuesta, datos históricos y guardado sustituido | **10 escenarios sin discrepancias principales** |
| Conversores reales del frontend en cinco zonas | **20 escenarios sin discrepancias** |
| Total de escenarios dentro del alcance | **2.270 sin discrepancias principales** |
| Compilación backend | Correcta |
| Compilación frontend | Correcta, con advertencias de lint y tamaño de bundle |

Las pruebas incluyen pago anticipado, puntual y tardío; límites de medianoche peruana; cambios de mes y año; fines de semana; febrero bisiesto; instantes a medianoche UTC; vencimientos como texto y como objetos Date; separación de fechas sin hora; conservación del instante enviado a persistencia. Las pruebas del formulario comparan la fecha mostrada, el valor inicial del campo, la solicitud de simulación y la solicitud de creación.

La auditoría completa conserva **2.281 escenarios** y registra **2.274 sin discrepancias principales y siete discrepantes**. En Jest son **2.255 pruebas aprobadas y siete fallidas**, porque los veinte escenarios del frontend se agrupan en una prueba.

Los siete fallos restantes corresponden a dos pagos anteriores al inicio, dos entradas con importe o cantidad negativos y tres combinaciones controladas de IGV. Sus expectativas no se omitieron ni se debilitaron. Por ello, la auditoría completa sigue terminando con error y la ejecución global de Jest que la incluya tampoco quedará completamente verde.

Las observaciones anteriores sobre redondeos, cobertura a tasa cero, gasto interbancario y distinto inicio de propuesta permanecen. Un resultado sin discrepancia principal no certifica esas políticas contractuales.

## Evidencia y reproducción

- [Pruebas de calendario](../tests/unit/utils/dateUtils.test.ts).
- [Registro backend después de corregir la precarga](../temporal/trazabilidad-factoring-regresion.log) y [recorrido con comprobación de saldos](../temporal/trazabilidad-factoring-backend.log).
- [Registro de pruebas React](../temporal/trazabilidad-propuesta-react.log).
- [Datos completos de auditoría después del cambio](../temporal/liquidacion-audit-fechas-lima/resultados.json) y [resultado Jest](../temporal/fechas-lima-audit-jest.json).
- [Compilación backend](../temporal/trazabilidad-factoring-build.log) y [compilación frontend](../temporal/trazabilidad-propuesta-react-build.log).

Desde el backend:

```powershell
npm test -- --runInBand tests/unit/utils/dateUtils.test.ts tests/unit/domain/factoring tests/unit/services/factoring.Service.test.ts tests/unit/services/admin/factoringliquidacion.Service.test.ts tests/unit/services/admin/factoringpropuesta.Service.test.ts tests/unit/services/factoring.dateTrace.test.ts
npm test -- --runInBand tests/unit/services/admin/factoringliquidacion.audit.test.ts
npm run build
```

Desde el frontend:

```powershell
$env:CI = 'true'
node node_modules/react-scripts/scripts/test.js --watchAll=false --runInBand src/utils/factoringDates.test.js src/pages/admin/servicio/factoring/factoring/FactoringCommon/FactoringliquidacionTable/FactoringliquidacionNuevo.test.js src/pages/admin/servicio/factoring/factoring/FactoringCommon/FactoringpropuestaTable/FactoringpropuestaNuevo.test.js
npm run build
```

Las pruebas sustituyen infraestructura y catálogos. No se validó con una base real, despliegue o sesión de navegador manual. Los archivos de `temporal` son evidencia local regenerable.

## Ampliación a simulación

Simulación adopta el mismo criterio de vencimientos UTC interpretados en Lima, conserva la emisión civil y alinea formulario, servicios, pantallas y PDF. La ampliación y su regresión conjunta aprobaron 604 pruebas backend y 109 frontend. Véanse el [estándar de fechas](estandar-fechas-factoring.md) y el [informe de simulación](alineacion-simulacion-fechas-2026-10-06.md) para cobertura, importes y límites de validación.
