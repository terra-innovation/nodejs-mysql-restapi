# Entorno exclusivo de integración con MariaDB

Preparación: 2026-10-08. Fuente autorizada: la URL
`PRISMA_DATABASE_FACTORING_URL` de `.env.development`.
Destino: contenedor independiente `mariadb:11.4.10`, versión de producción
declarada por el usuario. El Compose antiguo de MySQL se conserva y no se usa.
Prisma continúa siendo el ORM; `provider = "mysql"` es también el conector de
MariaDB en Prisma y no significa que el servidor de estas pruebas sea MySQL.

## Fuente y estructura inicial

`schema/baseline.json` contiene el DDL obtenido con `SHOW CREATE TABLE` de
las 127 tablas de desarrollo (MariaDB 11.4.2), el charset/collation de su
base, SQL mode, fecha y hash SHA-256 del DDL. Se conserva como archivo
versionable. El hash verifica integridad; no sustituye la revisión de cambios.

Se usa el paquete `mariadb` ya instalado para leer metadatos y preparar tablas.
Las comprobaciones incluyen además el cliente Prisma generado real.
No se instaló otro ORM ni se ejecuta `prisma-sync`, `db push` o migraciones
contra desarrollo. No se alteró ningún archivo `.env`.

La exportación:

- Lee explícitamente `.env.development`, sin utilizar una URL heredada del shell.
- No consulta registros de negocio ni exporta contraseñas, usuarios de MariaDB,
  permisos, host o nombre de la base. Solo estructura y metadatos descritos arriba.
- Elimina los contadores de AUTO_INCREMENT de las opciones de tabla para empezar
  con IDs propios; conserva defaults, columnas, comentarios, índices y relaciones.
- Compara dos lecturas de DDL y rechaza cambios observados durante la exportación.
  Evitar modificaciones de esquema durante el proceso; no equivale a un backup
  transaccional del DDL.
- Rechaza vistas, triggers, rutinas, eventos y relaciones con otras bases. En la
  fuente inicial no existen. Si aparecen posteriormente, el exportador fallará
  en lugar de generar una copia incompleta; ampliar su soporte antes de actualizar.
- Requiere permisos suficientes para leer los metadatos de todas las tablas.
- No exporta catálogos: los datos sintéticos necesarios para flujos de negocio
  se incorporarán mediante fixtures en la siguiente etapa.

## Requisitos

1. Node.js compatible con el proyecto y `npm ci` con dependencias de desarrollo.
2. Cliente Prisma ya generado, como en el desarrollo habitual.
3. Docker instalado e iniciado con contenedores Linux. En Windows, configurar
   el backend WSL2/virtualización que requiera Docker. No se instala desde estos
   scripts porque supone cambios del sistema y puede requerir reinicio.
4. Acceso a la imagen `mariadb:11.4.10` en la primera ejecución; Docker la
   reutiliza después. El tag fija versión; todavía no se fijó un digest de imagen.

## Comandos

```bash
# Actualizar la estructura desde desarrollo (solo este comando lee esa base).
npm run test:integration:schema

# Verificar snapshot y Docker Linux, sin crear contenedores ni consultar desarrollo.
npm run test:integration:doctor

# Crear MariaDB aislada, restaurar estructura, ejecutar pruebas y limpiar.
npm run test:integration

# Comprobar tipos sin necesitar Docker ni acceso a bases.
npm run test:integration:typecheck

# Filtrar una suite o un nombre; no se permite reemplazar la configuración.
npm run test:integration -- tests/mariadb/environment.test.ts -t Prisma
```

Para ejecutar pruebas futuras no hay que volver a copiar desarrollo: se carga
el snapshot guardado. Cuando cambie la estructura, actualizarlo con el primer
comando y revisar el diff antes de incorporarlo a Git. No regenerar el esquema
en cada ejecución ni copiar producción automáticamente.

## Aislamiento y limpieza

- Un contenedor y una base `ft_integration_<identificador>` nuevos por ejecución.
- Puerto aleatorio publicado solo en 127.0.0.1, nunca el 3306 del desarrollo.
- Usuario `ft_test` y contraseñas aleatorias; sus valores no se pasan como
  argumentos de comandos ni se escriben en reportes. El usuario se limita a
  la base de pruebas.
- Datos de MariaDB en tmpfs; sin montar directorios de desarrollo ni volúmenes
  existentes. Zona horaria UTC y planificador de eventos desactivado.
- URL nueva suministrada al proceso Vitest; no se carga `.env.development`.
  Los tests comprueban localhost, puerto, usuario, nombre exacto de la base,
  identificador de ejecución y marcador interno antes de trabajar.
