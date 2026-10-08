# Integración de PDFs de propuesta y liquidación

## Alcance implementado

`tests/mariadb/pdfHttp.test.ts` incorpora 104 casos con MariaDB 11.4.10:

- Ocho descargas reales: administrador/financiero, propuesta/liquidación y PEN/USD.
  Comprueba firma PDF, lectura de páginas, MIME, nombre de descarga, moneda,
  fechas y filas de neto, financiado y garantía contra registros SQL. En propuesta
  compara descuento, IGV y adelanto; en liquidación, descuento efectivo y total.
  Cada documento identifica las dos facturas vinculadas (`F001-123`, `F002-987`)
  exactamente una vez. Sus importes netos SQL suman los 20 000 de la operación.
- Dos liquidaciones con saldo por cobrar y cuentas bancarias sintéticas.
- Ocho liquidaciones por pago anticipado/mora: PEN/USD, administrador/financiero.
  Compara fechas, días, descuento real, reintegro/interés y saldo contra SQL y
  valores independientes del calculador/generador. No deben aparecer filas de
  mora en anticipación ni de reintegro en mora. Para estas entradas, descuento
  real/reintegro/saldo anticipado = 0/320/4320; mora = 646.40 de descuento real,
  326.40 adicionales y saldo 3614.85.
- Cuatro documentos con 60 conceptos adicionales: propuesta/liquidación, PEN/USD.
  Exige varias páginas, cada concepto una vez con su monto SQL, último concepto
  y total en la última página, y pie después del total. Verifica coordenadas de
  texto dentro del papel A4; no equivale a una detección universal de solapamientos.
- Doce rechazos de sesión ausente, rol ajeno o token expirado.
- Cuatro solicitudes de documentos inexistentes, sin archivo ni escrituras.
- Cuatro fallos de entrega después de generar: respuesta 500 y temporal eliminado.
- Dos fallos posteriores a la generación: caracterización del temporal huérfano.
- Doce concurrencias del mismo documento: propuesta/liquidación, PEN/USD y
  administrador/administrador, financiero/financiero, administrador/financiero.
  Caracterizan la colisión del temporal: primera respuesta PDF completa y
  segunda respuesta de error. No son criterios de aceptación de una descarga
  concurrente correcta. Ver DT-PDF-04.
- Cuatro controles con documentos distintos, PEN/USD: administrador y financiero
  descargan simultáneamente, con rutas diferentes, ambas respuestas PDF completas
  y limpieza independiente. No hay cambios SQL durante las descargas.
- Ocho descargas con nombres largos de cedente/pagador y veinte facturas:
  propuesta/liquidación, PEN/USD y ambos perfiles. Exigen nombres completos,
  cada factura una vez, sumas e importes frente a SQL y limpieza del temporal.
- Cuatro diagnósticos de DT-PDF-05 en propuesta: confirman la superposición
  actual y comprueban que el criterio deseado de ausencia de superposición falla.
  Son pruebas normales; solo se captura la aserción visual prevista, sin ocultar
  errores de preparación, descarga o lectura. Su aprobación no certifica diseño correcto.
- Dieciséis cancelaciones TCP reales: propuesta/liquidación, ambos perfiles,
  PEN/USD, antes de cabeceras o tras cabeceras antes del cuerpo. El cliente
  destruye su conexión; el envío real rechaza con `ECONNABORTED`. Se comprueban
  limpieza del temporal, ausencia de cambios SQL y reintento con PDF completo.
- Dieciséis fallos de escritura: propuesta/liquidación, ambos perfiles y PEN/USD.
  Ocho aperturas rechazadas por un directorio bloqueador exclusivo (`EISDIR`),
  sin PDF creado; ocho errores controlados `ENOSPC` tras escribir 64 bytes reales.
  Todos exigen 500 JSON, ausencia de envío y de cambios SQL, cierre del stream
  y reintento con PDF completo. Los archivos parciales huérfanos caracterizan
  DT-PDF-01; no son un resultado de limpieza correcto.

