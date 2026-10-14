# Detracciones del financiero — especificación y fase A

Fecha de revisión: 2026-10-14, America/Lima.

## Objetivo y alcance autorizado

Incorporar «Pendientes de pago de detracción» inmediatamente debajo de «Pendientes de facturar al cedente». El financiero consultará comprobantes emitidos al cedente, gestionará exclusivamente su detracción y consultará la operación asociada en lectura.

Esta entrega ejecuta solamente la fase A: especificación, contratos, verificación del catálogo y línea base. No implementa endpoints, pantallas, reglas nuevas, migraciones ni cambios de permisos. La autorización para continuar con la fase A incluye las pruebas de línea base seleccionadas; no autoriza empaquetar o desplegar producción.

## Decisiones confirmadas por el usuario

1. Para declarar PAGADA se exige fecha válida y constancia activa existente o nueva.
2. Se conservan los permisos y contratos actuales de Operaciones; la nueva API restringida coexistirá con el flujo amplio existente.
3. La pantalla abre en Pendientes y ofrece Pagadas para correcciones del financiero.
4. Se permite devolver PAGADA a PENDIENTE, con confirmación, conservando la fecha registrada.
5. Las constancias nuevas se agregan; las anteriores se conservan como antecedentes.

La exigencia de fecha y constancia pertenece al nuevo caso de uso. No garantiza que todo registro histórico PAGADA ni toda actualización mediante el endpoint anterior cumpla esos requisitos. No endurecer el endpoint anterior sin una solicitud separada.

## Viabilidad y arquitectura

El esquema existente dispone de factoring_factura_factor, detraccion_estado y archivo_factura. No se prevén nuevas tablas, dependencias npm, cálculos financieros ni integraciones con bancos/SUNAT.

| Capa estándar | Ubicación relativa al backend | Responsabilidad futura |
| --- | --- | --- |
| Rutas | src/routes/financiero/servicio/factoring/ | Módulo factoringdetraccion, autenticación y rol financiero. |
| Controladores | src/controllers/financiero/servicio/factoring/ | Validación Zod, sesión, delegación y respuesta HTTP. |
| Servicios | src/services/financiero/ | Casos de uso y coordinación transaccional. |
| Dominio | src/domain/factoring/ | Requisitos de pago y transiciones puras. |
| Acceso a datos | src/daos/ | Ampliar DAOs de comprobantes, estados, archivos y vínculos; Prisma y actualización condicional. |
| Tipos | src/types/ | Contratos específicos del caso de uso. |
| Servicios de archivos | src/services/usuario/ | Reutilizar carga y descarga existentes. |
| Integraciones / proveedores | src/integrations/ y src/providers/ | Conservar adaptadores existentes; no crear nuevos para esta función. |
| Pruebas rápidas | tests/vitest/unit/ y tests/vitest/http/ | Dominio, servicio, validación y autorización. |
| Integración | tests/mariadb/ | Persistencia, rollback y concurrencia reales. |

No introducir una segunda nomenclatura de repositorios/use-cases sobre los DAOs/services actuales ni reorganizar módulos ajenos. Los controladores no accederán a DAOs, Prisma, transacciones o archivos físicos. Los servicios no dependerán de Express. El dominio no consultará infraestructura.

## Verificación actual del catálogo

Fuente: conexión definida exclusivamente en .env.development. Consulta acotada a detraccion_estado dentro de START TRANSACTION READ ONLY, finalizada mediante rollback y cierre de conexión. No se consultaron comprobantes, empresas ni usuarios; no se modificaron registros.

| Significado | code verificado | ID interno observado en desarrollo | Activo |
| --- | --- | --- | --- |
| PENDIENTE | DE00001 | 1 | Sí |
| PAGADA | DE00002 | 2 | Sí |
| NO APLICA | DE00003 | 3 | Sí |

Usar DE00001 y DE00002 como correspondencia semántica del módulo; resolver el UUID mediante catálogo activo en cada entorno. No codificar IDs internos ni UUID de desarrollo. NO APLICA se excluye de la bandeja y del selector. Un código permitido ausente o inactivo es un error de configuración; no sustituirlo por nombres visuales ni por otro estado.

El primer intento de lectura recibió EACCES en el aislamiento. La misma consulta se completó fuera del aislamiento con salida 0. No se guardan URL, credenciales, host ni nombre de base en este documento.