- Limpieza en `finally`, incluso si fallan las pruebas. Antes de eliminar se
  comprueban nombre y etiqueta del contenedor propio; no se usa `docker prune`.
- SIGINT/SIGTERM intentan limpiar. Un cierre forzado del equipo/proceso o pérdida
  del daemon puede impedirlo. El reporte identifica el contenedor y si falló
  la limpieza; revisar la etiqueta antes de una eliminación manual.
- Un proceso por suite, sin paralelismo entre archivos, para introducir fixtures
  y casos de concurrencia controlados dentro de cada prueba.

## Comprobaciones de esta etapa

`environment.test.ts` ejecuta cuatro pruebas reales, aprobadas el 2026-10-08:

1. MariaDB 11.4.10, nombre exclusivo y UTC.
2. Todas las tablas restauradas y sin registros de desarrollo.
3. Claves foráneas y collation de tablas conservadas.
4. Lecturas de factura e ítems a través del cliente Prisma real.

`business.test.ts` agrega 15 casos con parser, servicios, DAOs, Prisma y
transacciones reales: XML PEN/USD, fechas y detalles, rechazos, rollback SQL
de importación/aprobación, permisos, repetición y aprobación concurrente.
Se aíslan almacenamiento/configuración y proveedores externos; no se envían
correos ni Telegram. Las fixtures se eliminan con FK activas entre casos.

`entrepreneur.test.ts` agrega 27 casos reales: elegibilidad por asociación,
cuotas/plazo, líneas de factor/cedente/pagador, duplicados activos, PEN/USD,
reutilización de empresas y rollback SQL. También comprueba creación, unicidad
y rollback del DAO de empresas por separado: el flujo XML exige que las empresas
ya existan y sean elegibles. Se unificaron las etapas del empresario para que
un rechazo o fallo posterior revierta también la importación.
Ver [evidencia y alcance](../../docs/deuda-tecnica/20261008_DT_XML_empresario_integracion.md).

`operation.test.ts` agrega 27 casos de creación de factoring, asociaciones,
sumas Decimal, rollback, duplicados y actualización administrativa de líneas.
Se corrigieron concatenación de importes y doble creación concurrente. Por
decisión del usuario, crear una operación no reserva ni consume las líneas.
Ver [evidencia y límites](../../docs/deuda-tecnica/20261008_DT_creacion_factoring_integracion.md).

`settlement.test.ts` agrega 36 casos de liquidaciones y transferencias al cedente:
PEN/USD, reintegro/mora, IGV, gasto interbancario, adicionales, lectura, estados,
constancias y rollback provocado por errores SQL. Servicios, DAOs y calculador reales.
`historicalAudit.test.ts` agrega cinco regresiones SQL de la consulta del auditor.

`proposal.test.ts` agrega 19 casos de cálculo/creación de propuestas, lectura,
rollback SQL, concurrencia y snapshot del calculador. No se implementa recálculo
de importes de una propuesta existente. Ver [alcance y hallazgos](../../docs/deuda-tecnica/20261008_integracion_propuestas_calculo.md).

`settlementConcurrency.test.ts` agrega 12 casos de repetición, concurrencia y
rollback aislado de liquidaciones/transferencias. Las solicitudes repetidas
actualmente guardan dos registros completos; no se agrega deduplicación.
Ver [resultados y límites](../../docs/deuda-tecnica/20261008_integracion_concurrencia_liquidaciones_transferencias.md).

`invoiceHttp.test.ts` reúne 83 casos del recorrido HTTP/Multer con SQL y disco
reales: XML/PDF, JWT, roles, registro y descarga, rechazos, rollback y frontera
de 20 MiB. Se acepta un byte menos; exactamente 20 MiB y un byte más se rechazan.
Incluye 30 casos de JWT expirados y sesiones sin usuario o roles válidos en carga,
registro y descarga: sin nuevos datos/archivos y con las cargas previas intactas.
Se agregan 14 pruebas de eliminación: permisos, estado lógico, actor de sesión,
repetición, rollback SQL, archivos ajenos/vinculados y descarga posterior.
La eliminación actual conserva el contenido y no comprueba pertenencia ni vínculos;
estos comportamientos quedan documentados como límites, sin cambiar servicios.
Para repetir únicamente esta ampliación:

```powershell
npm run test:integration -- tests/mariadb/invoiceHttp.test.ts -t "JWT expirados y sesiones sin roles válidos"
npm run test:integration -- tests/mariadb/invoiceHttp.test.ts -t "Eliminación de archivos por HTTP"
```

Ver [alcance y límites de limpieza](../../docs/deuda-tecnica/20261008_integracion_HTTP_Multer_facturas.md).