Routers, middleware de sesión/roles, controladores, servicios, DAOs, Prisma,
PDFKit y filesystem son reales. Se sustituyen configuración/conexión, logger,
Telegram y raíz de almacenamiento. El logo real se copia en un `mkdtemp`
exclusivo; las pruebas no escriben en el almacenamiento del backend.
La entrega fallida se inyecta en `sendFileAsync`, después de comprobar que existe
el archivo generado; no simula una desconexión TCP real.
Las cancelaciones tienen pruebas separadas con `node:http` y un servidor local
en puerto efímero. Se coordina el punto de entrega en `sendFileAsync`, se espera
el cierre real de la respuesta y luego se delega al helper original. No se inyecta
el error de transporte ni se sustituye `res.sendFile`. En el segundo punto se
envían cabeceras reales con `flushHeaders`; el cliente observa 200 antes de
cerrar, pero no recibe un PDF completo. Un 200 observado no prueba una descarga
completa. Estas pruebas no cubren interrupción a mitad de los bytes del cuerpo.
Todas las barreras tienen timeout; conexiones y servidor se cierran en `finally`.
En fallos de escritura se sustituye exclusivamente `fs.createWriteStream`:
sin fallo activado delega sin cambios. Para apertura se crea un directorio
vacío en la ruta exclusiva del PDF y el sistema operativo rechaza abrirlo.
Para escritura parcial se conserva el WriteStream real con apertura, cierre y
escrituras físicas reales; un adaptador `fs.write` limita a 64 bytes y devuelve
`ENOSPC` en la siguiente escritura. No se llena el disco ni se simula el servicio,
el generador, PDFKit o el error HTTP. El código `ENOSPC` es inyectado: no prueba
agotamiento físico del disco. Se espera `close` antes de leer o reintentar.
En concurrencia, la sustitución de `sendFileAsync` solo introduce barreras y
delega al helper original: Express y `res.sendFile` envían realmente los bytes.
Las barreras tienen timeout y se liberan también si falla una aserción; se espera
el cierre de todas las solicitudes antes de limpiar fixtures. Los tests de
documentos distintos leen sus entradas reales, pero el segundo de propuesta
es fixture SQL de lectura; el segundo de liquidación se crea mediante servicio.

La preparación inserta dos facturas y sus vínculos como entradas SQL, crea una
propuesta mediante el servicio real y fija su vínculo
aceptado como entrada para probar documentos. No representa un recorrido de
aprobación conectado; ese recorrido tiene su propia suite. Las tablas consultadas
se comparan antes/después de la descarga para comprobar ausencia de escrituras.
La limpieza de fixtures y del directorio exclusivo se ejecuta después de cada caso,
incluidos los que caracterizan archivos huérfanos.

En paginación, los 60 conceptos exentos de propuesta se insertan directamente
como fixture SQL de lectura: su API no admite conceptos libres. Se actualizan
gasto exento y adelanto por los mismos 600 adicionales para conservar coherencia.
Las filas y encabezados no prueban su creación por la API de propuesta. En
liquidación se pasan los 60 conceptos al servicio real (600 adicionales sin IGV).
El caso de cargo 5000 afecto a IGV más estos conceptos produce 2500 por cobrar
y comprueba que las cuentas de pago aparezcan en la última página.

## Cómo repetir

```powershell
npm run test:integration:typecheck
npm run test:integration -- tests/mariadb/pdfHttp.test.ts
npm run test:integration -- tests/mariadb/pdfHttp.test.ts -t "cancelación TCP"
npm run test:integration -- tests/mariadb/pdfHttp.test.ts -t "fallo de escritura"
npm run test:integration
```

Requiere Docker Desktop con motor Linux. El runner restaura únicamente la
estructura inicial versionada en una base desechable identificada por ejecución;
no consulta desarrollo ni producción. Los resultados se guardan en
`coverage/mariadb/last-run.json` y `junit.xml`.

Dieciséis muestras sintéticas se conservan intencionalmente en
`coverage/mariadb/pdf-samples/`: cuatro básicas, cuatro liquidaciones de
anticipación/mora, cuatro documentos multipágina y cuatro con nombres largos
y veinte facturas, todos PEN/USD. Son evidencias
locales ignoradas por Git, separadas de los temporales de descarga. Para revisar
la presentación, abrir esos PDFs después de ejecutar la suite. La comprobación
automática extrae texto; no certifica por sí sola el diseño visual.

