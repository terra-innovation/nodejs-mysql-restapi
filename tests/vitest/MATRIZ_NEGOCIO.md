# Matriz de regresión de negocio antes de migraciones

Estado al 2026-10-08: 346 casos activos aprobados en Vitest rápido y 8 criterios
pendientes. Jest continúa disponible. DT-XML-01 fue corregido por el usuario y
DT-XML-02 se corrigió con regresión PEN/USD. Se conservan fórmulas, contratos
HTTP, permisos y empaquetado.

## Contratos automatizados

| Área | Casos principales | Evidencia y aislamiento |
| --- | --- | --- |
| Propuesta | Simular y crear producen los mismos importes; capital, garantía, interés, comisión, IGV y CAVALI; moneda/banco; cabecera y detalles asociados; actor e historial | Servicio y calculador reales; DAOs/configuración simulados |
| Estados de propuesta | Estado disponible notifica al contacto de la operación; otros estados no notifican; registro/estado ausente no escribe; error de historial detiene actualización | Correo simulado; no envío real |
| XML | UTF-8/Latin1, prefijos, whitespace, tipo 01, fechas, partes, tributos, cuotas y neto; prioridad crédito/cuotas; detracción PEN/USD y tipo de cambio | XML sintético y filesystem reales; sin certificación UBL/SUNAT |
| Registro de factura | Tipos XML/PDF activos; cabecera/detalles/vínculos con actor; vencimiento distinto de emisión y moneda de ítem PEN/USD; rechazos y errores | Servicio/constructores reales y payload enviado a DAOs simulados; sin lectura posterior en MariaDB |
| Asociación de factura | Operación/factura, estados de factura/detracción, constancia, fechas UTC, actualizar y baja lógica | DAOs simulados; no prueba duplicados ni rollback SQL |
| Aprobación del empresario | Pertenencia y vigencia; historial de propuesta aprobada 6, operación 4, propuesta aceptada vinculada, actor y notificaciones | Servicio real y dos DAOs reales sobre clientes mínimos para verificar filtros; sin concurrencia SQL |
| Estado de operación | Relaciones/adjuntos ausentes no escriben; historial y estado con actor; 29/10/36 notifican; 36 fija inicio | Servicio real, correo sustituido y reloj fijo; sin inventar matriz de transiciones |
| Edición de historial | Comentario/estado/adjuntos; activar/eliminar preservan actor sin cambiar estado actual de la operación | Servicio y router reales; DAOs simulados |
| Protección de integración | URL y nombre de base exclusivos, puerto distinto de desarrollo, identidad de contenedor para limpiar, hash y filtros del runner | 15 casos rápidos de validación; no certifican arranque/restauración con Docker |
| Liquidación | Inicio/puntual/tardío; reintegro y mora; días civiles de Lima; garantía aceptada; PEN/USD; exoneración bancaria; cargo/abono afecto e inafecto; saldo a favor, cero o por cobrar | Servicio, calendarios y calculador reales; catálogo sintético coherente |
| Persistencia de liquidación | Cabecera y detalles asociados con el actor; operación/estado/propuesta/inicio ausente no escribe; falla de detalle no devuelve éxito | Callback transaccional simulado; sin afirmar rollback SQL |
| Secuencia propuesta-liquidación | Una propuesta generada alimenta una liquidación puntual manteniendo capital/garantía/descuento | Aprobación tiene ahora su propia suite; este recorrido continúa usando fixture y no lectura posterior en BD |
| Transferencia | Relaciones requeridas con cuentas, moneda, tipo, estado y constancia; monto y actor; archivo vinculado al ID creado; fallo de cabecera detiene vínculo | DAOs simulados; no transferencia bancaria real |
| Login | Password correcto/incorrecto/ausente; usuario inexistente; fallo de lectura; identidad y roles del JWT; 24 horas en producción y 200 000 horas fuera de producción | bcrypt y JWT reales; notificación simulada; estados activos comprobados también en MariaDB |
| Recuperación | OTP correcto/incorrecto/usado/vencido; usuario/credencial ausente; nuevo hash verificable; validación consumida después de actualizar credencial; fallos de escritura | Cifrado y bcrypt reales, reloj fijo; no correo ni BD reales |
| Accesos | Roles retirados; sesión vigente/expirada/inválida; expiración durante consulta; exp/iat conservados; secretos eliminados; filtros de roles/cuenta activos | Servicio y DAO de consulta reales sobre cliente Prisma simulado |
| Suscripción | Filtro por usuario y registro activo; pendiente/aprobada/otro estado; servicio no integrado; suscripción ajena/inexistente | Se verifica el filtro enviado, no la integridad del motor de BD; `acceso` es metadato de ruta, no concede por sí mismo el rol |
| Archivo | Tamaño máximo exacto/excedido; extensión mayúscula/inválida; PNG real; PDF disfrazado; MIME declarado diferente; tipo por defecto; limpieza temporal; descarga y eliminación lógica | Filesystem y `file-type` reales en un `mkdtemp` por prueba; DAOs simulados |
| HTTP | Autenticación previa al DAO; JWT incorrecto/expirado/sin identidad; roles ajenos; payload inválido; campos desconocidos; actor desde sesión; códigos y cuerpo de respuesta | Routers, middleware, controladores, servicios y errores reales; Supertest |