## Reglas del listado

- Unidad: asociación factoring_factura_factor, identificada públicamente por factoringfacturafactorid. Dos comprobantes de una operación son dos filas distintas.
- Vista inicial PENDIENTE; vista adicional PAGADA para correcciones. NO APLICA queda fuera.
- Exigir asociación, factura y operación activas; excluir registros eliminados. No confundir estado de registro con estado financiero del catálogo.
- Incluir operaciones liquidadas y cualquier estado de pago de factura cuando la detracción coincida con la vista solicitada.
- No añadir filtros por importe, moneda o visibilidad al cedente: no forman parte de la regla acordada. Un PENDIENTE con importe cero no debe desaparecer por un filtro implícito.
- La bandeja no recalcula importes ni aplica umbrales tributarios. Usa los datos del comprobante emitido, conservando precisión y monedas.
- Columnas: operación, cedente, comprobante, fecha de emisión, moneda, importe total, detracción PEN, estado de factura, estado de detracción, fecha registrada y acciones.
- Dos acciones por fila: Ver operación y Gestionar detracción. Archivos y datos restantes se consultan desde el formulario/detalle.

## Contratos HTTP nuevos, todavía no implementados

Prefijo: /api/v1/financiero/servicio/factoring/factoringdetraccion.

| Método | Recurso | Resultado |
| --- | --- | --- |
| GET | /listar | Página de comprobantes por estado, búsqueda y orden. |
| GET | /detalle/:id | Comprobante vigente, referencia de operación, archivos consultables y versión. |
| GET | /master | UUID, code y nombre de los estados permitidos activos. |
| PATCH | /actualizar/:id | Detalle actualizado y versión posterior al commit. |

### Consulta y respuestas

- Query del listado: estado (PENDIENTE o PAGADA; predeterminado PENDIENTE), pagina (predeterminado 1), tamanio (predeterminado 10; entero de 1 a 100), busqueda (texto recortado; máximo 200 caracteres), ordenarPor y direccion (asc o desc).
- ordenarPor permite fechaEmision, operacion, cedente, comprobante, importeTotal, detraccionMonto y fechaPagoDetraccion. Predeterminado fechaEmision asc. Mapear nombres a campos conocidos; nunca interpolar nombres de columna recibidos.
- Desempatar por factoringfacturafactorid asc; fechas ausentes al final. Ordenar importes como números decimales, no como etiquetas formateadas.
- La búsqueda cubre código de operación, RUC/razón social del cedente y serie/número de comprobante; consulta parametrizada.
- Mantener envoltura estándar error/data. En listar, data contiene registros, total, pagina y tamanio. total usa los mismos filtros que registros.
- Las filas entregan IDs públicos de asociación y operación, datos de las columnas y versión; no necesitan incluir todas las colecciones de la operación.
- Detalle reutiliza los datos de lectura del comprobante existente y entrega la referencia de operación. El frontend consulta la información financiera completa mediante el flujo existente de Operaciones y su administrador de detalle; no duplicar sus colecciones en la nueva API.
- Mantener serialización monetaria actual y tratar decimales con precisión. Las respuestas no incluyen rutas físicas ni credenciales.

### Actualización restringida

- Autoridad del recurso: :id en URL; no aceptar ID alternativo de comprobante en el cuerpo.
- Cuerpo estricto: detraccionestadoid obligatorio (UUID activo permitido), fecha_pago_detraccion obligatoria (ISO UTC válido o null), detraccionarchivoid opcional (UUID de nueva constancia), version obligatoria (representación UTC exacta de fechamod).
- Para PAGADA, fecha no puede ser null y debe existir al menos una constancia admisible tras la operación. Para PENDIENTE, fecha puede ser null o una fecha válida.
- Reabrir PAGADA debe enviar la fecha vigente para conservarla. No limpiarla automáticamente. El servidor debe impedir que la propia transición de reapertura la borre; una corrección posterior en PENDIENTE puede modificarla.
- Omitir detraccionarchivoid conserva vínculos. No aceptar null como orden de eliminación.
- Rechazar propiedades adicionales, especialmente facturaestadoid, fecha_pago_factura, importes, factoringid e idusuario.
- Fecha real y formato ISO UTC obligatorio; conservar hora y conversión Lima actuales. No introducir nuevas reglas sobre fechas futuras o fecha mínima de pago.
- Usuario auditor obtenido de la sesión válida, sin fallback a usuario 1.