Se añadió `pdfjs-dist@5.5.207` como dependencia exacta de desarrollo para leer
los PDFs. Su requisito Node >=20.19.0 admite el Node 20.20.2 del proyecto.
Se eligió una versión fuera del rango >=5.6.83 <6.2.108 afectado por
[GHSA-hq66-cqwq-w95j](https://github.com/advisories/GHSA-hq66-cqwq-w95j).
La auditoría del 2026-10-08 no registra un hallazgo en `pdfjs-dist`; conserva
78 hallazgos globales (6 bajos, 11 moderados, 58 altos y 3 críticos), cuya
resolución no forma parte de esta ampliación. No se aplicó `audit fix`.

## Límites y deuda técnica

Validación inicial del 2026-10-08: comprobación de tipos aprobada, 32/32 casos PDF y
357/357 casos de integración en trece archivos. Ejecución completa
`4969ce349c9811d5686313e2`: `passed`, `cleanup: removed`; sin contenedores
restantes con la etiqueta `ft.backend.integration.run`. Se renderizaron y revisaron las
cuatro muestras PEN/USD (una página cada una), legibles y sin recortes ni
superposiciones. La revisión manual corresponde a esas entradas sintéticas;
no era una regresión visual automatizada ni cubría paginación.

Ampliación del 2026-10-08: comprobación de tipos aprobada, 44/44 casos PDF y
369/369 casos de integración en trece archivos. Ejecución completa
`d0bd0b5c9fed2cba7d357a54`: `passed`, `cleanup: removed`; ningún contenedor
restante con la etiqueta de integración. Se renderizaron las doce muestras
y se revisaron sus veinte páginas: ocho documentos de una página y cuatro de
tres páginas. Las filas, totales y pies permanecen legibles, sin recortes ni
superposiciones en esas entradas. No se modificó código de producción ni
dependencias en esta ampliación. Los límites anteriores se conservan y se
documenta DT-PDF-03, observado al revisar los cargos con IGV.

Concurrencia del 2026-10-08: comprobación de tipos aprobada, 60/60 casos PDF y
385/385 casos de integración en trece archivos. Ejecución
`934d72340e1e379210154348`: `passed`, `cleanup: removed`; ningún contenedor
restante con la etiqueta de integración. Los 16 casos nuevos incluyen doce
caracterizaciones de DT-PDF-04 y cuatro controles correctos. Estos resultados
registran la interferencia existente; no afirman que haya sido corregida.
Se modificaron solo pruebas y documentación, sin cambios de producción ni
dependencias. Los informes JUnit y `last-run.json` quedan disponibles localmente.

Textos largos y veinte facturas, 2026-10-08: comprobación de tipos aprobada,
72/72 casos PDF y 397/397 casos de integración en trece archivos. Ejecución
`4d9594f3559bec04987fe0fa`: `passed`, `cleanup: removed`; ningún contenedor
restante con la etiqueta de integración. Los doce casos nuevos incluyen ocho
comprobaciones de contenido y cuatro diagnósticos del criterio visual incumplido.
DT-PDF-04 continúa diferida y DT-PDF-05 permanece sin corregir. Esta ampliación
solo modifica pruebas y documentación; no modifica producción ni dependencias.

Cancelaciones TCP, 2026-10-08: comprobación de tipos aprobada, 16/16 casos
nuevos en ejecución focalizada y 88/88 PDF dentro de 413/413 casos de integración
en trece archivos. Ejecución `da0d2619e7baa9e2342c4b27`: `passed`,
`cleanup: removed`. No se cambió producción ni dependencias.
La desconexión y el error de envío son reales; solo se coordina el instante
de entrega. El cliente que cancela no recibe una respuesta completa; el reintento
sí exige un PDF completo y legible. No certifica abortos a mitad del cuerpo.

Fallos de escritura, 2026-10-08: comprobación de tipos aprobada, 16/16 casos
nuevos focalizados y 104/104 PDF dentro de 429/429 casos en trece archivos.
Ejecución `3e34832fbdb1ce118edfe6a8`: `passed`,
`cleanup: removed`; sin contenedores restantes con la etiqueta
de integración. No se modificó producción ni dependencias. La primera ejecución
focalizada detectó un error del fixture al retirar el directorio bloqueador;
se corrigió usando retirada de directorio vacío, sin relajar aserciones.
La validación final conserva el fallo de limpieza parcial como DT-PDF-01.

**DT-PDF-01 — Archivo temporal si falla la generación antes del `finally`.**
Los controladores esperan el servicio generador antes de entrar en el bloque de
entrega/limpieza. La prueba genera un PDF completo con el método real y luego
inyecta un error antes de que el servicio devuelva su ruta. La respuesta es 500,
SQL no cambia y el PDF queda en disco. Eso no demuestra que todo error
del generador se comporte igual; demuestra que la protección actual no cubre ese
punto. La limpieza SQL no garantiza limpieza de filesystem. No se modifica
producción ni se adopta una política automática de eliminación en esta entrega.

Ampliación de DT-PDF-01: el error de apertura `EISDIR` rechaza con 500 sin
crear un PDF; el directorio bloqueador es una entrada de la prueba, retirado
por ella antes del reintento. Un error `ENOSPC` controlado después de 64 bytes
físicos deja un archivo que empieza por `%PDF-` pero no contiene `%%EOF`.
Ambos perfiles y documentos retornan 500 JSON y no intentan entregar el archivo.
La base de datos conserva su snapshot. La prueba espera el cierre del descriptor:
no es un archivo pendiente de escritura observado demasiado pronto.

Con el fallo retirado y el mismo reloj/documento, el reintento sobrescribe el
parcial, entrega un PDF completo legible y elimina el temporal. Eso no equivale
a una política de limpieza: sin reintento el parcial permanece. Al finalizar
cada prueba se limpia su workspace exclusivo, sin tocar almacenamiento real.
La futura corrección debe proteger también la fase de generación y retirar
solo el archivo propiedad de esa solicitud, conservar el error original y
seguir coordinada con la deuda de aislamiento DT-PDF-04. No se implementó aquí.

**DT-PDF-02 — Propuesta inexistente devuelve 500.**
Ambos perfiles devuelven 500 al descargar una propuesta inexistente. El DAO
`getFactoringpropuestaByFactoringpropuestaid` accede a
`factoring_propuesta_financieros` sobre el resultado nulo y transforma el error
en 500, antes del 404 previsto por el servicio. La liquidación inexistente sí
devuelve 404. Los casos registran explícitamente esta diferencia como límite
actual, no como contrato recomendado. No se corrigió ni se relajó una regla
de negocio para conseguir aprobación de las pruebas.

**DT-PDF-03 — IGV de cargos no desglosado en liquidación.**
El generador imprime `financiero.monto` por concepto; no añade una fila para
`financiero.igv`, aunque el saldo calculado y persistido incorpora ese impuesto.
En la muestra con mora, garantía 4000 menos cargo 326.40 menos IGV 58.75 produce
el saldo SQL 3614.85; el detalle visible muestra 4000 y 326.40, sin el IGV.
En la muestra multipágina, garantía 4000 menos cargo 5000, IGV 900 y conceptos
exentos 600 produce 2500 por cobrar. El PDF muestra los montos de cargos y ese
total correcto frente a SQL, pero el detalle visible no basta para reconstruirlo.
Se documenta una limitación de desglose, no un cambio de fórmula ni una
corrección realizada. Las pruebas comparan los totales actuales con SQL y
valores independientes; no certifican que el desglose tributario sea completo.

**DT-PDF-04 — Descargas del mismo documento comparten temporal.**
Estado: **deuda técnica pendiente; corrección diferida por decisión del usuario**.
No está autorizada para implementación ni programada dentro de la ampliación
de pruebas. Se mantienen las caracterizaciones actuales del fallo.

Alcance propuesto para una futura corrección: temporal exclusivo por solicitud
en ambos perfiles y tipos de documento, conservando nombre público, contenido,
permisos, fórmulas y respuestas de descargas individuales. Cada solicitud debe
limpiar únicamente su archivo, también ante error de entrega. La limpieza no
debe ocultar el error original. No incluye DT-PDF-01/02/03 ni datos históricos.

Criterios de aceptación futuros: dos solicitudes solapadas del mismo documento
deben recibir 200 con PDF completo y correcto, rutas temporales diferentes,
sin escrituras SQL ni temporales restantes. Comprobar administrador/administrador,
financiero/financiero y perfiles mixtos en PEN/USD; conservar controles de
documentos distintos. Las caracterizaciones se convertirán entonces en pruebas
de regresión. Hasta aprobar esa corrección no se exige ese resultado como regla
ya implementada.

Los servicios de ambos perfiles construyen el nombre con fecha/minuto,
tipo de documento, RUC y código. Dos solicitudes del mismo documento en ese
minuto obtienen la misma ruta. Las pruebas fijan el reloj y mantienen la primera
solicitud pendiente de entrega mientras la segunda genera sobre la misma ruta.
Después permiten enviar la primera: sus bytes coinciden exactamente con el
archivo completo y se puede leer el PDF. Al terminar, su controlador borra el
temporal. La segunda intenta enviar el archivo ya borrado y el helper real
falla con `ENOENT`.

Resultado reproducido: 200 en la primera descarga; 404 en la segunda si su
perfil es administrador, 500 si es financiero. Administración comprueba
existencia antes de borrar; financiero llama `unlink` incondicionalmente en
`finally`, y ese segundo error reemplaza el 404 del envío por 500. La base
permanece sin cambios y no queda un archivo, pero una solicitud válida falla.
Por tanto, que las pruebas de caracterización pasen no significa que la
concurrencia esté resuelta. No se corrigió producción en esta entrega.

El control de documentos distintos demuestra dos rutas y dos respuestas
correctas. Las pruebas cubren una intercalación determinista de solicitudes
solapadas, no todas las intercalaciones de escritura/stream ni una carga masiva
sin coordinación. SQL, generador y envío se mantienen reales; solo se controla
el orden de entrega. No se simula el error `ENOENT`: lo provoca la limpieza real.

**DT-PDF-05 — Nombre largo de empresa superpuesto con el RUC en propuesta.**
Estado: deuda técnica pendiente; no se modificó el generador de producción.
En `src/utils/document/PDFgenerator.ts`, la posición vertical del RUC avanza
17 puntos desde el nombre, sin incorporar la altura real del texto envuelto.
Con nombres de aproximadamente 190 caracteres, el nombre ocupa tres líneas
y el RUC se imprime sobre una de ellas. Se reproduce en PEN/USD y ambos perfiles.
El texto extraído permanece completo: comprobar solo contenido no detecta este defecto.

Las pruebas comparan las cajas de texto del nombre y el RUC y caracterizan la
intersección actual. Los cuatro diagnósticos verifican de forma acotada que
la aserción de ausencia de intersección incumple el criterio deseado. No certifican
una presentación corregida ni sustituyen una comprobación universal de diseño.
Se renderizaron las cuatro muestras nuevas y se revisaron sus ocho páginas:
las propuestas muestran la superposición; las liquidaciones conservan nombres,
facturas y totales legibles. Las veinte facturas y los importes se conservan
en ambos documentos, distribuidos en dos páginas por muestra.

Alcance propuesto futuro: calcular la altura real del nombre antes de colocar
RUC y las filas siguientes, conservando contenido y fórmulas. Criterios futuros:
ninguna intersección nombre/RUC en ambos perfiles y monedas, textos completos,
facturas e importes conservados y revisión visual de nombres cortos y largos.
La preparación de veinte facturas es una entrada SQL sintética coherente;
no prueba su registro por XML. La propuesta se crea mediante el servicio real.

Pendientes de cobertura: otros volúmenes de facturas, conceptos/cargos y saltos de página, escritura simultánea
sin barreras de coordinación, cancelación a mitad del cuerpo del PDF,
otras formas de fallo de escritura/stream (permisos reales, disco físicamente
lleno, cierre fallido) y verificación en Ubuntu ARM64.
La paginación actual cubre 60 conceptos adicionales y veinte facturas con nombres largos;
no certifica cualquier longitud de texto o cualquier cantidad de filas.

DT-PDF-04 permanece como deuda diferida. El montaje global de la aplicación
ya tiene cobertura representativa; ver [alcance y límites](20261008_integracion_montaje_global.md).