## Oráculos financieros

Los fixtures financieros usan 20 000 netos, financiamiento 80%, garantía 4 000,
tasa mensual 2%, dos facturas y comisión plana 1% (factor exponencial cero en
el catálogo de prueba). Los valores son sintéticos y no describen tarifas de
producción. La configuración de IGV es 18% y existe un caso separado a 0%.

| Resultado | Valor esperado independiente |
| --- | --- |
| Financiado / garantía | 16 000 / 4 000 |
| Descuento a 30 días | 16 000 × 2% = 320 |
| Descuento a 60 días | 16 000 × (1.02² − 1) = 646.40 |
| Mora adicional a 60 días | 646.40 − 320 = 326.40; IGV 58.75 |
| Saldo tardío, banco propio | 4 000 − 326.40 − 58.75 = 3 614.85 |
| Reintegro al día de inicio | Descuento efectivo 0; reintegro 320; saldo 4 320 |
| Propuesta PEN, banco propio | 16 000 − 320 − 200 − 36 − 20 − 3.60 = 15 420.40 |
| Propuesta USD, banco propio | 16 000 − 320 − 200 − 36 − 6 − 1.08 = 15 436.92 |
| Transferencia interbancaria | Tarifa de fixture 7.50 PEN / 2.50 USD, inafecta |
| Cargo adicional de 5 000 afecto | Garantía 4 000 − cargo 5 000 − IGV 900 = saldo por cobrar 1 900 |

Estos importes están fijados en las pruebas. No se llama al calculador bajo
prueba para obtener sus propios resultados esperados. Los casos complementarios
verifican relaciones algebraicas entre cabecera, impuesto y detalles.

## Pendientes y límites que siguen abiertos

- Ocho criterios `todo`: DT-LIQ-01 a DT-LIQ-06 y DT-TEST-01/02. Referencias:
  [deuda financiera](../../docs/deuda-tecnica/20261006_1451_DT_validaciones_financieras_factoring.md)
  [hallazgos iniciales](../../docs/deuda-tecnica/20261007_DT_hallazgos_pruebas_negocio.md)
  y [hallazgos XML](../../docs/deuda-tecnica/20261008_DT_hallazgos_XML_regresion.md).
  No se hacen pasar esos criterios como casos aprobados ni se corrigen reglas
  del backend para lograr un resultado verde.
- DT-XML-01/02 cerrados con pruebas activas de constructores/payloads y ahora
  con guardado y lectura real de fechas y moneda PEN/USD en MariaDB.
  No implica reparación de registros históricos.
- Integración con MariaDB 11.4: restricciones, commit/rollback, concurrencia,
  dobles solicitudes, aislamiento y precisión al guardar/leer Decimals.
  Las pruebas rápidas verifican payloads, referencias transaccionales,
  interrupción de escrituras y propagación de errores. El cálculo de propuestas
  usa una transacción independiente dentro de la del servicio llamador; la
  integración SQL ahora comprueba sus conexiones y snapshots distintos.
  El [entorno exclusivo](../mariadb/README.md) ya tiene snapshot de desarrollo,
  comandos y 494 casos reales aprobados en quince archivos, incluidos límites
  caracterizados como la colisión de temporales PDF pendiente de corrección.
  Ya verifica XML, lectura, rollback SQL, permisos y aceptación secuencial.
  Se corrigieron carrera de aprobación y atomicidad de importación administrativa
  y del empresario;
  [DT-IT-01/02](../../docs/deuda-tecnica/20261008_DT_integracion_MariaDB.md)
  documentan las correcciones y su evidencia previa.
  Liquidación y transferencias incorporan 36 casos SQL reales; el auditor histórico
  incorpora cinco regresiones. Cálculo y creación de propuestas añaden 19 casos
  reales de guardado/lectura, rollback y concurrencia con aprobación:
  [alcance y hallazgos](../../docs/deuda-tecnica/20261008_integracion_propuestas_calculo.md).
  No existe un servicio de recálculo de importes sobre propuestas existentes.
  Por decisión del usuario, la transacción independiente del calculador queda
  como límite conocido, sin cambio autorizado ni programado. La política de
  creación de propuestas en operaciones ya aprobadas sigue pendiente de decisión.