### Seguridad y errores

- Aplicar isAuth e isRole([6]) con verificación vigente de roles en los cuatro endpoints. La visibilidad del menú no es una autorización del servidor.
- Conservar códigos de autenticación actuales de los middlewares: token ausente actualmente devuelve 403; token inválido 401; rol no autorizado 403.
- Entradas y reglas de negocio inválidas: 400; recurso inexistente, eliminado o no disponible: 404; versión obsoleta: 409. Mantener formato de error del middleware existente.
- Catálogo incompleto o fallo de infraestructura: error del servidor sin revelar credenciales, rutas ni datos internos.
- El endpoint nuevo restringe el caso de uso, pero no elimina las facultades ya existentes del financiero en Operaciones.

## Archivos y transacción

- Tipos admitidos: PDF, PNG, JPG y JPEG; tamaño máximo acordado 5 MB (5 * 1024 * 1024 bytes). Validar servidor y cliente; no confiar solamente en extensión/MIME declarado.
- Antes de implementar, contrastar la configuración del tipo de archivo existente con ese límite. Si es más restrictiva, no ampliarla globalmente sin evaluación explícita; registrar la discrepancia.
- Una constancia existente debe ser activa, del tipo CONSTANCIA_PAGO_DETRACCION y estar vinculada activamente a la factura del comprobante.
- Una constancia nueva debe ser activa, del tipo correcto, cargada por el usuario autenticado y no vinculada a otra factura. Un vínculo activo a la misma factura no se duplica.
- Todas las lecturas de validación y escrituras del nuevo caso de uso utilizan el mismo tx. No consultar archivos mediante el cliente global dentro de la transacción.
- La transacción comprende estado, fecha, auditoría y vínculo de constancia. Un fallo de vínculo revierte la actualización.
- Actualizar condicionalmente por identificador y fechamod exacto. Exigir una fila actualizada; ninguna implica conflicto o indisponibilidad, según lectura vigente.
- La versión posterior debe ser diferente a la anterior incluso en dos actualizaciones dentro del mismo milisegundo: mantener precisión Timestamp(3) y garantizar avance monotónico al escribir fechamod. No introducir un contador de versión persistente en esta fase.
- No reintentar automáticamente una escritura ante 409. Releer y pedir al usuario revisar el estado vigente.
- Registrar última modificación con los campos existentes; esto no constituye historial íntegro de cambios.
- La carga física previa no forma parte de esta transacción. No borrar archivos vinculados durante cancelaciones ni atribuir atomicidad al sistema de archivos. Revisar comportamiento de cargas huérfanas antes de cualquier limpieza; no añadir un borrado global.

## Integración frontend y lectura de operación

- Ruta nueva: /financiero/servicio/factoring/factoring/pendientes-detraccion.
- Menú generado por src/menu/menuFinanciero.ts en backend, respetando condiciones actuales de visibilidad.
- Reutilizar MUI, Formik/Yup, tablas, fechas, carga de archivos y cliente financiero existentes.
- El formulario muestra los datos del comprobante y habilita únicamente estado, fecha de detracción y carga de constancia.
- Pagadas permite corregir fecha, agregar constancia y reabrir con confirmación. Mostrar mensaje de conservación de fecha/documentos al reabrir.
- PENDIENTE con fecha se presenta como fecha registrada; no indicar pago cerrado ni inferir PAGADA por tener fecha/constancia.
- Añadir modo explícito de lectura a FactoringDetalle y propagarlo a todas sus secciones/subpantallas alcanzables. Deshabilitar altas, ediciones, eliminaciones, activaciones y envíos de correo; conservar consulta, vista previa y descarga.
- El valor predeterminado de FactoringDetalle conserva el comportamiento actual de Operaciones.
- Claves SWR del listado incluyen estado, búsqueda, orden, página y tamaño. La actualización invalida pendientes/pagadas, comprobante y operación afectada mediante el proveedor actual.
- Capturar IDs al iniciar el guardado; no alterar la selección nueva si el usuario cambió de registro durante la solicitud.
- Guardado confirmado con recarga fallida se informa como guardado realizado con actualización pendiente, sin inducir a reenviar.

