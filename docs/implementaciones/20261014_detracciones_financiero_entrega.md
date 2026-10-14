# Detracciones del financiero — implementación y validación local

Fecha: 2026-10-14, America/Lima. Especificación y decisiones aprobadas: [fase A](20261014_detracciones_financiero_fase_a.md).

## Resultado funcional

Se incorpora «Pendientes de pago de detracción» inmediatamente debajo de pendientes de facturación. La nueva pantalla abre en Pendientes y permite consultar Pagadas para corregir fecha, agregar constancias y reabrir pagos. Cada comprobante ofrece Ver operación y Gestionar detracción.

La nueva API solo actualiza estado de detracción, fecha de pago de detracción y vínculo de nueva constancia, además de metadatos técnicos de auditoría/concurrencia. Rechaza propiedades adicionales. No modifica estado/fecha de pago de factura, importes, moneda ni operación asociada. Se conservan los contratos y permisos anteriores de Operaciones.

PAGADA exige fecha y constancia; la reapertura exige conservar la fecha vigente. Las constancias anteriores permanecen vinculadas. La operación se abre con el mismo detalle financiero, en modo explícito de lectura: sin altas, ediciones, eliminaciones, activaciones o correos desde esa apertura; consulta y descarga permanecen disponibles.

## Organización y decisiones de implementación

- Se mantienen routes → controllers → services → daos, con reglas puras en domain/factoring y contratos en types. Imports ESM con .js y aliases existentes.
- El DAO específico factoringdetraccion.Dao reúne proyecciones, filtros, ordenamiento y actualización condicional del nuevo caso de uso. Se eligió aislar esas consultas en el mismo directorio estándar en vez de ampliar el DAO CRUD general y arriesgar sus consumidores.
- Estado semántico por catálogo: DE00001/PENDIENTE y DE00002/PAGADA. Los UUID se resuelven en cada entorno. No se codifican IDs/UUID de desarrollo.
- Listado paginado del servidor con orden cerrado, búsqueda parametrizada y desempate estable. Fechas nulas al final. Soporta búsqueda de serie-número y varios comprobantes de una operación. No excluye operaciones liquidadas ni detracciones pendientes de importe cero.
- Las respuestas seleccionan campos explícitos y no exponen rutas físicas de archivos.
- Una transacción READ COMMITTED valida el registro y archivos, actualiza condicionalmente por fechamod y vincula la constancia. El nuevo fechamod avanza al menos un milisegundo respecto del anterior. Una versión obsoleta devuelve 409 sin reintento automático.
- El archivo nuevo se bloquea durante la validación/vinculación para serializar su uso. Se comprueba titular de carga y asociación; no se acepta un archivo vinculado a otra factura. El vínculo es idempotente para la misma factura.
- Se reutilizan carga/descarga existentes. El tipo AT012000 verifica firma binaria, PDF/PNG/JPEG y máximo 5 MiB, conservando los límites de catálogo. Esta comprobación también protege las cargas de ese tipo desde las pantallas existentes; no modifica otros tipos de archivo.
- Se verificó en lectura el catálogo de archivos: AT012000, 5242880 bytes, .pdf/.jpg/.jpeg/.png, MIME application/pdf/image/jpeg/image/png. No se modificó el catálogo.
- Los endpoints generales de archivos requieren rol 5; el financiero requiere rol 6 en detracciones. El rol base 5 se asigna en el flujo actual de validación del usuario. No se ampliaron los permisos de archivos. La integración prueba explícitamente la combinación de roles 5 y 6.
- No hay migraciones, nuevas dependencias, cambios del cliente Prisma generado ni fórmulas financieras nuevas.

## API entregada

Prefijo: /api/v1/financiero/servicio/factoring/factoringdetraccion.

| Método | Recurso | Comportamiento |
| --- | --- | --- |
| GET | /listar | PENDIENTE/PAGADA, búsqueda, ordenamiento y página del servidor. |
| GET | /detalle/:id | Comprobante vigente, referencia de operación, archivos activos y versión. |
| GET | /master | Catálogo activo permitido; error explícito si está incompleto. |
| PATCH | /actualizar/:id | Los tres campos de detracción y versión técnica; actor de sesión. |

