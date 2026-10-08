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

Resultado actual: **19 casos aprobados**. La aprobación se reserva mediante
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
  `removed`, y `junit.xml` muestra 19 casos sin fallos.

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
