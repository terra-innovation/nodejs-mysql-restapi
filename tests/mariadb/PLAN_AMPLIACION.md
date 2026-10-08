# Revisión de próximas pruebas de integración — 2026-10-08

Los tres bloques están implementados: 27 casos de estados/historial, 60 HTTP
administrativos/financieros y diez del recorrido conectado, sin reglas nuevas.
La evidencia anterior al bloque 1 era de 228 casos en nueve archivos, incluidos 83 HTTP.
Ver [alcance y validación del bloque 1](../../docs/deuda-tecnica/20261008_integracion_estados_historial_operacion.md).
La integración completa posterior aprobó 255 casos en diez archivos, sin fallos.
Después del bloque 2 aprobó 315 casos en once archivos, sin fallos; MariaDB
desechable eliminada y comprobación de tipos aprobada.
Después del bloque 3 aprobó 325 casos en doce archivos, sin fallos, con tipos
aprobados y contenedor eliminado. El siguiente bloque propuesto es PDF:
generación/descarga de propuesta y liquidación, valores frente a SQL y limpieza.

## Prioridades

| Orden | Ampliación | Cobertura existente y brecha | Valor de la siguiente implementación |
| --- | --- | --- | --- |
| 1, implementado | Estados e historial de la operación en MariaDB | 27 casos SQL reales complementan `factoringestado.business.test.ts` | Guardado/lectura, fecha de inicio, notificaciones simuladas y rollback de estado, historial y adjuntos |
| 2, implementado | HTTP administrativo/financiero de propuestas, liquidaciones y transferencias | 60 casos en `financialHttp.test.ts`; mantiene escritura administrativa y consulta financiera | Permisos, Yup, actor, importes, lectura, simulación sin escrituras y rollback SQL por HTTP |
| 3, implementado | Recorrido conectado PEN/USD | `connectedFlow.test.ts`: diez casos sin insertar resultados de negocio en el fixture | XML, operación, propuesta, disponibilidad, aprobación, inicio, liquidación; tres fechas de pago, rechazo y rollback/reintento |

## Primer bloque implementado: estados e historial

Servicio principal: `createFactoringhistorialestadoService` en
`src/services/admin/factoringhistorialestado.Service.ts`. Inserta historial,
actualiza operación, asocia archivos y realiza acciones para estados 29, 10 y 36.
El estado 36 fija `fecha_operacion`; esa fecha interviene en la liquidación.

Casos implementados:

1. Guardar y releer estado, comentario, historial, actor y dos adjuntos.
2. Estado 36: guardar fecha de inicio y verificar su lectura posterior, sin
   alterar fórmulas ni reinterpretar fechas civiles como instantes.
3. Estados 29/10/36: comprobar destinatarios y payloads de notificación con
   proveedores sustituidos; no enviar mensajes reales.
4. Operación, estado destino o adjunto inexistente: rechazo sin escrituras.
5. Fallos SQL en historial, actualización y segundo vínculo: rollback completo,
   manteniendo estado, fecha, registros y archivos previos.
6. Fallo del proveedor de notificación: comprobar rollback SQL actual. Una
   llamada al proveedor no demuestra atomicidad entre envío externo y commit.
7. Editar, activar y eliminar lógicamente un historial sin cambiar el estado
   actual de la operación; releer adjuntos y actor.

No se inventa una matriz de transiciones origen/destino. La repetición de
inicio y cambios simultáneos, si se incorporan, deben ser caracterización del
comportamiento actual; no exigir deduplicación ni protección nueva sin decisión.
El límite de notificaciones dentro de transacciones ya está documentado y no
autoriza una cola/outbox.

Archivo disponible: `tests/mariadb/operationState.test.ts`. Reutiliza guardas de
la base desechable y limpieza de vínculos en orden FK. Servicios, DAOs y SQL
siguen reales; se sustituyen proveedores de correo, logger y configuración/conexión.

Para repetir el bloque:

```powershell
npm run test:integration:typecheck
npm run test:integration -- tests/mariadb/operationState.test.ts
npm run test:integration
```

Los comandos están disponibles. Los bloques 2 y 3 también están implementados.

## Bloques siguientes

El bloque HTTP está disponible en `tests/mariadb/financialHttp.test.ts`:
recorrido PEN/USD, permisos, payload inválido, actor desde sesión y fallo SQL.
Ver [alcance y límites](../../docs/deuda-tecnica/20261008_integracion_HTTP_financiero.md).
No cubre todas las rutas de maestros, PDFs o correo ni cada combinación de rol
en PATCH/DELETE. Los perfiles mantienen permisos diferentes y SQL real.

El recorrido conectado está en `tests/mariadb/connectedFlow.test.ts`: importar
XML/PDF, crear operación, generar y disponibilizar propuesta, aprobarla, registrar
inicio y liquidar con servicios reales. Se preparan solo entradas/catálogos y
empresas. No se insertan directamente los resultados de las etapas. Se comprueban
lectura, vínculos, importes independientes e historiales. Cada servicio conserva
su transacción; no hay rollback global. Ver
[alcance](../../docs/deuda-tecnica/20261008_integracion_recorrido_conectado.md).

La transferencia es opcional en este bloque y usa constancia sintética; no
efectúa movimiento bancario. El contenido/descarga de PDFs ya cuenta con 104
casos en `pdfHttp.test.ts`: generador real, SQL real, PEN/USD, ambos perfiles,
permisos y limpieza, dos facturas vinculadas, anticipación/mora y 60 conceptos
con paginación y caracterización de concurrencia. Ver [alcance y límites PDF](../../docs/deuda-tecnica/20261008_integracion_PDF.md).
Nombres largos y veinte facturas ya cuentan con doce casos adicionales;
la propuesta reproduce una superposición nombre/RUC pendiente (DT-PDF-05).
Quedan pendientes otros volúmenes, interrupciones a mitad del cuerpo y escrituras
simultáneas sin coordinación. Las descargas del mismo
documento comparten temporal y una falla tras la limpieza de la otra (DT-PDF-04);
queda como deuda técnica diferida por decisión del usuario, sin corrección
autorizada ni programada. No se declara concurrencia segura.
Dieciséis cancelaciones TCP reales antes del cuerpo comprueban limpieza y
reintento completo, sin cambios SQL. Dieciséis fallos de escritura adicionales
comprueban rechazo de apertura y archivo parcial huérfano tras `ENOSPC` controlado
con 64 bytes reales: DT-PDF-01 sigue pendiente. El montaje global ya cuenta con 29 casos en
`appHttp.test.ts`, usando `src/app.ts` real. Ver [montaje global y límites](../../docs/deuda-tecnica/20261008_integracion_montaje_global.md).
Login y actualización de accesos tienen 36 casos con MariaDB real. Ver [correcciones y límites](../../docs/deuda-tecnica/20261008_correccion_autenticacion.md).
Se implementaron las tres correcciones autorizadas. El usuario resolverá las
sesiones antiguas mediante rotación de la clave JWT; no se rotó desde esta tarea.
El backend compilado incorpora dos casos de arranque, HTTP/Prisma, cierre y
conexión rechazada: [comando y límites](../../docs/deuda-tecnica/20261008_regresion_backend_compilado.md).
Siguiente paso: repetir estas regresiones en Linux ARM64 equivalente a producción.

La [deuda de archivos](../../docs/deuda-tecnica/20261008_DT_ciclo_vida_archivos.md)
queda documentada fuera de estas implementaciones. También se mantienen las
decisiones previas sobre líneas administrativas, transacción del calculador,
limpieza de archivos y deduplicación de liquidaciones/transferencias.
