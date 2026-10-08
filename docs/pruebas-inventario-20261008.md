# Inventario de pruebas — 2026-10-08

Inventario del árbol local de backend y frontend. Se cuentan casos parametrizados expandidos, no aserciones. Clasificación por propósito principal, sin sumar dos veces los casos que además verifican seguridad, contratos o regresiones.

| Tipo principal | Backend: casos / archivos | Frontend: casos / archivos | Total casos |
|---|---:|---:|---:|
| Unitarias de utilidades, calculadores y servicios aislados | 888 / 26 | 90 / 5 | 978 |
| Integración | 602 / 19 | 195 / 9 | 797 |
| Componentes de interfaz | 0 / 0 | 2392 / 26 | 2392 |
| Auditoría parametrizada financiera y de fechas | 2262 / 1 | 0 / 0 | 2262 |
| Runtime del backend compilado | 2 / 1 | 0 / 0 | 2 |
| Ejemplos básicos de Jest | 2 / 1 | 0 / 0 | 2 |
| E2E completos con navegador, frontend y backend | 0 / 0 | 0 / 0 | 0 |
| Contrato como suite independiente entre consumidor y proveedor | 0 / 0 | 0 / 0 | 0 |
| **Total de casos implementados seleccionados por sus ejecutores** | **3756 / 48** | **2677 / 40** | **6433** |

## Alcance de la clasificación

Backend: integración suma 108 casos HTTP con infraestructura simulada (20 Jest y 88 Vitest) y 494 con MariaDB real. Los 10 casos de connectedFlow.test.ts recorren el negocio mediante servicios y persistencia; se clasifican como integración, sin navegador. Dos casos adicionales de runtime prueban el proceso compilado y su conexión a MariaDB.

Frontend: integración comprende createDetailCacheManager, useMasterDetailSync, factoring.sync de financiero y empresario, JWTContext.accesses, upload-lifecycle, FacturaForm, FactoringNuevoWizard y factoringListasIntegradas. Verifican colaboración de módulos reales con transporte externo simulado. Componentes comprende los otros casos de UI, incluidos formularios/tablas/modal y configuración de rutas; puede haber colaboración interna, pero el objetivo principal es comportamiento del componente. Es una clasificación técnica para este inventario, no etiquetas declaradas uniformemente por el proyecto.

Contrato: existen aserciones de payload, IDs, respuestas HTTP y códigos de error dentro de integración/componentes/unitarias. No se encontraron suites independientes de contrato consumidor-proveedor; cero en esa fila no significa ausencia de comprobaciones del contrato de API.

## Escritos fuera del total ejecutable

- Backend: 2 pruebas HTTP en tests/e2e/index.test.ts, excluidas expresamente por jest.config.js.
- Backend: 8 criterios it.todo en un archivo; no tienen implementación.
- Backend: 6 scripts manuales para email, Telegram, ApisPeru y Decolecta. Se cuentan scripts, no casos automatizados.
- Incluyendo las dos pruebas HTTP excluidas: 3758 casos implementados backend y 6435 entre ambos proyectos. Incluyendo también los ocho todo: 6443 entradas declaradas.
- Backend contiene 50 archivos .test.ts: 48 seleccionados, uno excluido y uno de pendientes. Frontend contiene 40 archivos de prueba.

## Evidencia y estado

Jest backend ejecutado durante este inventario: 15 suites, 2914 casos, 2907 aprobados y 7 fallidos en factoringliquidacion.audit.test.ts. El inventario incluye fallidos. Resultado: ../../temporal/testing-inventory-jest.json.

Vitest rápido: recopilación de casos mediante vitest list, 346 activos en 17 archivos; ocho todo corroborados directamente en el código. Resultado: ../../temporal/testing-inventory-vitest.json. No se ejecutó esta suite para afirmar estado de aprobación.

MariaDB: recuento estático por AST, expandiendo it.each y bucles que registran casos, 496 casos en 16 archivos. Coincide con tests/README.md; no se inició una base de datos ni se ejecutó esa suite en este inventario.

Frontend: evidencia completa docs/pruebas/evidencias/LISTAS_INTEGRADAS_20261008.resultado.json, finalizada el 2026-10-08 a las 13:03 America/Lima: 40 suites y 2677 aprobados. Se corroboró SHA-256 de los 40 archivos actuales de pruebas contra esa evidencia, sin diferencias. No se revalidó todo el código de producción por huellas. La repetición iniciada para el inventario se detuvo al encontrar la evidencia completa y su duración de 1627,718 segundos. Resumen por suite: ../../temporal/testing-inventory-frontend.json.

## Lectura de las cifras

Los casos de auditoría backend son el 60,2 % de su total. Las suites frontend modals-next-30, modals-30, final-modals y detail-modals-batch suman 1807 casos, el 67,5 % de su total. El volumen depende fuertemente de matrices y repeticiones por componente; no representa ese número de flujos de negocio diferentes ni un porcentaje de cobertura.

Seguridad/permisos, rollback, concurrencia, PDF, fechas, regresión y caracterización de deuda técnica son áreas cubiertas transversalmente. No se suman como categorías adicionales. No se encontraron suites dedicadas de carga/rendimiento, accesibilidad con auditor automático, regresión visual por capturas o navegador E2E.