- La carga específica del empresario ya tiene 27 casos reales de elegibilidad,
  límites, duplicados, reutilización de empresas y rollback; creación de empresas
  y rollback del DAO se verifican por separado, porque el servicio exige empresas
  preexistentes. Ver [alcance](../../docs/deuda-tecnica/20261008_DT_XML_empresario_integracion.md).
  La creación de operación, asociaciones y actualización administrativa de
  líneas ya tienen 27 casos reales. Se corrigieron concatenación Decimal y
  duplicados concurrentes. Por decisión del usuario, no se implementa consumo
  automático de líneas. Ver [alcance](../../docs/deuda-tecnica/20261008_DT_creacion_factoring_integracion.md).
  Liquidaciones/transferencias añaden 12 casos SQL de repetición, concurrencia y
  rollback aislado: [resultados](../../docs/deuda-tecnica/20261008_integracion_concurrencia_liquidaciones_transferencias.md).
  Las solicitudes repetidas guardan dos registros; la política de deduplicación
  sigue pendiente de decisión, sin implementación autorizada.
  El recorrido HTTP/Multer de facturas reúne 83 casos con MariaDB: carga XML/PDF,
  registro, lectura/descarga, JWT, roles, rechazos, rollback SQL y frontera de
  20 MiB (exclusiva en la versión actual). Los rechazos de
  autenticación se comprueban con firmas reales: JWT expirados y sesiones sin
  usuario o roles válidos, en carga, registro y descarga. Los dos límites de
  limpieza de disco quedan como limitaciones conocidas, sin corrección autorizada
  ni programada: [DT-HTTP-01/02](../../docs/deuda-tecnica/20261008_integracion_HTTP_Multer_facturas.md).
  No se efectúan transferencias bancarias reales ni se certifica toda la aplicación HTTP.
  La eliminación incluye 14 casos: permisos, rollback, repetición y archivos ajenos
  o vinculados. Es lógica, conserva contenido y permite descarga posterior;
  no comprueba pertenencia ni bloquea vínculos (límites DT-HTTP-03/04/05).
  La definición de permisos y ciclo de vida se mantiene como
  [deuda técnica](../../docs/deuda-tecnica/20261008_DT_ciclo_vida_archivos.md),
  sin corrección autorizada ni programada. La
  [revisión de próximas suites SQL/HTTP](../mariadb/PLAN_AMPLIACION.md)
  registra 27 casos de estados/historial ya implementados en SQL real:
  [alcance](../../docs/deuda-tecnica/20261008_integracion_estados_historial_operacion.md).
  PEN/USD, 29/10/36, fecha de inicio, adjuntos, actor, edición, baja/reactivación
  y rollback SQL/notificación; no se afirma una matriz de transiciones aprobada.
  Propuestas/liquidaciones/transferencias agregan 60 casos HTTP con MariaDB:
  creación administrativa, consulta por ambos perfiles, PEN/USD, actor de sesión,
  validación, simulación sin escritura, ciclo de estado lógico y rollback SQL.
  Los routers financieros no ofrecen creación. Ver
  [alcance y exclusiones](../../docs/deuda-tecnica/20261008_integracion_HTTP_financiero.md).
  Diez casos conectan XML, operación, propuesta, disponibilidad, aceptación,
  inicio y liquidación con IDs reales: PEN/USD y tres fechas de pago, rechazo
  de propuesta no disponible y rollback/reintento tardío. No se insertan
  resultados de etapas en la preparación. Ver
  [recorrido](../../docs/deuda-tecnica/20261008_integracion_recorrido_conectado.md).
