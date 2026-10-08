# Recorrido conectado de factoring PEN/USD — 2026-10-08

`tests/mariadb/connectedFlow.test.ts` añade **10 pruebas**. Recorre servicios,
DAOs, Prisma y MariaDB reales desde archivos sintéticos hasta la liquidación.
No modifica servicios, fórmulas, permisos ni una matriz de transiciones.

## Preparación y secuencia

La preparación inserta exclusivamente usuarios/persona, empresas, pertenencia,
contactos, cuenta, líneas y catálogos financieros/estados. Comprueba que no
existan archivos, facturas, operaciones ni propuestas antes del recorrido.
No utiliza `seedApproval` ni `seedSettlement` para insertar una operación o
propuesta aceptada. Cada etapa posterior recibe IDs/resultados de la anterior.

1. Se crean XML y PDF sintéticos. El PDF proviene de PDFKit. Se entregan al
   servicio real de carga, con metadatos de archivo preparados por la prueba;
   este valida, copia al almacenamiento temporal exclusivo, registra los archivos
   y elimina las entradas temporales. No se ejecuta Multer en esta suite.
2. El servicio XML del empresario guarda factura, moneda de ítem y asociaciones
   con los UUID reales de los archivos. El XML tiene una cuota, neto 1 180 y
   moneda consistente PEN/USD; empresas preexistentes y líneas suficientes.
3. El servicio de creación genera operación y asociación con la factura. Se
   envía neto 1 para comprobar que toma el neto 1 180 de la factura real.
4. El servicio de historial cambia la operación a estado 3. Se crea propuesta
   en estado 3 usando el neto de la operación. Se releen cabecera y detalles.
5. El servicio de actualización disponibiliza la propuesta en estado 4. El
   empresario la aprueba mediante el servicio de aceptación: propuesta 6,
   operación 4, vínculo aceptado e historiales persistidos.
6. El servicio de historial registra inicio 36, fija fecha de inicio y vincula
   el PDF ya registrado. La liquidación usa esa fecha y esa propuesta aceptada.
7. Se guarda/relee liquidación y sus detalles, verificando importes, fecha,
   actor, suma firmada de detalles y conservación de las etapas anteriores.

Se comprueban historiales de operación `[1, 3, 4, 36]` y propuesta `[3, 4, 6]`,
con actor consistente. Esto caracteriza esta secuencia; no establece una matriz
obligatoria de origen/destino ni valida todas las transiciones disponibles.
La factura, la operación y la propuesta están relacionadas por sus PK/UUID
reales; no se sustituyen los resultados de cada etapa por fixtures.

## Oráculos y reloj

Se fija el instante de negocio en `2026-10-08T05:00:00Z`, inicio del día en Lima,
y vencimiento de propuesta en `2026-11-07T05:00:00Z`. Solo se controla Date y
Luxon para estos instantes; temporizadores y transacciones siguen reales. La
fecha de inicio se relee desde la columna existente `Timestamp(0)`.

Catálogo sintético: financiado 80%, tasa mensual 2%, comisión plana 1%, IGV 18%,
costo 15 PEN / 5 USD. La tarifa interbancaria se fija en cero para este recorrido,
independientemente del autoincremento del banco. No representa tarifas productivas
ni sustituye las pruebas existentes con costos interbancarios distintos de cero.

| Resultado | Esperado independiente |
| --- | --- |
| Neto de factura/operación | 1 180 |
| Financiado / garantía | 944 / 236 |
| Descuento propuesto a 30 días | 18,88 |
| Comisión / IGV de comisión | 11,80 / 2,12 |
| Adelanto PEN / USD | 893,50 / 905,30 |
| Pago en inicio, 0 días | Descuento 0; reintegro 18,88; saldo a favor 254,88 |
| Pago puntual, 30 días | Descuento 18,88; saldo a favor 236 |
| Pago con mora, 60 días, 30 de mora | Descuento 38,14; mora 19,26; IGV de mora 3,47; saldo a favor 213,27 |

Los valores esperados están fijados en los tests; no se obtienen llamando al
calculador probado para generar su propio oráculo. Se verifica adicionalmente
`total = monto + igv` en cada detalle y su suma con el factor del concepto.

## Diez casos y errores entre etapas

- Seis recorridos: PEN/USD × pago anticipado, puntual y con mora.
- Dos rechazos: propuesta aún no disponible. El intento de aprobación devuelve
  404 sin cambiar factura, operación, propuesta, vínculos o historiales previos.
- Dos fallos tardíos: trigger real en el segundo detalle de liquidación con mora.
  SQL revierte cabecera y primer detalle; las etapas previas confirmadas quedan
  idénticas. Se retira el trigger y se reintenta mediante el servicio real:
  queda una única liquidación completa.

Se comparan snapshots de 13 tablas. Los XML/PDF se conservan byte a byte al
terminar el recorrido. Las líneas mantienen usado 0 y disponible 1 180; no
se introduce reserva o consumo automático. El intento que falla no repite los
correos de creación, disponibilidad, aceptación e inicio: se verifica una
invocación de cada proveedor en el recorrido completo.

## Límites

Cada servicio conserva su propia transacción. Una etapa fallida no revierte
etapas previamente confirmadas: **no existe una transacción global del recorrido**.
El reintento probado sigue a un fallo con rollback completo, no certifica
deduplicación de una solicitud que ya terminó con éxito.

Se sustituyen únicamente configuración/conexión, logger, raíces de almacenamiento
y proveedores de correo/Telegram. El contenido de las notificaciones y la entrega
externa no se certifican aquí; los proveedores nunca envían mensajes reales.
Se conserva el límite previo de notificaciones dentro de la transacción.

Esta suite pasa por servicios: no es un recorrido de navegador ni por todos los
routers HTTP. La carga multipart, JWT y perfiles se validan en suites separadas.
No prueba PDFs generados de propuesta/liquidación, firma UBL/SUNAT, transferencias
bancarias, concurrencia de todo el recorrido ni Ubuntu ARM64. Los datos de
desarrollo/producción y los documentos históricos no se consultan ni modifican.

La deuda de archivos, transacción independiente del calculador y decisiones de
deduplicación permanecen documentadas, sin corrección autorizada ni programada.

## Repetir

```powershell
npm run test:integration:typecheck
npm run test:integration -- tests/mariadb/connectedFlow.test.ts
npm run test:integration
```

La ejecución específica aprobó los diez casos. La suite rápida no se modificó
ni se volvió a ejecutar en esta etapa.

La ejecución completa aprobó **325 casos en doce archivos, cero fallos**.
Comprobación de tipos aprobada. RunId `718b2eec7025870bf739dbf5`, MariaDB
11.4.10, estado `passed`, limpieza `removed`. La comprobación independiente
de Docker no encontró contenedores del runner. `git diff --check` sin errores
de whitespace. La ejecución completa incluye la conservación final de bytes
y actores añadida después de la ejecución específica.

Siguiente paso recomendado: probar generación y descarga de PDFs de propuesta
y liquidación, contrastando moneda, fechas e importes con los registros SQL y
verificando la limpieza del archivo generado.
