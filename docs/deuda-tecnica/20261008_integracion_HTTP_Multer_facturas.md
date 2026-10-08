# Facturas: HTTP, Multer, disco y MariaDB reales — 2026-10-08

La suite reúne **83 pruebas** en `tests/mariadb/invoiceHttp.test.ts`, incluidas
tres para la frontera global de tamaño, 30 para JWT y sesiones sin roles válidos,
y 14 de eliminación lógica. La integración completa llega a **228 casos en nueve archivos**. No se modifican servicios,
permisos, fórmulas ni el límite documentado de la transacción del calculador.

## Recorrido real

1. POST `/api/v1/usuario/archivo/cargar`: multipart de un archivo con su código
   de tipo. Se ejecutan autenticación JWT, rol 5, Multer, filtros de extensión,
   detección real mediante `file-type`, catálogos SQL, copia y registro de archivo.
2. Se repite la carga para XML y PDF. El PDF sintético se genera con PDFKit.
3. POST de registro de factura con los UUID de ambos archivos:
   `/admin/factura/factor/subir` (rol 3 actual),
   `/financiero/factura/factor/subir` (rol 6) o
   `/empresario/servicio/factoring/factura/subir` (rol 3).
   Se ejecutan router, controlador, Yup, parser, servicios, DAOs y Prisma reales.
4. Se comprueban fechas, moneda de factura e ítems, importe, actor desde sesión,
   cuotas y asociaciones SQL. Se descargan ambos archivos por HTTP con rol 5 y
   se comparan byte a byte contra los originales. También se consulta la factura
   asociada a una operación por la ruta administrativa, con su rol 2 actual.

Los JWT se firman con una clave sintética exclusiva: se verifica realmente su
firma y formato, pero no se prueba el endpoint de login ni la emisión de tokens.
Los datos y el catálogo de tipos son sintéticos: XML/PDF, códigos de ocho caracteres,
extensiones con punto y límite de catálogo de 1 MiB. No certifica los valores del
catálogo productivo ni supone que todos los usuarios tienen los roles requeridos.

## Casos añadidos

| Cantidad | Alcance |
| --- | --- |
| 6 | Carga, registro y descarga completos, tres endpoints por PEN/USD; actor del body no suplanta al de sesión |
| 1 | Consulta HTTP de facturas por operación y permiso de lectura |
| 5 | Sin sesión, formato inválido, token inválido, firma incorrecta y rol sin permiso antes de guardar archivos |
| 30 | Seis sesiones rechazadas en carga, tres endpoints de registro y descarga: JWT expirado, sin usuario, roles ausentes/nulos/vacíos/desconocidos; cero efectos nuevos y contenido previo intacto |
| 14 | Eliminación lógica XML/PDF, permisos, identificadores inválidos/inexistentes, archivos vinculados, otro usuario, repetición y rollback SQL; conservación del contenido y descarga posterior |
| 9 | Archivo ausente, campo equivocado, dos archivos, campo extra, extensión bloqueada, PDF sin firma, PNG disfrazado de PDF, tipo desconocido y tamaño de catálogo excedido |
| 3 | Frontera global de Multer: 20 MiB menos un byte, exactamente 20 MiB y un byte más; persistencia y contenido aceptados, limpieza del rechazo y conservación de cargas previas |
| 3 | Roles incorrectos o sin sesión en cada endpoint de registro; conserva los archivos cargados y no crea factura |
| 10 | Identificadores ausentes/inválidos, archivo inexistente, XML/PDF intercambiados, XML mal formado, otra estructura/clase, moneda ausente, fallo SQL tardío al vincular PDF y empresario no elegible |
| 2 | Caracterización de archivos huérfanos ante fallo SQL o rechazo del formulario antes de invocar el servicio |

Los rechazos de registro no dejan cabecera, ítems, notas, impuestos, términos,
medios de pago ni asociaciones parciales. Los archivos cargados previamente sí
conservan sus registros y contenido: carga y registro de factura son peticiones
y transacciones distintas. Esto no representa una transacción única de toda la
secuencia HTTP y no convierte esos archivos registrados en huérfanos.

## Limitaciones conocidas del comportamiento actual

> **Advertencia:** el rollback de MariaDB no revierte los archivos copiados en
> disco. En los dos escenarios descritos abajo, una petición rechazada puede
> dejar un archivo sin registro asociado. Si se repiten estos errores, esos
> archivos pueden acumularse y ocupar espacio. Las pruebas reproducen esta
> limitación; no demuestran que existan residuos en producción ni que se hayan
> perdido archivos válidos.

Por decisión del usuario, DT-HTTP-01/02 quedan **documentados como limitaciones
conocidas, sin corrección autorizada ni programada**. Se mantiene el comportamiento
actual y sus pruebas de caracterización. No se ejecuta limpieza del almacenamiento
existente ni se modifican servicios, permisos o reglas de negocio.