- Falta una matriz aprobada de transiciones origen/destino, si se requieren
  restricciones adicionales. Las pruebas comprueban existencia del estado destino
  y efectos actuales. La repetición secuencial de aprobación sí está probada
  en MariaDB; las aprobaciones simultáneas también cumplen unicidad, incluso
  con propuestas diferentes de la misma operación.
- PDF: 104 casos MariaDB con generador real y lectura del documento descargado;
  PEN/USD, propuesta/liquidación, ambos perfiles, importes/fechas, permisos y
  temporales, dos facturas vinculadas, anticipación/mora y 60 conceptos con
  paginación. Ver [límites y cobertura](../../docs/deuda-tecnica/20261008_integracion_PDF.md).
  Doce concurrencias del mismo documento caracterizan el temporal compartido
  y una respuesta fallida por la limpieza de otra solicitud (DT-PDF-04); cuatro
  controles de documentos distintos descargan correctamente. No se declara
  resuelta la concurrencia. Doce casos adicionales cubren nombres largos y veinte
  facturas, incluidos cuatro diagnósticos del criterio visual incumplido DT-PDF-05.
  Quedan pendientes otros volúmenes, interrupciones a mitad del cuerpo y escrituras simultáneas sin coordinación.
  Dieciséis cancelaciones TCP antes del cuerpo comprueban limpieza, SQL sin cambios
  y reintento completo; el error de transporte viene del envío real.
  Dieciséis fallos de escritura exigen 500 JSON sin envío ni cambios SQL, cierre
  del stream y reintento correcto. La apertura devuelve `EISDIR` real; `ENOSPC`
  se inyecta tras 64 bytes reales y deja un parcial huérfano (DT-PDF-01).
  El IGV de cargos en liquidación se incluye en el total y no se desglosa en el PDF.
  Correo, Telegram y proveedores externos:
  comprobar timeouts/fallos reales en suites específicas. La detección MIME real no equivale a
  probar todo el middleware de subida Multer.
- Montaje global de `src/app.ts`: 29 casos MariaDB de rutas representativas,
  sesión/roles, IP, CORS, Helmet, limitador real, errores y liquidación PEN/USD
  con rollback. Ver [montaje global y límites](../../docs/deuda-tecnica/20261008_integracion_montaje_global.md).
  La ejecución en Ubuntu ARM64 sigue fuera; arranque y compilación cuentan con
  la ampliación `runtime.test.ts` descrita abajo. Hay pruebas
  parciales anteriores en Jest para algunas de estas áreas; no se migraron aquí.
- La suite Vitest no cubre todas las funciones de los 21 archivos instrumentados
  ni representa un porcentaje global del repositorio.

## Uso durante una migración

El arranque del backend compilado ya incorpora dos casos en MariaDB mediante
`npm run test:runtime`: configuración/Prisma reales, HTTP, cierre y rechazo de
credenciales SQL. La matriz de integración total reúne 496 casos en 16 archivos;
esta ampliación ejecutó solo los dos nuevos. No certifica Linux ARM64 ni drenaje
de solicitudes durante el cierre. Ver [alcance y evidencia](../../docs/deuda-tecnica/20261008_regresion_backend_compilado.md).

1. En el estado previo: ejecutar `npm run test:vitest:typecheck`,
   `npx tsc --noEmit`, `npm run test:vitest:ci` y las suites correspondientes
   de Jest. Conservar el JUnit, resumen de cobertura y versiones de Node,
   dependencias y motor de BD del entorno.
2. Migrar un componente por vez. Repetir los mismos casos y añadir pruebas
   específicas para el comportamiento que cambie con esa migración.
3. Clasificar cualquier diferencia: defecto de migración, problema previo,
   limitación del entorno o cambio de regla aprobado. No actualizar importes
   esperados únicamente para hacer pasar la suite.
4. Antes de dar por validada una migración de Prisma/BD, completar las pruebas
   con MariaDB desechable. Usar nombres/credenciales exclusivos, rechazar URLs
   de producción y limpiar únicamente fixtures propios.
5. Subir cobertura y umbrales cuando se incorporen nuevos contratos; un
   porcentaje alto no sustituye permisos, saldos, cronología y errores reales.

- Login/refresco global: 36 casos MariaDB con bcrypt y JWT reales, menús,
  exp/iat, cambios de roles y cuotas. Regresiones para cuentas/credenciales activas,
  vigencia de 24 horas en producción y bloqueo del JWT anterior al retirar roles.
  Ver [correcciones y límites](../../docs/deuda-tecnica/20261008_correccion_autenticacion.md).
