# Creación del modelo de transacciones bancarias en desarrollo

Fecha: 15/10/2026, hora de Lima. Estado: creación y verificación completas; Prisma sincronizado y tipos del backend aprobados. Los nombres de registros usan UTC y por ello comienzan con 2026-10-16.

Este informe corresponde a la etapa de creación de estructura. La implementación posterior autorizada de backend/frontend está documentada en [implementación](implementacion.md) y [operación](operacion.md).

## Autorización y alcance

El usuario confirmó el ajuste de retirar `_idmoneda` y declaró: «Confirmo los ajustes y te autorizo a que crees el modelo en la base de datos de desarrollo». La autorización corresponde a las seis tablas del manifiesto `20261015-factor-transaccion-bancaria` y sus relaciones, sin ALTER, semillas ni carga de datos.

Referencia de autorización: `usuario-20261015-crear-modelo-transacciones-desarrollo-sin-idmoneda`.

Se utiliza el destino leído exclusivamente de `.env.development`, mediante `scripts/database/maintain.mjs`. El origen MySQL remoto no se conecta ni modifica. No se escriben secretos ni se modifica el archivo de entorno.

## Procedimiento

1. Retirar columna, índice y FK redundantes de moneda del SQL y diccionario.
2. Verificar Node portable 24.21.0, manifiesto, comentarios y metadatos de desarrollo mediante lectura.
3. Revisar sin cambios con `npm.cmd run db:ddl -- --plan scripts/database/plans/20261015-factor-transaccion-bancaria.json`.
4. Aplicar el mismo manifiesto con las huellas obtenidas, referencia de autorización y `--prisma-sync`.
5. Revisar los informes sanitizados, restricciones y diferencias del esquema; comprobar tipos del backend.

## Resultado

Se crearon las seis tablas del manifiesto, con 138 columnas comentadas, 15 FKs y 41 CHECK explícitos. Se retiraron columna, índice y FK de moneda del movimiento; la moneda se deriva de la cuenta bancaria. Monto positivo y signo ±1 permanecen restringidos por CHECK.

El runner verificó comentarios exactos, relaciones e índices y acreditó que las estructuras existentes no cambiaron durante su aplicación. Una verificación adicional de metadatos cotejó tipos, nulabilidad, predeterminados, CHECK, engine, collation y formato de fila. No se insertaron filas de prueba en desarrollo ni se cargaron movimientos o conexiones.

Evidencia:

- [Revisión previa sin cambios](../registros/bbdd/2026-10-16T02-34-04-933Z-ddl.json).
- [Aplicación y verificación DDL](../registros/bbdd/2026-10-16T02-34-20-432Z-ddl.json).
- [Precondiciones del destino](preflight-desarrollo.json).
- [Verificación adicional de tipos y CHECK](verificacion-desarrollo.json).
- [Sincronización Prisma definitiva](prisma-sync-final.json) y [log sanitizado](prisma-sync-final.log).
- [Revisión de modelos Prisma](revision-prisma-final.json).
- [Tipos antes](typecheck-antes.log) y [tipos finales](typecheck-final.log): ambos aprobados con Node portable 24.21.0.

## Incidencia de destino y recuperación

La primera introspección encontró que faltaban las cuatro tablas SBS presentes en el modelo local. Las huellas de destino de la aplicación SBS del 14/10 y del `.env.development` actual son distintas. Esto acredita un destino diferente, sin establecer quién lo cambió ni qué componente de host/puerto/base difiere. La ausencia ya aparece en el inventario previo al DDL bancario: esta ejecución no eliminó tablas SBS.

La primera regeneración finalizó técnicamente, pero la comprobación posterior falló por tipos SBS ausentes. Se conservó la [introspección de ese momento](schema-introspectado-desarrollo.prisma), se restauró el schema previo desde el backup automático y se regeneró su cliente; [la comprobación de recuperación](typecheck-recuperacion.log) pasó. Se conserva el [log del fallo intermedio](typecheck-despues.log) para no confundirlo con el resultado final.

El usuario comunicó después que había agregado las cuatro tablas SBS a desarrollo. Se [confirmó su presencia en el mismo destino](revision-sbs-desarrollo.json) y que las tablas bancarias conservaban sus huellas. Se repitió únicamente `prisma-sync`, pasando explícitamente la URL leída de `.env.development`, sin repetir CREATE ni ejecutar DDL adicional. El resultado final conserva todos los modelos previos y agrega exclusivamente seis modelos bancarios. La comprobación final de tipos pasó.

La introspección también refleja dos diferencias previas de estructura frente al schema original en `factoring_estado` e `inversionista_deposito`; no fueron creadas por este DDL y se documentan en [la nota de seguimiento](../deuda-tecnica/20261015_DT_divergencias_prisma_desarrollo.md). No se editó manualmente el schema final para simular otro destino.

## Límites y siguiente fase

Solo se creó estructura. No se implementaron API, interfaz, GCM operativo, importador, cron ni carga histórica; tampoco se conectó al MySQL remoto. No se ejecutaron pruebas funcionales o de integración con datos sintéticos. Los CHECK se cotejaron mediante metadatos y configuración, sin probar inserciones rechazadas en desarrollo.

MariaDB introspecta las columnas JSON como `String @db.LongText` en Prisma; las validaciones JSON_VALID y los CHECK permanecen en la base. La futura capa de acceso debe serializar y validar los datos explícitamente, sin editar el cliente generado.

La siguiente fase propuesta es implementar el backend del módulo con gestión segura de conexión y CRUD auditado. La carga histórica necesita autorización específica independiente de esta creación.
