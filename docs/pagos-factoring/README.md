# SQL y manifiesto de pagos de Factoring

Fecha: 16/10/2026. **DDL aplicado y verificado en desarrollo, catálogo configurado con actor 105 y Prisma sincronizado.** Backend y frontend implementados; consultar el [informe de implementación y validación](implementacion.md). No se aplicó en producción.

- [SQL propuesto](esquema-propuesto.sql).
- [Manifiesto del ejecutor existente](../../scripts/database/plans/20261016-factoring-pagos.json).
- [Modelo y regla confirmada](../modelo-pagos-factoring-20261016.md).
- [Revisión de transición de desarrollo](../revision-transicion-pagos-factoring-20261016.md).

## Alcance concreto

Se adaptará `factoring_pago` como maestro conservando PK, UUID, código y operación. Se retirarán cinco columnas de abono: `_idempresacuentabancaria`, `_idfactorcuentabancaria`, `numero_operacion`, `fecha_pago` y `monto_pagado`, junto con sus dos FKs bancarias y tres índices heredados de nombres inconsistentes. La FK a operación se recreará con RESTRICT explícito. Se añadirán estado funcional, versión, unicidad por operación y comentarios; se quitarán los DEFAULT 1 de los actores.

Se crearán `factoring_pago_estado`, `factoring_pago_detalle` y `factoring_pago_historial`. No se alteran operación, propuesta, banco ni movimiento bancario; no hay triggers, vistas, renombres, tablas de respaldo permanentes ni escrituras de pagos. No se edita Prisma ni el baseline de integración en esta preparación.

El detalle asigna una parte positiva de una transacción a un maestro; su par es único aun tras anulación. La transacción puede repartirse entre maestros. No se almacenan acumulado, diferencia, referencia de propuesta ni datos bancarios redundantes. La referencia es `factoring → propuesta aceptada → monto_neto`; su diferencia es solo visual y no limita el estado manual.

## Ciclo de vida confirmado

El usuario eligió Charlie 5 el 16/10/2026 y definió la creación del maestro al marcar **Inicio de operación**, como hito de reconocimiento operativo del derecho de cobro. También confirmó la acción específica **Cambiar estado de pago**. Es una regla del producto confirmada por el usuario; esta entrega no implementa asientos ni acredita reconocimiento contable normativo.

1. Antes del inicio, no crear `factoring_pago` al registrar la operación ni ofrecer alta manual del maestro. La pantalla puede mostrar «Seguimiento disponible al iniciar la operación»; no representar la ausencia como pago cancelado ni como un maestro ya creado.
2. Al iniciar, crear maestro con operación, identidad, actor autenticado, auditoría, versión 1 y estado PENDIENTE, sin detalles. El total calculado es cero y la diferencia corresponde al monto neto de la propuesta aceptada. Usar la fecha de inicio ya registrada en la operación; no copiarla al maestro.
3. Crear el maestro en la misma transacción que el historial de estado y la actualización de la operación. Si no puede crearse, no confirmar el inicio. Bloquear la operación y aplicar unicidad por `_idfactoring`; un reintento o retorno al estado de inicio reutiliza el maestro sin reiniciar sus pagos, estado o identidad. Si el maestro existente está eliminado, no reactivarlo silenciosamente: resolver esa inconsistencia de forma explícita y auditada.
4. El usuario puede registrar, corregir o anular aplicaciones mediante el detalle, con permisos y auditoría. Cada cambio conserva el vínculo bancario obligatorio, comprueba la disponibilidad global y aumenta la versión del maestro en la misma transacción. Después se devuelve el maestro actualizado con total y diferencia recalculados, y se refrescan detalle, resumen y listado afectados.
5. El maestro es de consulta: no hay formulario de edición, alta/baja manual ni endpoint genérico que acepte identidad, operación, auditoría, versión nueva o importes agregados. Es el backend quien mantiene esos campos a través de acciones de negocio.
6. La excepción expresamente confirmada es «Cambiar estado de pago»: recibe el estado destino y la versión vigente, valida permisos, obtiene el actor de sesión y guarda estado, nueva versión e historial juntos. El usuario no necesita cambiar un detalle para cambiar el estado. La diferencia de importe no bloquea ni exige confirmación adicional; corregir un detalle no cambia ese estado automáticamente.
7. El acumulado y la diferencia son valores calculados de la respuesta de `factoring_pago`, sin nuevas columnas persistidas: `total = SUM(detalles activos)` y `diferencia = propuesta aceptada.monto_neto - total`. Esta interpretación conserva la alternativa Charlie elegida y evita dos fuentes de verdad. Calcular también tras altas, anulaciones y reactivaciones, no solo tras editar un monto.
8. Retroceder el estado de operación no borra ni reinicia el maestro o sus abonos. La habilitación de nuevas aplicaciones durante una suspensión o anulación de la operación deberá respetar su flujo y permisos; no autoriza borrar evidencia financiera. No se añade automatización de reversos contables en este diseño.

