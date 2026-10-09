# Validación conjunta final de liquidación — 09/10/2026

Estado: validación conjunta aprobada. Correcciones implementadas cerradas en el alcance autorizado; DT-LIQ-09 permanece diferida. Solicitud expresa del usuario de ejecutar validación conjunta, incluida la selección frontend como excepción a su guía manual. No se empaquetó ni desplegó producción.

## Evidencia actual de backend

- Vitest: cinco archivos, 322 pruebas aprobadas. Selección: liquidacionLimits, factoring.Calculator, factoringpropuesta.business, factoringliquidacion.business y HTTP factoring.business.
- Jest: tres archivos, 517 pruebas aprobadas: factoringsimulacion.dates, factoringliquidacion.Service y factoringpropuesta.Service. Se observó aviso de ts-jest por archivos JS y aviso de recursos asíncronos abiertos; el proceso terminó con salida 0. No se modificó configuración para ocultarlos.
- Tipos de backend, Vitest e integración: aprobados. Integración se repitió tras corregir la consulta de la prueba nueva y aprobó.
- MariaDB 11.4.10: proposal.test.ts y settlement.test.ts, misma selección repetida, 82 pruebas aprobadas. Incluye precisión de diez decimales guardada/leída, rechazo con columnas antiguas, residual de garantía, gasto sobre saldo completo, IGV, fechas, errores y rollback.
- Ejecución de integración: runId 8f0e5d15e4606d3f8e223b9f, inicio 2026-10-09T21:36:11.017Z, fin 2026-10-09T21:38:22.777Z, estado passed, limpieza removed. Snapshot original de 127 tablas, hash 31b61aab8b125fbf00fea9e499b84c24d33324ed96e7ec85473c96b5aa24898f, sin regenerarlo ni consultar bases compartidas.

La primera ejecución de MariaDB obtuvo 81 aprobadas y una fallida: la prueba nueva DT-LIQ-04 intentaba buscar un ID en la respuesta de creación, que devuelve la simulación. Se corrigió exclusivamente la consulta del test para localizar la propuesta nueva de su operación, conservando las aserciones financieras. La misma selección completa aprobó después y ambos contenedores fueron eliminados.

Las restricciones iniciales de permisos Windows impidieron arrancar runners y Docker dentro del sandbox; las ejecuciones autorizadas fuera de esas restricciones produjeron los resultados anteriores.

## Frontend

Cinco suites y 226 pruebas aprobadas, salida 0, duración 775,145 segundos. Selección: liquidacionInput.test.js, factoringCoverage.test.js, factoringPropuestaLiquidacion.business.test.js, factoringEdicionEstados.business.test.js y factoringListasIntegradas.business.test.js, mediante test:ci. Lint y formato de los cinco archivos nuevos/modificados de precisión aprobaron tras corregir únicamente dos saltos de línea de aserciones. No se modificaron expectativas ni snapshots.

## Límites

Selección proporcional al cambio; no suite completa ni navegador/E2E. Frontend y pruebas rápidas usan transporte/infraestructura simulados; MariaDB verifica persistencia real con datos sintéticos en contenedor desechable. Las decisiones DT-LIQ-07/08 conservan el código vigente. DT-LIQ-09 mantiene el comportamiento actual por decisión expresa y permanece como control normativo diferido; no se acredita cumplimiento normativo integral. DT-LIQ-01/02/02-RANGO/03/04/05/06 quedan cerradas para el alcance aprobado; DT-LIQ-07/08 cerradas por decisión de conservar las reglas vigentes; DT-LIQ-09 diferida por decisión expresa. El plan actual queda terminado, sin pendientes de validación de esta selección.

## Registros de ejecución

Logs locales regenerables: `coverage/liquidacion-final-vitest.log`, `coverage/liquidacion-final-jest.log`, `coverage/liquidacion-final-types.log`, `coverage/liquidacion-final-integration-types-reintento.log`, `coverage/liquidacion-final-mariadb-reintento.log` y `coverage/mariadb/last-run.json`. En frontend: `coverage/liquidacion-final.log`, `coverage/liquidacion-final-estilo.log` y `coverage/liquidacion-final-estilo-reintento.log`. No se suman intentos fallidos como nuevos escenarios aprobados.
