# DT-LIQ-03: IGV determinado por el concepto

El usuario aprobó la Opción Alfa 6 el 2026-10-09: usar `financiero_concepto.afecto_igv` para conceptos adicionales, igual que para los internos y el desglose. Se sustituyó la condición del tipo distinto de 4 en `getFinancialData`. Se conserva la tasa configurada, redondeo a dos decimales, dirección por `factor`, API y permisos. No hay migración ni recálculo de liquidaciones guardadas.

## Validación actual

- Vitest: `factoringliquidacion.business.test.ts` y `factoring.business.test.ts`, **192 aprobados**. La nueva matriz tiene 48 casos: simular/crear, tipos 2/4, afecto/inafecto, cargo/abono y tasas 0, 0.18 y 0.12345. Verifica monto, impuesto, total, agrupación y saldo. Tras ajustar el estrechamiento de tipos en la prueba, se repitieron sus 48 casos: aprobados, 80 omitidos por filtro; no se suman como casos nuevos.
- Jest: `factoringliquidacion.audit.test.ts`, filtro `cargo-inafecto-tipo2|cargo-afecto-tipo4|abono-inafecto-tipo2`: **3 aprobados**, 2259 omitidos. Se conservaron las expectativas originales de la auditoría.
- Tipos: backend (`tsc --noEmit`), Vitest e integración aprobados. La primera comprobación detectó una unión de tipos en el test nuevo; se corrigió sin alterar comportamiento ni aserciones.
- MariaDB: `npm run test:integration -- tests/mariadb/settlement.test.ts`, **49 aprobados**. Los ocho nuevos casos prueban tipos 2/4, afectación y dirección, simulación/guardado/lectura y persistencia del desglose y saldo. También cambian la bandera del catálogo y actualizan el estado de la liquidación: cabecera conserva saldo y detalle conserva todos sus datos.
- `git diff --check`: aprobado; advertencias informativas de conversión LF/CRLF del repositorio.

MariaDB desechable: `runId=4a980bbe68378b18d943a167`, imagen `mariadb:11.4.10`, inicio `2026-10-09T20:01:29.373Z`, fin `2026-10-09T20:02:27.503Z`, estado `passed`, limpieza `removed`, 127 tablas, hash `31b61aab8b125fbf00fea9e499b84c24d33324ed96e7ec85473c96b5aa24898f`.

## Límites

Los primeros intentos encontraron restricciones EPERM de Windows y Docker apagado. Las pruebas se ejecutaron con los permisos necesarios y Docker Desktop iniciado; no se alteraron configuraciones del sistema ni se consultaron bases compartidas. Vitest/Jest sustituyen infraestructura; MariaDB usa datos sintéticos y Prisma real. No se ejecutó la suite completa, frontend, navegador, E2E ni empaquetado de producción. El frontend ya etiqueta afectación por concepto y no requirió cambios.

DT-LIQ-03 queda cerrada para cálculos nuevos. Las liquidaciones históricas conservan sus importes; revisar o corregir registros antiguos sería una tarea separada.