### Punto de integración identificado

En el código actual, `src/services/admin/factoringhistorialestado.Service.ts`, función `createFactoringhistorialestadoService`, reconoce Inicio de operación mediante `idfactoringestado === 36`: actualiza `fecha_operacion` y envía la notificación dentro de la transacción existente. La futura implementación debe asegurar el maestro dentro de esa transacción y antes de notificar, preservando el flujo y sus errores existentes. La asociación del catálogo con el hito se verificará antes de implementar; no generalizar el ID 36 a otros destinos sin cotejo.

La función tiene consumidores y pruebas existentes en `tests/vitest/unit/factoringestado.business.test.ts`; deberán ampliarse focalizadamente para cubrir creación única, reintentos, concurrencia, fallos y preservación de pagos. No se cambió este servicio ni se ejecutaron esas pruebas en la preparación documental.

### Operaciones iniciadas antes de activar el módulo

La tabla de pagos vacía no significa que no existan operaciones ya iniciadas. El nuevo evento de inicio no creará retroactivamente sus maestros. Antes de activar: inventariar operaciones con inicio acreditado sin maestro, definir su regularización y autorizar expresamente cualquier carga directa; crear solo maestros, nunca pagos deducidos de movimientos o estados históricos. No marcar CANCELADO ni PARCIAL por inferencia. La inicialización del estado y revisión del usuario de esas operaciones deberá quedar explícita en el plan de regularización.

Hasta resolverla, mostrar «Seguimiento pendiente de habilitación» para operaciones antiguas sin maestro, y no crear filas como efecto oculto de una consulta o edición del detalle. Este inventario y carga no están incluidos en el DDL propuesto.

## Guarda de vacío y concurrencia durante el cambio

El primer ALTER agrega `CK_fp_transicion_vacia CHECK (CHAR_LENGTH(`code`) < 0)` con copia y bloqueo exclusivo. La intención es rechazar una tabla que tenga cualquier fila y, una vez instalada la guarda, rechazar nuevas escrituras hasta el último ALTER. El último paso la elimina, después de completar el esquema. No se implementa un conteo seguido de un cambio desprotegido.

**Condición obligatoria:** comprobar `@@SESSION.check_constraint_checks = 1` en la conexión ejecutora y mantener CHECK habilitados en todas las conexiones escritoras. Detener escritores durante el mantenimiento, revisar conteo/FKs/metadatos frescos y conservar respaldo antes de aplicar. El ejecutor actual no comprueba esa variable ni congela otros procesos; por tanto esta preparación no acredita esas condiciones. Si no pueden garantizarse, no aplicar este manifiesto. La guarda no es una barrera frente a un administrador que deshabilite CHECK o altere la tabla.

