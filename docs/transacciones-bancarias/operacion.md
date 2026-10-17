# Operación del módulo de transacciones bancarias

> Ajuste vigente 16/10/2026: consulte [configuración genérica de BBDD](configuracion-bbdd.md) y [modelo vigente](esquema-vigente.sql). El DDL original se conserva como evidencia histórica.

## Perfiles y pantallas

Administrador (rol 2): **Config BBDD**, inmediatamente debajo de Config Correo. Permite guardar y habilitar sin conexión remota, editar, probar, eliminar lógicamente y reactivar configuraciones reutilizables. La prueba también funciona sobre borradores y devuelve bases accesibles, mensajes y tiempos efímeros. Contraseña vacía al editar conserva el secreto; una nueva requiere GCM disponible.

Financiero (rol 6): grupo independiente **Sincronización de transacciones bancarias**. Incluye transacciones, cuentas de origen, sincronización manual, ejecuciones/log, incidencias e historial. No recibe host, usuario, contraseña ni material criptográfico. El backend valida el rol vigente por solicitud; los menús y las pantallas también separan los perfiles. Un usuario con ambos roles accede a cada ámbito desde su opción correspondiente.

Flujo inicial:

1. Infraestructura configura las variables y la confianza TLS indicadas abajo.
2. Administrador crea y prueba la conexión MySQL; se recomienda comenzar suspendida.
3. Financiero configura la tabla bancaria al crear el primer mapeo y crea los mapeos de los identificadores remotos a las cuentas del factor. La moneda se obtiene de la cuenta local. El alias remoto debe corresponder a lo publicado en la tabla; no se deduce por últimos dígitos.
4. Administrador habilita la conexión (la prueba es opcional). Financiero selecciona la conexión y ejecuta la primera sincronización. Ambos límites de fecha son opcionales conjuntamente; con ambos vacíos se lee todo el histórico autorizado de las cuentas mapeadas habilitadas.
5. Para la carga histórica, financiero marca **Importar enriquecimientos históricos únicamente para movimientos nuevos**. El proceso conserva los campos auxiliares existentes y registra los inválidos como incidencias; nunca actualiza enriquecimientos de movimientos ya locales.
6. Financiero revisa ejecuciones e incidencias. Los resultados PARCIAL/FALLIDA no significan que se deshagan los lotes confirmados. Repetir el mismo alcance es idempotente. Si se pierde la conexión HTTP, consultar el log antes de reintentar: el trabajador puede seguir activo y el bloqueo rechazará ejecuciones simultáneas.

El CRUD manual registra magnitud positiva y signo 1/-1, conserva ceros de operación, permite enriquecimiento y corrección con motivo y versión, y anula/reactiva con historial. La cuenta no se reasigna desde la edición ordinaria. Los mapeos se suspenden/habilitan; no se reasignan después de ser utilizados. Las incidencias se resuelven o descartan con sustento, sin aplicar cambios financieros automáticamente. Si la misma discrepancia reaparece, se reabre conservando la resolución anterior en historial. Cambios de identidad remota requieren revisión humana; no se fusionan por similitud.

## Configuración externa

No se editó ningún archivo `.env` ni se crearon secretos durante la implementación. En desarrollo, agregar estos valores mediante el mecanismo habitual de configuración del backend. En producción, inyectarlos desde un archivo protegido o el gestor de secretos del despliegue. Los valores siguientes son marcadores de ejemplo, no credenciales utilizables:

```dotenv
BBDD_ACTIVE_KEY=v1
BBDD_KEYS='{"v1":"<CLAVE_ALEATORIA_DE_32_BYTES_EN_BASE64>"}'
BBDD_ALLOWED_TARGETS='["mysql.ejemplo.interno:3306"]'
BBDD_CA_FILES='{"origen-bancario":"/etc/finanzatech/certificados/origen-ca.pem"}'
BANK_SYNC_MAX_ROWS=50000
```

`BBDD_KEYS` contiene el mapa de versiones de claves, no la contraseña MySQL. Generar 32 bytes con un generador criptográfico, guardar su Base64 externamente y no compartirlo en chats, Git o logs. Clave dedicada y distinta de correo. No reemplazar el contenido de una versión que todavía cifra secretos existentes. Para rotar: agregar otra versión, cambiar ACTIVE_KEY y reemplazar la contraseña desde administrador; conservar la versión anterior hasta completar la rotación de todas las conexiones.

Ejemplo para generar la clave **localmente**, sin compartir la salida:

```powershell
& 'D:\Herramientas\node-v24.21.0-win-x64\node.exe' -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Configurar estas variables tanto en el proceso de la API como en el trabajador programado. Reiniciar el backend para cargar la configuración y actualizar accesos o recargar la sesión para obtener los menús nuevos. No enviar contraseñas MySQL ni claves maestras por el chat.

`BBDD_ALLOWED_TARGETS` es una lista exacta de host en minúsculas y puerto permitidos por infraestructura. La interfaz no puede ampliarla. CA_FILES asigna referencias conocidas a archivos CA del servidor; la pantalla recibe solamente el nombre de referencia. Referencia vacía usa las autoridades de confianza del sistema. TLS está activo por defecto y exige verificar certificado y nombre del servidor. El administrador puede desactivarlo explícitamente por conexión aceptando la advertencia de transporte sin cifrar; no hay fallback automático. No existe opción para aceptar certificados inválidos. V1 no configura autenticación mutua TLS ni destinos IPv6 literales.

La cuenta remota debe poder leer la tabla/vista necesaria. Los privilegios adicionales, roles y alcance por tabla o base son responsabilidad del administrador; la aplicación no inspecciona SHOW GRANTS ni rechaza cuentas por disponer de permisos de escritura. El adaptador ejecuta únicamente SELECT en una transacción READ ONLY y deja que MariaDB/MySQL valide el acceso efectivo. La prueba genérica del administrador enumera bases y comprueba acceso sin aplicar reglas bancarias.

Se utiliza el conector MariaDB/Node ya instalado para el protocolo MySQL, conservando DECIMAL como texto, fechas civiles como texto y TLS autenticado. Referencias: [opciones oficiales del conector](https://mariadb.com/docs/connectors/mariadb-connector-nodejs/node-js-connection-options) y [GCM en Node](https://nodejs.org/api/crypto.html). El límite MAX_ROWS rechaza un alcance excesivo en lugar de truncarlo como si estuviera completo; seleccionar un período menor. El trabajador limita el procesamiento a dos minutos y registra resultados parciales explícitos.

## Programación en Ubuntu

La CLI y el botón manual llaman al mismo servicio y comparten bloqueo asesor por conexión en MariaDB, sin transacción local abierta durante lecturas remotas. La identidad única protege además entre distintas conexiones. Una ejecución EN_CURSO abandonada se marca INTERRUMPIDA al recuperar el bloqueo; el reintento completa los lotes pendientes sin borrar movimientos ausentes del origen.

Variables adicionales del trabajador:

```dotenv
NODE_ENV=production
BANK_SYNC_ACTOR_ID=<ID_INTERNO_DE_USUARIO_TECNICO_FINANCIERO_ACTIVO>
BANK_SYNC_CONNECTION_UUID=<UUID_PUBLICO_DE_CONEXION>
# Ambos opcionales; omitir ambos para leer todo el alcance histórico mapeado.
# BANK_SYNC_FROM=2026-01-01
# BANK_SYNC_TO=2026-12-31
```

La cuenta técnica debe existir y conservar el rol financiero activo. La conexión debe estar habilitada y sus mapeos ser válidos. La CLI programada nunca activa la carga LEGADO. Requiere también las variables habituales del backend para acceder a la base local y sus registros. El UUID de conexión se obtiene de la consulta administrativa autenticada; no es una contraseña.

Comandos disponibles: `npm.cmd run cron:transacciones-bancarias` en desarrollo con Node portable 24.21.0 y `npm run cron:transacciones-bancarias:prod` en un despliegue ya compilado. El entry de tsdown ya incluye `src/scripts/*.ts`. No se empaquetó producción ni se activó un cron/servicio remoto en esta tarea.

Los archivos [servicio](programacion/ft-banca-sync.service) y [timer](programacion/ft-banca-sync.timer) son plantillas revisables, todavía no instaladas. Ajustar usuario, ruta de Node 24, WorkingDirectory, ruta compilada, archivo de entorno y carpeta de logs a la instalación real; `/opt/finanzatech` es un ejemplo. Preparar permisos y archivo de secretos antes de activar. El timer propone quince minutos y recupera activaciones omitidas; la frecuencia final debe corresponder a la carga efectiva del origen. Usar una instancia/configuración independiente por conexión y monitorizar la salida no cero y el resultado de ejecuciones.

## Contratos y límites

Rutas administrativas: `/api/v1/admin/configuracionbbdd` (POST), `/listar` (GET), `/:id` (PATCH), `/:id/estado` (PATCH), `/:id/validar` (POST). Rutas financieras bajo `/api/v1/financiero/transaccionbancaria`: `/master`, `/movimientos`, `/movimientos/:id`, `/cuentas`, `/cuentas/:id`, `/sincronizar`, `/ejecuciones`, `/incidencias`, `/incidencias/:id` y `/historial`. Escrituras exigen DTO estricto y versiones cuando corresponde; actor, identidad, estado inicial y procedencia son del servidor.

No se crean pagos, conciliaciones, comprobantes ni relaciones con factoring. El JSON de MariaDB se serializa expresamente como String/LongText para Prisma, conservando JSON_VALID y CHECK del DDL. Los parámetros y errores bancarios de Prisma no publican datos de evidencia ni material cifrado; errores remotos se sanitizan. El historial es de solo anexado desde la aplicación. Backups y permisos de administración de la base siguen siendo responsabilidad de infraestructura.