Se conserva la envoltura error/data. Los parámetros, defaults y códigos de error están descritos en fase A. El router se monta en el agregador financiero y se protege con autenticación y rol vigente. El PATCH anterior de comprobantes sigue disponible con su contrato anterior.

## Evidencia actual

Todas las ejecuciones utilizaron Node portable v24.21.0. Backend mediante npm.cmd, frontend mediante scripts/npm-node24.ps1. No se utilizaron bases compartidas para las pruebas ni datos reales de clientes.

| Comprobación | Resultado actual | Registro |
| --- | --- | --- |
| Tipos backend, Vitest e integración | Aprobado | docs/registros/pruebas/20261014_detracciones_backend_tipos.log y 20261014_detracciones_integracion_tipos.log |
| Backend focalizado + regresión A + archivos | 8 archivos / 100 pruebas aprobadas | docs/registros/pruebas/20261014_detracciones_backend.log |
| Vitest backend completo, referencia de fechas de CI | 41 archivos aprobados, 1 suite pendiente; 3570 pruebas aprobadas y 3 todo existentes | docs/registros/pruebas/20261014_detracciones_backend_completo_contrato_ci.log |
| Detracciones + aplicación HTTP real + runtime compilado | 3 archivos / 44 pruebas aprobadas | docs/registros/pruebas/20261014_detracciones_mariadb_runtime.log |
| Integración ampliada con carga/descarga HTTP real | 2 archivos / 42 pruebas aprobadas | docs/registros/pruebas/20261014_detracciones_http_archivos.log |
| Lint backend sobre fuentes afectadas | Sin errores; dos advertencias any preexistentes en archivo.Service | docs/registros/pruebas/20261014_detracciones_backend_lint.log |
| Frontend, tipos/lint/formato | Aprobados | Informe compañero del frontend |
| Frontend focalizado | 9 archivos / 147 pruebas aprobadas | Informe compañero del frontend |
| Frontend completo | 78 archivos / 2966 pruebas aprobadas | Informe compañero del frontend |
| Frontend, comprobación final de fechas civiles y revalidación SWR | 3 archivos / 15 pruebas aprobadas | Informe compañero del frontend |
| Navegador, componentes reales con API sintética | Escritorio 1280×720 y móvil 390×844; flujo pendiente/pagada/reapertura revisado | Capturas en informe compañero |

La ejecución ampliada HTTP verificó login real con bcrypt/JWT, catálogo y autorización del rol, selección del comprobante, rechazo de campos ajenos, carga multipart con firma PNG real, actualización de pago, salida de Pendientes, descarga con bytes idénticos, reapertura conservando fecha y documentos, invariancia de factura y revocación efectiva del rol financiero.

El formulario mantiene una instantánea coherente de valores y versión mientras se edita. Si SWR recibe una versión diferente, bloquea el guardado y solicita recarga; no mezcla campos antiguos con una versión nueva. Las fechas civiles de emisión/pago XML se presentan en UTC como en el administrador, mientras la fecha-hora de pago de detracción conserva la conversión local existente. El ajuste final de presentación de fechas se verificó después de la suite completa mediante las 15 pruebas específicas del módulo.

Las pruebas específicas MariaDB comprobaron paginación/búsqueda, orden de fechas nulas, operaciones liquidadas, comprobantes múltiples, exclusión de eliminados/NO APLICA, conservación de documentos anteriores, ausencia de vínculos duplicados, rollback real después de una actualización y conflicto entre dos escritores de la misma versión.

Los resultados de 44 y 42 pruebas son ejecuciones diferentes con suites compartidas; no se suman como pruebas únicas. El runner confirmó limpieza removed. La evidencia del último runId 9f26fe71779c2ae97518a0bf se conserva en docs/registros/pruebas/20261014_detracciones_http_archivos_resumen.json.

## Reproducción y límites

