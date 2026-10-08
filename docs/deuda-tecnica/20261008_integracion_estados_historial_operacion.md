# Estados e historial de operación: integración MariaDB — 2026-10-08

`tests/mariadb/operationState.test.ts` añade **27 casos**. Servicios, DAOs,
Prisma, FK y transacciones son reales. No cambia código productivo, fórmulas,
permisos, estados disponibles ni una matriz de transiciones.

## Alcance comprobado

| Casos | Comprobación |
| --- | --- |
| 6 | PEN/USD × estados 29, 10 y 36: historial, estado actual, actor, comentario, dos adjuntos, lectura y payload de notificación |
| 1 | Estado sin acción especial conserva fecha de inicio y no notifica |
| 3 | Operación, estado o segundo adjunto inexistente: rechazo sin cambios |
| 4 | Fallo SQL en historial, actualización de operación, segundo vínculo o segunda actualización de inicio: rollback completo y conservación de historial previo |
| 3 | Fallo de notificación para 29/10/36: rollback SQL, historial previo y archivos intactos |
| 1 | Editar comentario/estado de historial y añadir adjunto sin modificar la operación |
| 3 | Historial, estado o adjunto ausente al editar: rechazo sin cambios |
| 1 | Fallo SQL al añadir adjunto revierte también la edición del historial |
| 1 | Baja y reactivación lógicas del historial conservan operación, fecha, adjuntos y lectura |
| 4 | Baja/reactivación: fallo SQL y registro inexistente conservan datos previos |

Los snapshots comparan filas completas de operación, historial, vínculos y
archivos antes/después de fallos. Los errores SQL se inducen con un trigger
temporal. El fallo del segundo vínculo ocurre después de guardar historial,
actualizar operación e insertar el primer vínculo. El fallo de inicio ocurre
en la segunda actualización del estado 36, después de las etapas previas.

Se crean archivos sintéticos en un directorio temporal verificado y se comparan
sus bytes. Estos servicios asocian registros; no se afirma que procesen PDFs
o guarden nuevos bytes. Los adjuntos se conservan también al revertir SQL.

La lectura se realiza mediante el servicio/DAO real, con usuario y adjuntos
incluidos. La consulta de historial incluye registros activos y eliminados.
Editar, activar o eliminar un historial no modifica el estado actual de la
operación ni la fecha de inicio: se comprueba el contrato existente.

## Fecha y notificaciones

El estado 36 fija `fecha_operacion` al instante de ejecución y lo persiste en
`Timestamp(0)`: precisión de segundos. Las pruebas usan un intervalo acotado por
el reloj real, teniendo en cuenta esa precisión, y comprueban la fecha recibida
por el proveedor después de releer SQL. No alteran esquema ni fechas históricas.

Para 29 se comprueban destinatario aceptante, copias configuradas y copia al
cedente. Para 10 se añade propuesta aceptada y cuenta del factor en banco 1,
con moneda de operación PEN/USD. El DAO de cuenta devuelve un **objeto**, no una
lista; esta integración verifica esa forma real. Para 36 se comprueban cedente,
propuesta aceptada y usuario de su persona. Solo se invoca el proveedor esperado.

Los proveedores de correo se sustituyen por spies. No se envían mensajes reales.
Si rechazan, se comprueba que SQL revierte. Esto no ofrece atomicidad entre un
envío externo ya realizado y un commit posterior; se mantiene el límite previo
de notificaciones dentro de la transacción. No se implementa cola/outbox.

## Entorno y límites

Se utiliza `businessSupport` con comprobación de identidad de la base desechable.
Solo se preparan catálogos, empresas, contactos, cuenta y propuesta sintéticos.
`seedSettlement` prepara directamente una propuesta aceptada: esta suite prueba
estados/historial, no el recorrido completo de creación y aprobación.

La limpieza compartida ahora elimina `archivo_factoring_historial_estado` antes
del historial, manteniendo FK activas. El trigger se elimina al terminar cada
caso y el directorio temporal en `finally`; el runner elimina su contenedor.
No se modifica la base de desarrollo ni el almacenamiento de la aplicación.

No se exige una matriz origen/destino no aprobada, deduplicación, concurrencia
de cambios de estado ni idempotencia de inicio. No cubre HTTP de estos endpoints,
entrega real de notificaciones, PDFs, cálculo de liquidación después de este
inicio ni todo el ciclo conectado del negocio.

## Repetir

```powershell
npm run test:integration:typecheck
npm run test:integration -- tests/mariadb/operationState.test.ts
npm run test:integration
```

La suite específica aprobó sus 27 casos. La primera ejecución tuvo cuatro
fallos de expectativas: cuenta esperada como lista y fecha esperada con
milisegundos; se contrastaron DAO/esquema y se corrigieron las pruebas. No fue
una corrección de servicios. La suite rápida no se modificó en esta etapa.

La integración completa aprobó **255 casos en diez archivos, cero fallos**.
Comprobación de tipos aprobada. RunId `2074ad9dd6acb4af7d66e7d0`,
MariaDB 11.4.10, estado `passed`, limpieza `removed`. Una consulta independiente
de Docker confirmó que no quedaron contenedores del runner. `git diff --check`
no detectó errores de whitespace.

Siguiente bloque recomendado: HTTP administrativo/financiero de propuestas,
liquidaciones y transferencias con MariaDB real. Ver
[plan de ampliación](../../tests/mariadb/PLAN_AMPLIACION.md).
La [deuda de archivos](20261008_DT_ciclo_vida_archivos.md) mantiene su estado,
sin corrección autorizada ni programada.
