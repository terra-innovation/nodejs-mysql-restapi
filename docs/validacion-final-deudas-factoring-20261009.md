# Validación conjunta de DT-LIQ-01, DT-LIQ-02 y DT-LIQ-05

Fecha: 09/10/2026, America/Lima. Alcance: las tres correcciones acordadas, sin build ni suite completa. El usuario solicitó explícitamente ejecutar la validación conjunta, incluida la selección de frontend, como excepción a su guía de ejecución manual.

## Backend y persistencia

- Vitest: cuatro archivos focalizados, 183 casos aprobados. Calculadores V2/V3, propuestas, liquidaciones, rutas HTTP y validaciones reales; infraestructura simulada.
- Jest: tres archivos, 22 casos seleccionados aprobados; 2.749 omitidos por filtro. Se conservaron las expectativas de los pagos anteriores al inicio y entradas negativas de la auditoría. El filtro no valida las deudas restantes.
- Tipos de backend, Vitest e integración: aprobados.
- MariaDB 11.4.10: `proposal.test.ts` y `settlement.test.ts`, 64 casos aprobados. Se verificaron rechazo sin registros de liquidación/detalles, guardado/lectura de cobertura null en propuesta y simulación, y regresiones de importes/transacciones.
- Ejecución MariaDB aprobada: `runId=6d820a2eea7e8835aa88e945`, inicio `2026-10-09T19:28:22.209Z`, fin `2026-10-09T19:29:38.441Z`, estado `passed`, limpieza `removed`, esquema de 127 tablas, hash `31b61aab8b125fbf00fea9e499b84c24d33324ed96e7ec85473c96b5aa24898f`.

Docker estaba apagado y se inició la instalación existente. La primera integración falló porque los nuevos datos de simulación no se eliminaban antes de borrar catálogos referenciados. Se corrigió únicamente la limpieza de fixtures, manteniendo claves foráneas y aserciones. La misma selección se repitió y aprobó; ambos contenedores desechables fueron eliminados. No se consultaron bases compartidas ni se regeneró el esquema.

## Frontend

Selección: `factoringCoverage.test.js`, `factoringPropuestaLiquidacion.business.test.js`, `factoringEdicionEstados.business.test.js` y `factoringListasIntegradas.business.test.js`. Lint y formato de los archivos afectados aprobaron.

Resultado: primera pasada de cuatro archivos, 198 casos aprobados y dos timeouts de 15 segundos (uno existente y uno nuevo); salida 1. Las otras tres suites aprobaron. Se amplió el límite de la suite de formularios a 30 segundos, sin quitar/modificar aserciones. Reintento focalizado con `-t 'tasa 5, financiamiento 100, descuento 100|Cant. negativo bloquea'`: cuatro casos aprobados en ambos roles, 76 omitidos por filtro, salida 0. Los dos casos fallidos quedaron confirmados; los otros dos del reintento ya habían aprobado. En conjunto se verificaron los 200 casos seleccionados, sin afirmar que la primera ejecución completa haya salido verde ni sumar reintentos como escenarios nuevos.

## Cierre

- DT-LIQ-01: cerrada. Rechazo por día calendario de Lima, mismo día admitido, simulación/creación y ausencia de registros financieros verificados.
- DT-LIQ-02: cerrada en el alcance aprobado de impedir negativos. Se preservan ceros, valores predeterminados y dirección por factor; formulario, HTTP, servicio y ausencia de registros reales verificados. No se declaran implementados máximos/precisión: quedan en DT-LIQ-02-RANGO.
- DT-LIQ-05: cerrada. Null en V2/V3, API y guardado/lectura real de propuestas y simulaciones; texto elegido y días positivos/cero verificados en las pruebas seleccionadas.

## Límites y trazabilidad

La presentación se prueba con DOM/React y API simulada; no se ejecuta navegador completo ni E2E. Los datos de MariaDB son sintéticos. No se valida toda la aplicación ni todas las deudas de la auditoría.

El alcance aprobado de DT-LIQ-02 conserva ceros, valores predeterminados, factor y fórmulas. Los máximos y precisión quedan registrados por separado en [DT-LIQ-02-RANGO](deuda-tecnica/20261009_DT_limites_entrada_financiera.md), pendientes de regla de negocio.

Comandos reproducibles en [cobertura de tasa cero](correccion-cobertura-tasa-cero-factoring.md). Logs locales de esta ejecución: `temporal/validacion-deudas/` en cada repositorio. Estos logs son regenerables; este documento conserva el resultado fechado y los límites.
