# Liquidaciones, transferencias y auditoría histórica — 2026-10-08

## Resultado y alcance

Se añaden **36 pruebas de negocio reales** en `tests/mariadb/settlement.test.ts`
y **cinco regresiones SQL del auditor** en `historicalAudit.test.ts`. Total:
**114 pruebas en seis archivos**, con MariaDB 11.4.10 desechable y Prisma real.
No se modificaron servicios productivos ni políticas financieras en esta etapa.

| Flujo | Verificación |
| --- | --- |
| Liquidación | PEN/USD; pagos anticipados, puntuales y con mora; garantía aceptada, descuento, IGV, saldo a favor/por cobrar; conciliación de detalles; simulación sin escrituras |
| Gastos | Comisión interbancaria y exoneración; cargos adicionales afectos e inafectos y cantidad/unidad |
| Validaciones | Operación, propuesta aceptada, fecha de inicio, estados y referencias de conceptos/tipos |
| Lectura y estados | Guardado/consulta por operación, fecha, actor, cambio de estado, eliminación lógica y reactivación |
| Rollback liquidación | Fallo SQL en cabecera, segundo detalle o actualización; no queda persistencia parcial |
| Transferencia al cedente | PEN/USD, importe Decimal, fecha, actor, cuentas, moneda, tipo/estado y constancia asociada; consulta por operación |
| Rollback transferencia | Error SQL en transferencia o vínculo de constancia revierte ambas escrituras; actualización fallida conserva datos anteriores |
| Auditor | Suma correcta sin falsos positivos; importes concatenados; vínculos incompletos; monedas incompatibles; cantidad declarada distinta de la vinculada |

Las fixtures contienen catálogos y datos sintéticos; no copian filas de desarrollo.
Se fijan IDs de moneda 1/2 y banco 1/2 porque las reglas actuales distinguen esos
IDs. Los fallos se provocan con triggers temporales, eliminados entre casos.
La limpieza respeta claves foráneas y el runner elimina su contenedor exclusivo.

## Auditoría histórica

```powershell
npm run audit:factoring:historical
```

Consulta la conexión de `.env.development` en READ ONLY y snapshot consistente.
La suma monetaria se calcula con DECIMAL en MariaDB. Incluye todos los estados y
facturas/vínculos eliminados lógicamente, sin cambiar datos. La fuente no puede
cambiarse mediante argumentos del comando. No consulta producción por separado.

Resultado local del 2026-10-08: **35 operaciones totales y cero con cantidad
declarada o vinculada mayor que uno**. Por tanto, no hubo históricos para evaluar
en ese alcance. El informe está en `coverage/audit/historical-factoring.json`,
ignorado por Git, con fecha y versión de la fuente (11.4.2-MariaDB), sin credenciales
ni datos de personas/empresas. Las regresiones del auditor se ejecutan únicamente
con datos sintéticos en la base desechable.

Una diferencia compara importes actuales y requiere revisar el origen: puede
haber modificaciones posteriores o asociaciones incompletas. No prueba por sí
sola que hubo concatenación. El resultado no certifica producción ni operaciones
de una sola factura. No se realizó reparación de información histórica.

## Validación reproducible

```powershell
npm run test:integration:typecheck
npm run test:integration
npm run test:integration -- tests/mariadb/settlement.test.ts
npm run test:integration -- tests/mariadb/historicalAudit.test.ts
```

La suite rápida conserva 344 casos aprobados y ocho criterios pendientes según
la ejecución previa; no se volvió a ejecutar en esta etapa porque sus servicios
y pruebas no cambiaron. Los reportes reales quedan en `coverage/mariadb/`.

## Pendientes recomendados

1. Ampliación posterior completada: 19 casos de cálculo/creación de propuestas,
   rollback y aislamiento, total 133. No existe recálculo de importes de una
   propuesta existente; ver [precisión y hallazgos](20261008_integracion_propuestas_calculo.md).
2. Evaluación posterior completada: 12 casos de repetición, concurrencia y rollback
   aislado, total 145. Ver [resultados](20261008_integracion_concurrencia_liquidaciones_transferencias.md).
   La definición comercial de idempotencia continúa pendiente; no se cambian reglas.
3. Recorrido HTTP/Multer con MariaDB y validación de payloads que combinan
   facturas/cuentas/contactos de empresas distintas.
4. Si se desea evaluar producción, ejecutar la auditoría sobre una copia histórica
   autorizada y representativa. No hay operaciones con varias facturas en
   la fuente de desarrollo actual.

La suite no verifica PDF, entrega de correo, transferencias bancarias, carga
Ubuntu ARM64 ni atomicidad entre mensajes externos y commit SQL. Crear factoring
sigue sin consumir/reservar líneas: se conserva la actualización administrativa.

Evidencia de ejecución completa: `last-run.json`, runId
`b945f803f058fa835f21bcaf`, estado `passed`, limpieza `removed`, 127 tablas,
JUnit con 114 casos sin fallos. Tipos del backend (`npx tsc --noEmit`) y de
integración aprobados. Ningún contenedor con la etiqueta del runner quedó activo.
