# Revisión y transición de pagos de Factoring

Fecha: 16/10/2026. Alcance autorizado: opción Alfa 2, revisión de pagos existentes y definición de transición. Revisión de desarrollo en solo lectura; sin DDL, escrituras de negocio ni modificación de código de aplicación.

## Resultado

La tabla `factoring_pago` de desarrollo está vacía y no tiene FKs entrantes. No hay abonos históricos que agrupar, conciliar o trasladar en este destino. Se puede preparar su adaptación al maestro único por operación sin un proceso de migración de abonos, condicionado a comprobar nuevamente que siga vacía antes de aplicar cualquier cambio.

La evidencia es [el informe agregado](registros/bbdd/revision-pagos-factoring-20261016.json), generado mediante [el revisor de solo lectura](../scripts/database/review-factoring-payments.mjs). Los conteos son una fotografía fechada, no un inventario permanente. Se observó existencia de movimientos bancarios, pero no se les atribuyó condición de pagos: no se crearon asociaciones ni se dedujeron cobros desde textos. La evaluación de coincidencias no examinó abonos porque no existen filas de pago.

El destino se obtuvo exclusivamente de `.env.development` mediante `readDevelopmentTarget`; se conserva su huella, sin host, usuario, contraseña ni filas de clientes. Se usó Node portable 24.21.0. Consultas dentro de transacción de solo lectura con snapshot consistente y cierre mediante ROLLBACK. El aislamiento bloqueó inicialmente la conexión con EACCES; el acceso autorizado fuera del aislamiento permitió completar la lectura. Se corrigió la serialización de conteos BigInt en la salida del revisor y se completó una ejecución posterior con código de salida 0.

## Consumidores y contratos

| Área | Evidencia actual | Implicación |
| --- | --- | --- |
| Consultas de operaciones | `src/daos/factoring.Dao.ts`: `getFactoringsByIdfactoringestado`, `getFactoringsByIdcedentes`, `getFactoringByFactoringidAndIdcontactocedente`, `getFactoringsCotizacionesByIdcontactocedente`, `getFactoringsByEstados`, `getFactoringByIdfactoring`, `getFactoringByFactoringid` incluyen `factoring_pagos: true`. | Cambiar la semántica de tabla sin adaptar las consultas puede devolver maestros donde antes se devolvían abonos. |
| Tipado backend | `src/types/Prisma.types.ts` incluye la relación `factoring_pagos`. | Ajustar después de introspección, con el nuevo tipo de maestro/detalle. |
| Listados HTTP | Servicios de administrador y financiero retornan la consulta `getFactoringsByEstados`; sus controladores envían ese resultado. Empresario usa `getFactoringsByIdcedentes` y filtra operaciones. | La relación forma parte del resultado observable; no asumir que es privada del DAO. |
| Procesos internos | Propuestas, liquidaciones, transferencias, facturas, estados y correos llaman consultas de detalle de operación. | Revisar tipos y consultas compartidas; no cambiar cálculos ni efectos de esos procesos al incorporar pagos. |
| Frontend | Búsqueda exacta de `factoring_pagos`, `factoring_pago` y `factoringpagoid` en `src` sin coincidencias. | No se identificó consumidor directo en el código actual; no demuestra inexistencia de clientes externos ni autoriza romper el contrato HTTP. No se modificó frontend. |
| Pruebas y plantillas | Sin referencias exactas a esos símbolos en pruebas fuera del baseline, plantillas y utilidades consultadas. El baseline MariaDB sí define la estructura antigua. | El futuro cambio deberá actualizar el baseline mediante el procedimiento del proyecto, junto con pruebas pertinentes. |
| Oportunidades inversionista | `getFactoringsOportunidades` no incluye pagos. | No incorporar el nuevo seguimiento a inversionista por iniciativa de esta transición. |

No se encontró un CRUD específico de `factoring_pago` en el código buscado. Esto no excluye integraciones externas o mantenimiento directo: antes del DDL se debe cerrar cualquier vía de escritura durante la comprobación y el cambio.

## Transición recomendada para desarrollo