Negocio y entorno: **494 casos aprobados en quince archivos**. Incluye caracterizaciones
de límites pendientes como DT-PDF-04; no certifica descargas concurrentes seguras.
La validación actual combina 493 aprobados en la ejecución general y la repetición
83/83 de HTTP de facturas tras completar un permiso SQL del fixture. Esa repetición
generó un JUnit de 83 casos; ver [evidencia exacta](../../docs/deuda-tecnica/20261008_correccion_autenticacion.md).
El backend compilado agrega dos casos en `runtime.test.ts`: **496 casos en
dieciséis archivos** en total, sin una nueva ejecución general de esa matriz.
`npm run test:runtime` compila en una salida exclusiva y valida un proceso real
contra MariaDB desechable: HTTP/SQL, cierre y conexión rechazada. Ver
[comando, reportes y límites](../../docs/deuda-tecnica/20261008_regresion_backend_compilado.md).
El JUnit y `last-run.json` se reemplazan en cada ejecución; comprobar fecha,
runId y cantidad de casos para distinguir el comando focalizado de la suite completa.
La aprobación se reserva mediante
una escritura condicional por operación y la propuesta se actualiza solo si
sigue vigente. Se comprueban misma propuesta, propuestas distintas, solicitudes
sin coordinador y pérdida de vigencia desde otra conexión. Conflicto concurrente:
409; repetición secuencial: 404 existente.
La consulta de moneda administrativa/financiera comparte transacción con la
importación: si falta el maestro, devuelve 422 y revierte todas las escrituras.
Ver [hallazgos y próximos cambios](../../docs/deuda-tecnica/20261008_DT_integracion_MariaDB.md).

Para ejecutar solamente estos escenarios, conservando el runner protegido:

```powershell
npm run test:integration -- tests/mariadb/business.test.ts
npm run test:integration -- tests/mariadb/business.test.ts -t "dos solicitudes"
npm run test:integration -- tests/mariadb/entrepreneur.test.ts
npm run test:integration -- tests/mariadb/operation.test.ts
npm run test:integration -- tests/mariadb/settlement.test.ts
npm run test:integration -- tests/mariadb/historicalAudit.test.ts
npm run test:integration -- tests/mariadb/proposal.test.ts
npm run test:integration -- tests/mariadb/settlementConcurrency.test.ts
npm run test:integration -- tests/mariadb/invoiceHttp.test.ts
npm run test:integration -- tests/mariadb/invoiceHttp.test.ts -t "límite global 20 MiB"
```

Reportes: `coverage/mariadb/junit.xml`, `last-run.json` y un JSON por ejecución.
JUnit corresponde a las pruebas; el JSON indica preparación, versión, hash,
resultado y limpieza. Si no se puede arrancar MariaDB, el comando falla y el
JSON lo registra; no presenta pruebas como aprobadas. Un JUnit previo puede
permanecer si el siguiente intento falla durante preparación: consultar siempre
el JSON de la ejecución actual y sus fechas. Todo `coverage/` está ignorado por Git.

Las suites rápidas mantienen sus comandos existentes y no necesitan Docker.
`test:all` no ejecuta automáticamente esta suite de integración.

## Evidencia de preparación local

- Exportación real desde desarrollo: aprobada, 127 tablas, MariaDB 11.4.2,
  base utf8mb4 / utf8mb4_unicode_ci, sin vistas/triggers/rutinas/eventos.
- Comprobación de tipos y pruebas rápidas de protecciones: ejecutadas.
- Instalación posterior autorizada: Docker Desktop 4.94.0 en modo de usuario
  con backend WSL2 y contenedores Linux; CLI Docker 29.8.2. WSL 3.0.1 instalado
  y componentes VirtualMachinePlatform/WSL habilitados mediante UAC.
- Primer intento: Windows indicó reinicio pendiente y Docker mostraba el
  acuerdo inicial; el daemon aún no respondía.
- Validación después del reinicio: diagnóstico aprobado, motor Linux Docker
  29.8.2, MariaDB 11.4.10 saludable, 127 tablas restauradas y vacías, claves
  foráneas/collations conservadas y lectura de facturas/ítems con Prisma real.
  Cuatro pruebas aprobadas, cero fallos. No se consultó desarrollo en esta ejecución.
- Limpieza confirmada: `cleanup: removed` y ningún contenedor restante con la
  etiqueta `ft.backend.integration.run`. El motor Docker permanece disponible
  para futuras ejecuciones; no se detienen otros contenedores.