### DT-HTTP-01 — Copia final sin registro al fallar el INSERT de archivo

`cargarArchivoService` copia el contenido a `success` antes de insertar la fila.
Si el INSERT falla, MariaDB revierte el registro y se elimina el temporal, pero
la copia final permanece sin fila de archivo. La prueba provoca un fallo SQL
real y comprueba: respuesta 500, cero filas, cero temporales y una copia final.

### DT-HTTP-02 — Temporal al rechazar campos en el controlador

Multer ya guardó el archivo cuando Yup rechaza un `archivotipo_code` cuya longitud
es inválida. El servicio de carga no llega a ejecutarse y su limpieza no se aplica.
La prueba comprueba: respuesta 400, cero filas, cero copias finales y un temporal.

Ambos casos son pruebas de caracterización del comportamiento vigente. No se
implementa corrección ni se presentan los archivos de disco como cubiertos por
rollback SQL. Las carpetas sintéticas se eliminan al terminar cada prueba, por
lo que estos casos no dejan residuos en el almacenamiento de la aplicación.

Una eventual revisión de la limpieza requerirá una solicitud posterior. Deberá
conservar los archivos de cargas previas válidas: no corresponde borrar archivos
del almacenamiento existente solo por estos hallazgos de pruebas sintéticas.

## Ejecución

```powershell
npm run test:integration -- tests/mariadb/invoiceHttp.test.ts
npm run test:integration -- tests/mariadb/invoiceHttp.test.ts -t "JWT expirados y sesiones sin roles válidos"
npm run test:integration -- tests/mariadb/invoiceHttp.test.ts -t "Eliminación de archivos por HTTP"
npm run test:integration:typecheck
npm run test:integration
```

Se montan los routers reales en una aplicación Express de prueba y se usa
Supertest. La única sustitución de almacenamiento cambia las raíces a un
directorio temporal validado; las funciones de rutas y la E/S siguen reales.
Se sustituyen configuración local, logger, Telegram y el cliente de conexión
por el Prisma real de la base desechable verificada. No se simulan DAOs, servicios,
JWT, Multer, `file-type`, filesystem, respuestas HTTP ni transacciones.

Los fallos SQL se inducen con triggers temporales. La limpieza elimina fixtures,
triggers y archivos sintéticos; el runner elimina la instancia MariaDB 11.4.10.
Los reportes se guardan en `coverage/mariadb/`. La suite rápida no cambió y no se
volvió a ejecutar en esta etapa.

Evidencia previa, antes de añadir la frontera de tamaño: **181 casos aprobados en nueve archivos, cero
fallos**, con tipos de integración aprobados. RunId `6194733f58c0ebc563f69d2f`,
estado `passed`, limpieza `removed`. Se confirmó que no quedaron contenedores
con la etiqueta del runner. `git diff --check` no detectó errores de whitespace.

Ejecución posterior con la frontera global: **184 casos aprobados, nueve archivos,
cero fallos**. Tipos de integración aprobados. RunId `29c77395bbaa6c6a10b679db`,
estado `passed`, limpieza `removed`; se confirmó que no quedaron contenedores
del runner. No se modificaron límites del middleware ni servicios productivos.

Ejecución con los 30 casos de autenticación: **214 casos aprobados en nueve
archivos, cero fallos**. Tipos de integración aprobados. RunId
`6db8846a435a1e9011d39124`, estado `passed`, limpieza `removed`; comprobación
independiente de Docker sin contenedores del runner. La ejecución específica de
autenticación aprobó 30 casos (39 omitidos por el filtro), y la completa aprobó
los 69 casos HTTP junto con las otras ocho suites. `git diff --check` sin errores.

Ejecución con eliminación: **228 casos aprobados en nueve archivos, cero fallos**,
incluidos los 83 HTTP. Tipos de integración aprobados. RunId
`5ffb60e53f4c0f1d44ccb063`, estado `passed`, limpieza `removed`; Docker confirmó
que no quedaron contenedores del runner. `git diff --check` sin errores.
La primera ejecución específica aprobó 13 casos y falló al crear el segundo
usuario por reutilizar el `hash` único del fixture; se corrigió ese dato sintético.
La ejecución completa posterior aprobó los 14 casos de eliminación. No se cambió
código productivo, ni se volvió a ejecutar la suite rápida en esta etapa.

## Pendientes

DT-HTTP-01/02 permanecen como limitaciones conocidas, sin trabajo de corrección
programado. La transacción independiente del calculador conserva el mismo estado.

La frontera global de 20 MiB ya se probó con archivos sintéticos reales enviados
por HTTP. El catálogo de pruebas se elevó a 32 MiB solo para esos tres casos,
para aislar el límite global de Multer; la configuración del sistema no cambió.