## Línea base de fase A

Antes de estas tareas, git status --short no mostró cambios en ninguno de los dos proyectos. Solo se agregan documentos de planificación y registros de pruebas. No se cambian fuentes, tests ni expectativas.

Node verificado: v24.21.0, D:/Herramientas/node-v24.21.0-win-x64/node.exe. Backend usa npm.cmd; frontend el lanzador scripts/npm-node24.ps1.

Selección backend fija, para repetir después de los cambios:

- tests/vitest/unit/factoringfactura.business.test.ts: estados y fechas de comprobantes mediante servicio administrativo; no prueba por sí sola el futuro endpoint financiero restringido.
- tests/vitest/unit/archivo.business.test.ts: carga y asociación de archivos con infraestructura simulada.
- tests/vitest/unit/archivoMiddleware.test.ts: límites de entrada de archivos.
- tests/vitest/migrated/unit/services/secure/accesos.Service.test.ts: sesión/accesos y middleware de autorización con persistencia simulada.
- tests/vitest/migrated/unit/services/financiero/factura.Service.test.ts: delegación del servicio financiero de facturas.

Ejecución: npm.cmd run test:vitest -- seguido de los cinco archivos anteriores; CI=true. Resultado actual: 5 archivos y 55 pruebas aprobadas, salida 0. El primer intento no cargó pruebas por EPERM/realpath del aislamiento; el reintento usó idéntica selección y expectativas fuera del aislamiento.

Registros completos locales:

- docs/registros/pruebas/20261014_detracciones_fase_a_backend.log: intento con fallo de entorno.
- docs/registros/pruebas/20261014_detracciones_fase_a_backend_reintento.log: ejecución aprobada.

La selección frontend y sus resultados se registran en el documento compañero docs/implementaciones/DETRACCIONES_FINANCIERO_FASE_A_20261014.md del repositorio ft-app-frontend-mantis. Resultado: 5 archivos y 123 pruebas aprobadas, salida 0; reintento de la misma selección fuera del aislamiento después de fallos ENOENT en temporales.

Durante el cierre apareció el archivo no rastreado docs/plan-saldo-contable-sbs-20261014.md, ajeno a esta tarea. Se conservó intacto y no forma parte de la entrega de detracciones. El estado limpio descrito corresponde a la comprobación inicial, no a una afirmación sobre todo el repositorio al cierre.

## Comprobaciones posteriores a la implementación

- Unitarias: requisitos de pago, estados ajenos, reapertura, fecha conservada y campos protegidos.
- HTTP: cuerpo estricto, fechas/UUID/versiones inválidos, rol incorrecto/revocado, recurso eliminado y conflicto.
- MariaDB desechable: filtros/paginación, campos protegidos, rollback del vínculo, actualización concurrente y duplicados. Crear fixtures sintéticas; no copiar catálogos o datos de negocio de una base compartida.
- Frontend: vistas, acciones, formulario restringido, conflictos, reapertura, carga incompleta, lectura de operación y sincronización SWR.
- Regresión: repetir exactamente la selección de fase A y añadir las pruebas de la nueva funcionalidad. No sustituir pruebas anteriores ni debilitar expectativas.
- Tipos, integración, navegador, carga/descarga reales y CI remoto son evidencias separadas; la línea base rápida no los certifica.

## Seguimiento de fase A

| Tarea del plan | Estado |
| --- | --- |
| A1: reglas documentadas | Completada en este documento. |
| A2: contratos documentados | Completada; API futura, no implementada. |
| A3: catálogo real verificado | Completada mediante consulta read-only de desarrollo. |
| A4: correspondencia semántica definida | DE00001/PENDIENTE y DE00002/PAGADA; UUID resueltos por entorno. |
| A5: estado inicial de Git revisado | Ambos repositorios limpios antes de la fase A. |
| A6: selección de regresión identificada | Backend arriba; frontend en documento compañero. |
| A7: línea base | Backend y frontend aprobados; selecciones y registros conservados. |

Siguiente paso del plan: fase B, definir los tipos específicos y añadir las consultas y actualización condicional en DAOs. No iniciar fase B como parte de esta entrega.