- Evidencia local ignorada por Git: `coverage/mariadb/windows-wsl-setup.json`
  (registro histórico del reinicio requerido). El primer diagnóstico fue
  `passed` con 4 casos. La ampliación inicial registró 16 casos y 1 fallo por
  DT-IT-01. Después de corregir, `last-run.json` registra `passed`, limpieza
  `removed`. La matriz actual reúne 494 casos, incluyendo empresario,
  operaciones, líneas, liquidaciones, transferencias, auditoría, propuestas, HTTP/Multer y PDF.
  El JUnit se reemplaza en cada ejecución: una repetición focalizada contiene
  únicamente sus casos, no la matriz completa.

`operationState.test.ts` incorpora 27 casos reales de estados/historial: PEN/USD,
29/10/36, fecha de inicio, actor, adjuntos, edición, baja/reactivación y rollback
SQL o fallo de notificación. Ver
[alcance y evidencia](../../docs/deuda-tecnica/20261008_integracion_estados_historial_operacion.md).

```powershell
npm run test:integration -- tests/mariadb/operationState.test.ts
```

`financialHttp.test.ts` añade 60 casos HTTP de propuestas, liquidaciones y
transferencias: roles 2/6, PEN/USD, actor desde JWT, Zod, creación/consulta,
simulación, actualización, baja/activación y rollback SQL.
Los 60 casos HTTP se validaron inicialmente dentro de 315 casos en once archivos. Ver
[alcance y límites](../../docs/deuda-tecnica/20261008_integracion_HTTP_financiero.md).

```powershell
npm run test:integration -- tests/mariadb/financialHttp.test.ts
```

`connectedFlow.test.ts` añade diez recorridos de servicios reales PEN/USD:
carga XML/PDF, factura, operación, propuesta, disponibilidad, aprobación, inicio
y liquidación. Comprueba pago anticipado/puntual/mora, rechazo previo y
rollback/reintento tardío, sin insertar resultados intermedios como fixtures.
Antes del bloque PDF, el total era 325 casos en doce archivos. Ver
[recorrido y límites](../../docs/deuda-tecnica/20261008_integracion_recorrido_conectado.md).

```powershell
npm run test:integration -- tests/mariadb/connectedFlow.test.ts
```

## Montaje global de la aplicación

`appHttp.test.ts` importa `src/app.ts` y agrega 29 casos: rutas representativas
de los seis perfiles/grupos, autenticación, permisos, CORS, IP, Helmet, trazabilidad,
limitador global real, errores y creación/lectura de liquidación PEN/USD con rollback.
Configura producción sintética y conexión a la base desechable; no sustituye routers
ni middleware. Correo/Telegram y configuración de listas IP se aíslan. Ver [montaje global y límites](../../docs/deuda-tecnica/20261008_integracion_montaje_global.md).

```powershell
npm run test:integration -- tests/mariadb/appHttp.test.ts
```

No prueba todas las rutas ni Nginx/HTTPS/arranque. CORS de producción rechaza
`/ping` sin Origin; se caracteriza sin cambiar configuración. La carga de archivos
no forma parte de este bloque.

## Login y actualización de accesos

`authHttp.test.ts` reúne 36 casos con la aplicación completa, bcrypt real, JWT
y MariaDB: login por roles, credenciales inválidas, perfil/menú actualizado,
exp/iat conservados, cambios de roles, fallos y cuotas de login/refresco. Ver [correcciones y límites](../../docs/deuda-tecnica/20261008_correccion_autenticacion.md): solo cuentas/credenciales activas, JWT de 24 horas en producción y permisos SQL vigentes.

```powershell
npm run test:integration -- tests/mariadb/authHttp.test.ts
```

Los casos de cuentas inactivas, vigencia de 200 000 horas y JWT anteriores
caracterizan deudas pendientes. No certifican que estén corregidas.

## Próximas ampliaciones

`pdfHttp.test.ts` reúne 104 casos de generación y descarga real: ambos perfiles,
PEN/USD, dos facturas vinculadas, importes/fechas frente a SQL, anticipación/mora,
60 conceptos con paginación, permisos y limpieza de temporales. Añade 12 casos
que reproducen la colisión de descargas del mismo documento y cuatro controles
de documentos distintos. Doce casos adicionales cubren nombres largos y veinte
facturas; DT-PDF-05 caracteriza la superposición nombre/RUC en propuesta y el
criterio visual pendiente. DT-PDF-04 sigue diferida por decisión del usuario: la primera descarga borra
el temporal compartido y la segunda falla (404 administrativo/500 financiero).
Documenta el archivo huérfano ante fallo previo al `finally` y el 500 de propuesta
inexistente y el IGV de cargos sin desglose como límites actuales. Conserva dieciséis PDFs sintéticos locales en
`coverage/mariadb/pdf-samples/` para revisión visual. Ver
[alcance, comandos y deuda PDF](../../docs/deuda-tecnica/20261008_integracion_PDF.md).

