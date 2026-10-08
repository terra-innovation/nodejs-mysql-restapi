# Matriz de regresión de negocio antes de migraciones

Estado al 2026-10-08: 342 casos activos aprobados en Vitest rápido y 8 criterios
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
| Login | Password correcto/incorrecto/ausente; usuario inexistente; fallo de lectura; identidad y roles del JWT | bcrypt y JWT reales; notificación simulada |
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
  interrupción de escrituras y propagación de errores. El recálculo utiliza
  callbacks de transacción anidados; el mock tampoco certifica su aislamiento real.
  El [entorno exclusivo](../mariadb/README.md) ya tiene snapshot de desarrollo,
  comandos y 16 casos reales: 15 aprobados y 1 fallo de aprobación concurrente.
  Ya verifica XML, lectura, rollback SQL, permisos y aceptación secuencial.
  La carrera duplica aprobación, historiales y llamadas de notificación;
  [DT-IT-01/02](../../docs/deuda-tecnica/20261008_DT_integracion_MariaDB.md)
  documentan este defecto y la importación confirmada antes del enriquecimiento.
  Liquidación, transferencias y el recálculo siguen sin integración SQL real.
- Registro administrativo XML, asociación de facturas, aceptación del empresario
  y cambios de estado ya tienen casos de servicios y/o HTTP. Falta el recorrido
  completo por HTTP con MariaDB y la carga específica del empresario
  (duplicados, empresa, elegibilidad y creación de operación).
- Falta una matriz aprobada de transiciones origen/destino, si se requieren
  restricciones adicionales. Las pruebas comprueban existencia del estado destino
  y efectos actuales. La repetición secuencial de aprobación sí está probada
  en MariaDB; las aprobaciones simultáneas fallan el criterio de unicidad.
- PDF, correo, Telegram y proveedores externos: comprobar contenido/contratos,
  timeouts y fallos en suites específicas. La detección MIME real no equivale a
  probar todo el middleware de subida Multer.
- Montaje global de `src/app.ts`, filtros IP/CORS/rate limit, arranque, compilación
  y ejecución en Ubuntu ARM64 siguen fuera de esta ampliación. Hay pruebas
  parciales anteriores en Jest para algunas de estas áreas; no se migraron aquí.
- La suite Vitest no cubre todas las funciones de los 21 archivos instrumentados
  ni representa un porcentaje global del repositorio.

## Uso durante una migración

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