| Bytes del archivo | Respuesta actual | Persistencia |
| --- | --- | --- |
| 20 971 519 (20 MiB menos un byte) | 200 | Un registro y una copia final con tamaño y hash SHA-256 idénticos; sin temporal |
| 20 971 520 (exactamente 20 MiB) | 400, Archivo demasiado grande | Sin nuevo registro, temporal ni copia final; carga válida previa intacta |
| 20 971 521 (un byte más) | 400, Archivo demasiado grande | Sin nuevo registro, temporal ni copia final; carga válida previa intacta |

**Límite conocido de frontera:** Busboy, usado por Multer, emite el evento `limit`
al alcanzar `fileSize`. En la versión instalada el máximo aceptado es menor que
20 MiB, aunque la configuración sea `20 * 1024 * 1024`. No se cambió ese
comportamiento para hacer inclusivo el límite. Se mide el contenido del archivo,
no el tamaño total de la petición multipart. La limpieza correcta de estos
rechazos no elimina las limitaciones DT-HTTP-01/02 de otras etapas.

### JWT expirados y sesiones sin roles válidos

Los 30 casos usan firmas reales con la clave sintética. El token expirado contiene
los roles necesarios y `exp: 1`, para aislar su expiración sin esperar ni modificar
el reloj de JWT. Responde 401; un token firmado sin `usuario` responde 401.
Sesiones con roles ausentes, nulos, vacíos o un rol desconocido responden 403.
Cada respuesta verifica también el mensaje del middleware.

En la carga multipart no se generan archivos temporales/finales ni filas SQL.
En los tres registros de factura se conservan las filas de archivos y sus hashes
SHA-256; no se insertan filas en las siete tablas de factura. En descarga se devuelve
el error JSON sin cabecera de adjunto y se conserva el archivo previo. Ninguno de
estos rechazos activa notificaciones de excepción. No cambió código productivo.

Este alcance cubre las formas de sesión descritas; no valida cualquier payload
mal formado, la revocación de tokens ni la actualización de roles tras emitirlos.

### Eliminación por HTTP: contrato y límites vigentes

DELETE `/api/v1/usuario/archivo/eliminar/:id` exige JWT válido y rol 5. Los 14
casos comprueban rechazo sin sesión, rol ajeno, token expirado, roles vacíos o
firma inválida, sin alterar registros ni bytes. Identificador de longitud inválida
responde 400; UUID inexistente responde 404, conservando las cargas previas.

XML y PDF válidos responden 204 sin cuerpo. El DAO actualiza `estado = 2`,
`idusuariomod` desde la sesión y `fechamod`; no elimina la fila ni el archivo.
El actor enviado en el body no sustituye al de la sesión. La repetición devuelve
204 y conserva una fila y una copia. Un trigger real BEFORE UPDATE provoca 500:
la fila queda activa e idéntica a la previa, y el contenido sigue descargándose.

> **Advertencia — DT-HTTP-03, alcance de la eliminación lógica:** un archivo
> marcado como eliminado permanece en disco y sigue descargándose con rol 5.
> Esto no equivale a borrado físico ni a retirada del acceso al contenido. La
> consulta de descarga no filtra `estado`.

> **Advertencia — DT-HTTP-04, pertenencia:** cualquier sesión válida con rol 5
> puede eliminar lógicamente el archivo de otro usuario si conoce su UUID. El
> servicio no compara el actor con `idusuariocrea`. La prueba usa dos usuarios
> sintéticos distintos y verifica que el creador se conserva y el modificador
> pasa a ser el segundo usuario. El UUID no sustituye una comprobación de acceso.

> **Advertencia — DT-HTTP-05, vínculos:** XML y PDF asociados a una factura
> también admiten eliminación lógica. Las siete tablas de factura, el vínculo,
> el otro archivo y los bytes permanecen intactos; la descarga sigue disponible.
> No existe un bloqueo en este endpoint por estar asociado a una factura.

Estos son límites del comportamiento vigente, reproducidos con pruebas de
caracterización; no son nuevas políticas aprobadas ni correcciones implementadas.
No certifican quién dispone de rol 5 en producción ni una exposición sin sesión.
No se eliminan archivos productivos ni se cambia la autorización actual.

Por solicitud del usuario, las decisiones de pertenencia, descarga tras baja y
protección de vínculos quedan como [deuda técnica pendiente de definición](20261008_DT_ciclo_vida_archivos.md),
sin implementación autorizada ni programada. Se conservan DT-HTTP-03/04/05.

La [revisión de nuevas pruebas](../../tests/mariadb/PLAN_AMPLIACION.md) prioriza
estados/historial de la operación con MariaDB real, después HTTP financiero y
un recorrido conectado del negocio. No requiere resolver esa deuda de archivos.

Quedan fuera el arranque completo de la aplicación, login, CORS, rate limiting,
escaneo antivirus, validación XSD/firma tributaria,
carga masiva, proveedores externos y ejecución en Ubuntu ARM64. El XML se trata
como formato sin firma binaria; su aceptación inicial no certifica validez UBL.
La idempotencia de liquidaciones/transferencias sigue pendiente de decisión.