```powershell
npm run test:integration -- tests/mariadb/pdfHttp.test.ts
```

Para repetir solo las dieciséis cancelaciones TCP reales:

```powershell
npm run test:integration -- tests/mariadb/pdfHttp.test.ts -t "cancelación TCP"
```

Cubren cierre antes de cabeceras y después de cabeceras antes del cuerpo,
limpieza del temporal, conservación de SQL y reintento completo. No cubren
cancelación a mitad del cuerpo. No se cambia producción ni se corrige DT-PDF-04/05.

Para repetir los dieciséis fallos de escritura:

```powershell
npm run test:integration -- tests/mariadb/pdfHttp.test.ts -t "fallo de escritura"
```

La apertura fallida usa un directorio bloqueador exclusivo y obtiene `EISDIR`
del sistema operativo. La escritura parcial conserva un stream real y 64 bytes
escritos en disco; después inyecta `ENOSPC`, sin llenar el disco. Comprueba 500
JSON, ausencia de envío/cambios SQL y cierre del descriptor. El parcial permanece
(DT-PDF-01); un reintento completo lo sobrescribe y limpia. No se implementó
limpieza de generación en producción.

Para repetir solo la concurrencia, con generación y envío reales:

```powershell
npm run test:integration -- tests/mariadb/pdfHttp.test.ts -t "colisión|documentos distintos"
```

Los casos de caracterización aprobados reproducen el fallo actual; el resultado
deseado de dos respuestas 200 para el mismo documento sigue pendiente de corrección.

La [revisión de ampliaciones](PLAN_AMPLIACION.md) registra estados/historial,
HTTP financiero y recorrido conectado como implementados, separados de la
[deuda de autorización y ciclo de vida de archivos](../../docs/deuda-tecnica/20261008_DT_ciclo_vida_archivos.md).

## Auditoría histórica de solo lectura

```powershell
npm run audit:factoring:historical
```

Este comando separado de las pruebas consulta exclusivamente la conexión de
`.env.development`, usando una transacción READ ONLY con snapshot consistente.
No requiere Docker. Compara factura/bruto, neto, detracción y retención contra
SUM DECIMAL de las facturas vinculadas, sin excluir registros eliminados.
Incluye operaciones cuya cantidad declarada o vinculada es mayor que uno;
marca diferencias de importes, asociaciones incompletas y monedas incompatibles.
No repara datos ni atribuye automáticamente una causa a las diferencias.

El informe local `coverage/audit/historical-factoring.json` contiene fecha, versión,
alcance, limitaciones y casos por revisar (IDs/códigos e importes, sin RUC ni
credenciales). Está ignorado por Git; tratarlo como información interna. Un fallo
produce código de salida distinto de cero; comprobar siempre la fecha del informe,
porque puede conservarse uno anterior. No admite argumentos para cambiar de fuente.

El 2026-10-08 la fuente tenía 35 operaciones y ninguna con varias facturas;
no había casos históricos dentro del alcance. Esto no certifica producción.
Ver [evidencia y pendientes](../../docs/deuda-tecnica/20261008_integracion_liquidaciones_transferencias_auditoria.md).

## Primer inicio en otro equipo Windows

1. Guardar el trabajo y reiniciar Windows cuando sea conveniente. La instalación
   no reinicia el equipo automáticamente.
2. Abrir Docker Desktop y completar los avisos del primer inicio. Si muestra
   el acuerdo de licencia, revisarlo y decidir su aceptación personalmente.
3. Esperar a que indique que el motor está ejecutándose. El backend elegido
   es WSL2 para contenedores Linux; no requiere instalar una distribución Ubuntu.
4. Abrir una terminal nueva en este proyecto para recoger el PATH instalado y
   ejecutar `npm run test:integration:doctor`, seguido de
   `npm run test:integration`.

El helper `scripts/integration/enable-wsl-windows.ps1` queda disponible para
repetir la habilitación en otro Windows: debe ejecutarse como administrador,
no fuerza reinicios y guarda el resultado en `coverage/mariadb/`. No hace
falta repetirlo si los componentes ya están habilitados.

Referencias: [MariaDB en contenedores](https://mariadb.com/docs/server/server-management/automated-mariadb-deployment-and-administration/docker-and-mariadb)
y [conector Prisma para MariaDB](https://docs.prisma.io/docs/orm/v6/overview/databases/mysql).