- Ejecutar tipos mediante npm.cmd run typecheck:all con Node portable antepuesto al Path.
- Para la suite completa backend, establecer temporalmente CI=true y LIQUIDACION_FRONTEND_ROOT a tests/fixtures/frontend-date-contract; verificar primero scripts/quality/verify-frontend-date-contract.mjs y ejecutar npm.cmd run test:vitest.
- Ejecutar integración mediante npm.cmd run test:integration -- tests/mariadb/detraccion.test.ts tests/mariadb/authHttp.test.ts. Para el proceso compilado añadir tests/mariadb/runtime.test.ts. Docker Desktop debe estar iniciado con motor Linux.
- El primer intento de la suite completa backend usó la ruta predeterminada al frontend y falló porque scripts/analisis/fecha-liquidacion-frontend.cjs todavía busca dateUtils.js y el frontend actual utiliza dateUtils.ts. Se mantuvieron fuentes/expectativas y se usó la referencia versionada e íntegra que ya configura CI. Esto prueba el contrato capturado, no la sincronización automática con el helper TypeScript actual; ver DT-CI-01 existente.
- Los fallos iniciales EPERM/ENOENT/EACCES del aislamiento de Windows están separados de las ejecuciones aprobadas fuera del aislamiento. No se cambiaron las expectativas para obtener aprobación.
- La revisión visual usa componentes reales y datos/API sintéticos; no es una sesión de navegador conectada a MariaDB. La integración HTTP usa app, servicios, DAOs, archivos y MariaDB reales con proveedores externos aislados.
- No se enviaron correos ni Telegram, no se ejecutó build-prod y no se publicó un despliegue o CI remoto.
- El almacenamiento físico de una carga previa no pertenece a la transacción SQL del comprobante. Cancelar no borra constancias vinculadas; no se añadió limpieza global de cargas huérfanas.
- La auditoría actual identifica la última modificación, no un historial completo. Los endpoints anteriores mantienen sus reglas originales y no quedan convertidos automáticamente al caso de uso restringido.

## Estado de fases y entrega

| Fase | Estado |
| --- | --- |
| A — Especificación y línea base | Completada en documento de fase A. |
| B — Consultas y persistencia | Implementada y probada con MariaDB real. |
| C — Reglas y servicio | Implementada; transacciones, documentos y concurrencia probados. |
| D — HTTP, autorización y menú | Implementada; router global y rol vigente probados. |
| E — Cliente y sincronización | Implementada; regresión SWR aprobada. |
| F — Pantalla y detalle de operación | Implementada; lectura estricta y flujo visual revisados. |
| G — Pruebas | Nuevas suites y regresiones aprobadas. |
| H — Validación y preparación de entrega | Validación local y reversión documentadas; publicación/aceptación conjunta en entorno destino pendientes. |

Los documentos ajenos a esta tarea, incluido docs/plan-saldo-contable-sbs-20261014.md, se conservaron intactos. No se hicieron commits, PR ni cambios en servicios desplegados.

## Publicación, observación y reversión

1. Preparar los dos cambios como una entrega coordinada. No ejecutar build-prod ni modificar conexiones sin autorización específica.
2. Publicar primero el frontend compatible: la ruta nueva queda preparada y el menú anterior sigue sin exponerla. Publicar después el backend con API y menú nuevos. Esta secuencia evita mostrar un enlace que el frontend anterior no resuelva, sin introducir un feature flag global.
3. En el entorno de aceptación, usar un financiero con rol base de archivos y recorrer listado, operación en lectura, pago con constancia, descarga, corrección y reapertura. Comprobar que Operaciones conserva sus permisos previos.
4. Observar errores de catálogo/archivos, respuestas 409 y errores 5xx mediante los registros HTTP existentes, sin registrar contenido documental o credenciales. Confirmar que el catálogo del entorno destino contiene los códigos activos y AT012000 con sus restricciones.
5. Para revertir, retirar API/menú y restaurar las versiones anteriores de ambos proyectos de forma coordinada. No borrar estados, fechas, constancias ni vínculos registrados: no hay cambios de esquema que revertir. Operaciones y el administrador continúan con sus contratos anteriores.

Siguiente paso del plan: publicar la entrega coordinada en el entorno de aceptación autorizado y realizar el recorrido integrado con un financiero. Producción requiere autorización específica de empaquetado/despliegue.
