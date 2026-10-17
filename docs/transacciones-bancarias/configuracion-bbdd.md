# Configuración reutilizable de BBDD externas

Implementación del ajuste autorizado el 16/10/2026. Se adopta la grafía estándar `configuracion_bbdd`, PK `_idconfiguracionbbdd` y UUID público `configuracionbbddid`. La migración conserva los valores de ambos identificadores, las credenciales cifradas y las cuatro referencias bancarias. La tabla genérica no contiene tablas de origen, cuentas, consultas ni resultados de pruebas.

`factor_transaccion_bancaria_fuente` es una extensión del consumidor bancario: PK/FK `_idconfiguracionbbdd` y `tabla_origen`. La migración copia la tabla de **todas** las conexiones anteriores antes de retirar la columna genérica, incluso si no tienen mapeos. Al crear el primer mapeo financiero se puede informar una tabla; vacío utiliza `bcp_transaccion_ahorro`. Los siguientes mapeos conservan esa tabla; una discrepancia explícita se rechaza para evitar cambiar el origen histórico inadvertidamente. La sincronización consulta esta extensión, ejecuta únicamente lecturas y deja la administración de privilegios al responsable del origen y no modifica el MySQL remoto.

El [modelo vigente](esquema-vigente.sql) describe una instalación nueva. El [SQL incremental](20261016-configuracion-bbdd.sql) y su [manifiesto](../../scripts/database/plans/20261016-configuracion-bbdd.json) documentan el ajuste aplicado en desarrollo: revisión previa, huellas de plan/destino, copia conservadora y `prisma-sync` sobre el mismo destino leído de `.env.development`. El DDL original se conserva como evidencia histórica y no debe reutilizarse para crear el modelo actual. MariaDB confirma cada DDL implícitamente; no hay rollback ficticio ni borrado de tablas. La copia verifica cantidades y las referencias se recrean restrictivas. No se generaron credenciales ni se editaron archivos de entorno.

## Administración y prueba

**Config BBDD**, debajo de **Config Correo**, pertenece exclusivamente al administrador (rol 2). Formulario con motor, nombre, servidor, puerto, base, usuario, contraseña, referencia CA y switch **Habilitado**. Guardar o habilitar no consulta DNS ni abre una conexión externa y no requiere una prueba exitosa. Cambiar la contraseña requiere cifrado disponible; conservarla durante una edición no necesita descifrarla. Nunca se almacena texto plano. La eliminación es lógica; reactivar deja deshabilitada la configuración.

**Probar conexión** está disponible en la lista y durante creación/edición. Los borradores se prueban sin persistirlos. Al editar con contraseña vacía, el backend utiliza el secreto guardado junto con los valores actuales del formulario. La base puede quedar vacía durante la prueba; para guardar se exige un nombre escrito o seleccionado. Los nombres admiten guiones y Unicode, con un máximo de 64 caracteres y sin caracteres de control; la selección de base se escapa mediante el conector.

El resultado queda en el mismo diálogo: mensaje, bases accesibles, consola con tiempo transcurrido y tabla de duración por etapa. Las bases detectadas son sugerencias: el campo sigue permitiendo escritura manual si no se prueba o si falla. Cambiar el servidor, usuario, contraseña o certificado invalida el diagnóstico y su lista; cambiar la base invalida el resultado y conserva las sugerencias. Estos datos solo viven en memoria y en la respuesta HTTP; no se escriben en tablas, historial, logger, almacenamiento del navegador ni registros del diagnóstico. Los logs de las pruebas automatizadas son artefactos de validación separados.

Etapas: preparación, disponibilidad de cifrado, credenciales, política de destinos y CA, DNS, conexión TCP/TLS/autenticación, enumeración de bases, acceso a la base seleccionada y cierre. El driver negocia TCP/TLS/autenticación conjuntamente, por lo que se informa una sola duración real para esa etapa. Las duraciones se miden con reloj monotónico en el backend y excluyen el transporte navegador/backend. La pantalla muestra el resultado al terminar la solicitud; no implementa transmisión progresiva de logs.

DNS, conexión y consultas tienen tiempos límite. El diagnóstico no prueba el contrato bancario ni exige SELECT exclusivo: cada consumidor aplica sus permisos específicos. `SHOW DATABASES` devuelve únicamente las bases visibles para el usuario según los permisos remotos, no un inventario completo del servidor. Si la base escrita falla después de enumerar, se conserva la lista accesible. Errores de DNS, puerto/firewall, autenticación, base inexistente, permisos, TLS y cifrado incluyen acciones concretas. No se devuelven mensajes SQL/driver sin filtrar, contraseñas, claves, ciphertext, nonce ni tag.

## Configuración del backend

Configurar en el entorno privado de la API y del trabajador, reiniciándolos después:

```dotenv
BBDD_ACTIVE_KEY=<VERSION_ACTIVA>
BBDD_KEYS={"<VERSION_ACTIVA>":"<CLAVE_ALEATORIA_DE_32_BYTES_EN_BASE64>"}
BBDD_ALLOWED_TARGETS=["mysql.example.test:3306"]
BBDD_CA_FILES={"ca-externa":"/ruta/privada/ca.pem"}
```

`BBDD_KEYS` es un mapa de versiones; conservar las anteriores durante la rotación. No ingresar estas claves en el formulario ni enviarlas por chat. El formato GCM V1 mantiene su AAD original ligado al UUID para descifrar secretos existentes después del renombre. El cambio de nombre no recifra ni requiere conocer la contraseña anterior. Las variables históricas `BANK_SYNC_KEYS`, `BANK_SYNC_ACTIVE_KEY`, `BANK_SYNC_ALLOWED_TARGETS` y `BANK_SYNC_CA_FILES` siguen siendo alias de compatibilidad cuando su equivalente `BBDD_*` está ausente; una variable genérica presente tiene prioridad, incluso vacía. No hay fallback a claves de correo.

TLS está habilitado por defecto y, cuando está activo, verifica identidad y confianza. Desde el ajuste autorizado del 16/10/2026 se puede desactivar explícitamente por conexión mediante `tls_habilitado=0`, con advertencia de transporte sin cifrar; no existe reintento automático sin TLS. Consulte [diagnóstico y solución del incidente](incidente-tls-20261016.md). El formulario puede guardarse antes de que infraestructura autorice el destino o instale la CA. La prueba describe cómo resolver una política ausente o una referencia CA inválida. Si una contraseña transitoria permite conectar pero falta la clave activa de almacenamiento, se muestra una advertencia de cifrado; guardar esa contraseña seguirá rechazado hasta resolverla. Si falta la versión de clave necesaria para un secreto guardado, la etapa de credenciales falla sin conectarse.

Esta versión implementa adaptadores compatibles con **MySQL y MariaDB**. El catálogo es genérico y reutilizable; soportar PostgreSQL, SQL Server u otro protocolo requiere agregar su adaptador, configuración y pruebas. No se anuncia soporte inexistente.

Rutas del administrador: `/api/v1/admin/configuracionbbdd/listar`, POST base, PATCH `/:id`, PATCH `/:id/estado`, POST `/:id/validar` y POST `/probar` para `{ configuracionbbddid?: UUID, conexion: borrador }`. La prueba devuelve diagnóstico estructurado incluso ante fallos de preparación/red. Autenticación y autorización HTTP siguen aplicándose. Las escrituras usan versiones para evitar sobrescritura concurrente y comparten bloqueo de configuración con la sincronización. Reiniciar API/trabajador y recargar sesión para utilizar rutas y menú actualizados.