MariaDB documenta que las restricciones rechazan filas cuya expresión es falsa y que pueden deshabilitarse mediante `check_constraint_checks`: [CONSTRAINT](https://mariadb.com/docs/server/reference/sql-statements/data-definition/constraint) y [CREATE TABLE](https://mariadb.com/docs/server/server-usage/tables/create-table). El comportamiento concreto de la guarda, tanto con filas preexistentes como con escritores concurrentes, debe comprobarse en MariaDB desechable antes de autorizar aplicación. La revisión local del analizador no valida esa semántica.

El SQL presupone los nombres de FKs e índices del schema/baseline revisados. Antes de aplicar cotejar SHOW CREATE TABLE de desarrollo; abortar si no coincide, si aparecen FKs entrantes o si hay abonos. No usar IGNORE, deshabilitar FKs/CHECK ni sustituir las guardas para forzar el cambio.

Si falla un paso, el DDL ya confirmado permanece. La guarda puede quedar instalada y la tabla cerrada a escrituras; no retirar esa restricción ni reejecutar el manifiesto completo automáticamente. Inspeccionar el paso y el esquema reales, conservar respaldo y preparar continuación o recuperación explícita dentro del alcance autorizado. Esta propuesta no incluye rollback destructivo ni DROP TABLE.

## Configuración inicial del catálogo

| ID interno propuesto | Código | Nombre | Alias | Color propuesto |
| --- | --- | --- | --- | --- |
| 1 | PENDIENTE | Pendiente de pago | Pendiente | warning |
| 2 | PARCIAL | Pago parcial | Parcial | info |
| 3 | CANCELADO | Cancelado totalmente | Cancelado | success |

La base generó los UUID. El usuario autorizó expresamente el DDL, la configuración del catálogo y prisma-sync, y después identificó al actor 105. Se verificó en solo lectura que estuviera activo; las tres filas quedaron verificadas por el runner con ese actor en creación y modificación. El servicio crea cada maestro resolviendo PENDIENTE por código; la FK no tiene un ID predeterminado.

El DDL no creó maestros ni asociaciones a movimientos. El usuario rechazó expresamente regularizar los maestros de diez operaciones activas anteriores al nuevo flujo; esa carga queda pendiente y no se ejecutará sin nueva autorización.

## Responsabilidades que siguen en el servicio

Comprobar actor y permisos, factor/moneda, signo positivo, movimiento vigente, disponibilidad total de cada transacción, pertenencia de detalle al maestro, control de versión, incrementos del maestro e historial atómico. Bloquear las filas de movimiento y maestro en orden estable antes de comprobar aplicaciones. La suma global no queda garantizada con un CHECK de fila.

Proteger también las correcciones y anulaciones bancarias con aplicaciones activas. El historial tiene validación JSON y FKs, pero su inmutabilidad requiere permisos y API de solo inserción. El catálogo y la vigencia del maestro se validan en servicio; las FKs por sí solas no validan estados lógicos.

La colección histórica `factoring_pagos` se conserva vacía en las consultas anteriores: no había filas antes de la adaptación ni un consumidor directo identificado. No se serializan maestros en esa propiedad, ni se inventa una cuenta empresarial de origen. El nuevo seguimiento se consulta exclusivamente por su endpoint del administrador, con fechas bancarias civiles y UUID públicos. No se cambiaron fórmulas, liquidaciones ni saldos contables.

## Revisión inicial e implementación posterior

La preparación inicial fue local, sin conexión ni aplicación. Después el usuario autorizó implementar backend/frontend, ejecutar pruebas y aplicar el DDL/configurar catálogo/sincronizar Prisma en desarrollo. La aplicación, evidencia y límites actuales se detallan en el informe enlazado al inicio.

El SQL final contiene tres CREATE, tres ALTER y una carga de tres estados, con comentarios de las 37 columnas nuevas. Se validó la guarda en MariaDB desechable antes de aplicar. El archivo [SQL aplicado](../registros/bbdd/20261016-pagos-aplicado.sql) conserva los bytes cuyos hashes figuran en el informe de aplicación; el encabezado del SQL de trabajo se actualizó después para indicar su estado, sin cambiar sentencias.

Para otros destinos se requiere revisión de metadatos, respaldo, exclusión de escritores y autorización específica. No usar el manifiesto para reejecutar el destino ya aplicado ni para regularizar operaciones anteriores. Las huellas de aplicación identifican la versión ejecutada, no autorizan acciones futuras.

La regularización rechazada y cualquier despliegue a producción continúan fuera del alcance ejecutado. La revisión visual utilizó datos sintéticos y no acredita una prueba E2E autenticada contra desarrollo.

## Preparación posterior de regularización

La opción Alfa 11 autorizó preparar la regularización, sin aplicarla. Después, el usuario solicitó [un solo SQL con validación, conteo, carga y verificación integrados](regularizacion.md), que sustituye la consulta previa separada. Esa preparación no revoca la negativa anterior a cargar maestros. El script no utiliza el runner de DDL ni requiere prisma-sync porque únicamente añade maestros faltantes y su historial, sin cambiar estructura. Sus guardas y rollback se comprueban en MariaDB desechable, sin consultar ni escribir desarrollo o producción.