1. Preparar el manifiesto y SQL revisables para adaptar `factoring_pago` y crear `factoring_pago_detalle`, `factoring_pago_estado` y `factoring_pago_historial`, siguiendo [el modelo propuesto](modelo-pagos-factoring-20261016.md). Esta revisión no incluye preparar ni ejecutar ese DDL.
2. Conservar las columnas de identidad del maestro (`_idfactoringpago`, `factoringpagoid`, `code`) y su relación con operación. Añadir estado funcional, versión y unicidad por operación. Retirar las columnas propias de abono y sus FKs solo con autorización expresa: cuentas empresarial/factor, número bancario, fecha e importe. La retirada de columnas es un cambio de estructura, aun con tabla vacía.
3. Antes de aplicar, conservar respaldo y metadatos, verificar FKs entrantes, obtener conteo exacto nuevamente e impedir escrituras durante la transición. Si aparece cualquier fila nueva, abortar esta estrategia: no eliminar, fusionar ni trasladar automáticamente. Diseñar y autorizar entonces la migración histórica específica.
4. Aplicar únicamente el DDL autorizado mediante `db:ddl`, revisión previa y huellas; verificar estructura y después ejecutar `prisma-sync` contra el mismo destino. MariaDB confirma DDL implícitamente: la recuperación necesita pasos explícitos, no un supuesto rollback transaccional. El soporte del runner para cada ALTER concreto se comprobará al preparar el manifiesto.
5. Actualizar los consumidores de consulta y los DTO antes de habilitar registros de pagos. Mantener `factoring_pagos` como colección de abonos en los contratos existentes; nunca reutilizar esa propiedad para devolver maestros. Si se expone ese contrato después de la transición, construir su representación desde los detalles y relaciones bancarias, revisando tipos, UUID, fechas y campos anteriores. No fabricar la cuenta empresarial que el nuevo modelo no conoce: si mantener ese campo obligatorio resulta necesario, resolver compatibilidad/versionado antes de activar el módulo. Mientras no existan detalles, el valor histórico sigue siendo `[]`.
6. Exponer el maestro y su seguimiento en un contrato explícito del nuevo módulo. El acumulado y la diferencia se calculan; no se insertan importes agregados. Crear maestros para operaciones según el alcance de activación acordado: cualquier alta masiva directa requerirá autorización de datos separada. No crear maestros ni pagos automáticamente a partir de movimientos bancarios durante la adaptación.
7. Habilitar el registro manual con auditoría y controles transaccionales: distribución de una transacción entre operaciones, límite global por movimiento, moneda/factor compatibles, estado elegido por usuario y diferencia visual respecto de la propuesta aceptada. La diferencia no bloquea CANCELADO ni induce otro estado.

La ausencia de datos permite simplificar la transición en desarrollo, pero no justifica mantener una segunda tabla permanente con las mismas responsabilidades ni fabricar datos para llenar el nuevo modelo.

## Otros destinos y abonos futuros

Producción y otros destinos no fueron consultados. Antes de aplicar allí, repetir revisión de estructura, FKs, consumidores y conteos. Si hay abonos, preservar cada identidad y auditoría del registro original como detalle o mediante correspondencia explícita; los maestros necesitan identidades propias. Agrupar por operación no permite descartar filas anuladas ni elegir arbitrariamente un UUID antiguo como maestro.

Los detalles históricos requieren evidencia bancaria cierta. No asociar por número bancario solamente ni convertir coincidencias de fecha/importe en confirmaciones. Revisar abonos que comparten movimiento y disponibilidad total; si varias filas terminan en el mismo par maestro/movimiento, resolver su consolidación con trazabilidad antes de imponer la unicidad. El registro legado sin movimiento confirmado debe conservarse fuera del nuevo detalle obligatorio hasta su resolución; no crear un movimiento artificial. La estrategia exacta y cualquier carga requieren autorización concreta.

No inferir estados funcionales históricos únicamente por importes ni por estado de liquidación: el usuario confirmó su gestión manual. Un snapshot sin abonos no demuestra que todas las operaciones carezcan de pagos en el mundo real.

## Validación y límites

- Ejecución real del revisor contra desarrollo, solo lectura, código de salida 0. Metadatos y conteos agregados retenidos en el informe.
- Búsqueda y lectura estática de consumidores backend, frontend y baseline; sin cambios de contratos, fuentes de aplicación, schema ni cliente generado.
- No se ejecutaron pruebas de aplicación, compilación, empaquetado ni migración. No se acredita producción, funcionamiento del nuevo módulo ni compatibilidad de un DDL aún no preparado.

La revisión autorizada queda completada. El siguiente trabajo propuesto es preparar SQL y manifiesto sin aplicar, incorporando la guarda de tabla vacía y la compatibilidad de los contratos descrita arriba.

Actualización posterior del 16/10/2026: el usuario autorizó esa preparación mediante opción Alfa 3. Los [archivos de SQL y manifiesto](pagos-factoring/README.md) quedaron preparados y revisados localmente, sin conexión nueva ni aplicación de DDL. La carga de catálogo y validación de la guarda en MariaDB siguen pendientes.

Actualización de implementación, posterior a esa preparación: el usuario autorizó aplicar el DDL, cargar los tres estados con actor 105 y sincronizar Prisma; esas operaciones se completaron. También se implementaron backend/frontend y se ejecutaron comprobaciones. Este informe conserva la evidencia inicial; el [informe de implementación](pagos-factoring/implementacion.md) recoge el estado vigente. El usuario rechazó regularizar los diez maestros de operaciones anteriores, por lo que no se realizó esa carga.
