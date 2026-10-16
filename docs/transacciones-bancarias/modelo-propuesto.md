# Modelo propuesto: transacciones bancarias del factor

Fecha: 15/10/2026. Estado: seis tablas creadas y verificadas en desarrollo; schema y cliente Prisma sincronizados. La implementación posterior de backend/frontend y sus comprobaciones se describen en [operación](operacion.md) e [informe de implementación](implementacion.md). Este diseño prevalece sobre las recomendaciones iniciales de monto firmado, credenciales y pagos.

## Decisiones incorporadas

- Tabla principal `factor_transaccion_bancaria`; `monto > 0` y `signo` igual a 1 o -1. Neto y comisiones son magnitudes no negativas: NULL es desconocido y cero es válido para estos campos auxiliares.
- Origen **MySQL** de solo lectura; destino **MariaDB del proyecto**. No se modifica el servidor remoto.
- Conexión administrable desde la interfaz exclusiva de administrador, con AES-256-GCM y clave maestra externa dedicada. Ver la implementación posterior documentada en operación.
- Carga inicial con enriquecimientos históricos; relecturas posteriores preservan la información local. La carga de datos requiere autorización separada.
- No se crean tablas, FKs ni estados de conciliación o pagos. Las referencias textuales existentes se conservan como legado.
- Seis tablas exclusivamente del módulo, sin nuevos catálogos, semillas, ALTER ni cambios manuales en Prisma.
- Ajuste aprobado: no se persiste `_idmoneda` en el movimiento. La moneda se obtiene mediante `factor_cuenta_bancaria → cuenta_bancaria → moneda`; el importador compara la recibida con esa moneda y conserva el original en evidencia JSON. La moneda de una cuenta con movimientos debe permanecer estable; un cambio real requiere otra cuenta. Esta regla entre módulos se documenta para la futura implementación y no añade triggers ni modifica tablas existentes.

Se conserva el término `signo` solicitado. En el esquema local revisado aparece en `banco_transaccion`; `factoring_liquidacion` no tiene una columna con ese nombre. La nueva restricción ±1 y la magnitud positiva son decisiones explícitas de este módulo y no modifican las convenciones de otras tablas.

## Relaciones

Conexión → mapeo → cuenta del factor; conexión → ejecución; movimiento → cuenta del factor, mapeo y ejecuciones; incidencia → conexión, ejecuciones y movimiento; historial → exactamente una entidad del módulo. Todas las FKs son RESTRICT, sin cascadas. La moneda se deriva de la cuenta bancaria relacionada.

Auditoría según el estándar existente: usuarios INT exigidos explícitamente, sin DEFAULT 1 ni nuevas FKs a usuario; el servicio valida actor autenticado o cuenta técnica. `estado`: 1=ACTIVO y 2=ELIMINADO, excepto historial, que permanece en 1.

## Reglas de identidad, importación y corrección

La identidad inicial es la combinación **cuenta del factor + fecha + número de operación + signo + monto positivo**. No incluye descripción, moneda adicional, conexión ni estado: el servicio valida la moneda contra la cuenta y el origen. Se utiliza una huella SHA-256 única para indexarla sin depender del tamaño del texto ni de su collation. La tupla original también se guarda y se compara al encontrar una coincidencia; la huella no elimina la ambigüedad de dos movimientos reales idénticos.

V1 serializa un array JSON compacto de cinco cadenas UTF-8, en orden fijo, sin espacios entre elementos: `["ID_CUENTA","YYYY-MM-DD","OPERACION","1_O_MENOS_1","MONTO_CON_DOS_DECIMALES"]`. La cadena del signo contiene literalmente `1` o `-1`; el monto usa punto decimal, dos decimales, ningún separador de miles ni signo. Los caracteres se escapan con el serializador JSON estándar. La normalización de cuenta remota y operación elimina CR/LF y espacios externos, conserva ceros y contenido interno, y no aplica cambios de mayúsculas, acentos ni normalización Unicode implícita. La cuenta remota se resuelve mediante el mapeo antes de obtener el ID local. No aceptar identidad, huella ni metadatos de procedencia desde el frontend.

La huella y la tupla se calculan en el alta, también en altas manuales, y permanecen inmutables. La cuenta local no se cambia desde la edición ordinaria. Una asignación de cuenta errónea se anula con motivo y se registra correctamente, sin borrar la identidad equivocada. Corregir fecha, operación, signo o monto operativo exige motivo e historial; no modifica la identidad inicial. Si el origen cambia uno de esos campos, no existe identificación suficiente para asociar automáticamente la nueva combinación: debe revisarse como posible corrección. El importador no fusiona por parecido.

Reglas de relectura: misma identidad y evidencia compatible confirma observación; diferencias en datos bancarios crean incidencia; ninguna relectura cambia tipo, comisiones, neto o referencias locales. Un alta manual compatible puede adquirir evidencia de origen conservando UUID, autoría y enriquecimientos. Si existe una diferencia entre el valor operativo corregido y la nueva observación, se registra para revisión y no se revierte automáticamente. Un registro anulado conserva su huella para impedir recreación. Dos filas distintas de origen bajo la misma identidad generan conflicto, sin escoger una arbitrariamente.

### Adaptación del MySQL remoto a magnitudes positivas

No se altera la representación del origen ni se ejecuta allí ningún UPDATE. La adaptación ocurre al leer en el backend:

| Dato recibido | Dato local |
| --- | --- |
| `sumaoresta` Suma o +, monto firmado positivo | `signo=1`, `monto=ABS(monto_origen)` |
| `sumaoresta` Resta o -, monto firmado negativo | `signo=-1`, `monto=ABS(monto_origen)` |
| Signo remoto ausente, pero monto firmado no cero | Derivar dirección del monto firmado, conservando en evidencia que el signo remoto estaba ausente |
| Signo remoto desconocido o contradictorio con monto firmado | Incidencia; no insertar como movimiento válido |
| Monto cero, inválido, con exceso de decimales o fuera de rango | Incidencia; no redondear ni convertir silenciosamente |

El servicio opera con decimal exacto y cadenas monetarias, sin conversiones intermedias a `Number`. El signo se interpreta respecto de la cuenta del factor. Para el neto histórico firmado se valida dirección contra el movimiento antes de convertir a magnitud; cero es admisible. Una comisión negativa o un neto con dirección contradictoria produce incidencia de enriquecimiento, conservando el original, sin inventar una fórmula. Se puede importar el movimiento bancario válido dejando el campo auxiliar pendiente y registrando la incidencia; no se declara exitosa la carga mientras existan incidencias de esa ejecución. Los valores bancarios originales se conservan como cadenas en JSON de evidencia, incluidos sus signos: no son importes operativos negativos del modelo.

La carga LEGADO incorpora los siete campos bancarios y todos los enriquecimientos existentes; los nulos siguen siendo desconocidos. Las sincronizaciones ordinarias posteriores incorporan y cotejan los siete campos, preservando la información local. Fecha bancaria sigue siendo DATE; no se transforma a un instante UTC. Se valida detalle_hora como hora local de Lima.

## Seguridad y configuración administrable

La interfaz de administración y el cifrado se implementaron después de la etapa DDL. La contraseña se envía al backend al crearla o reemplazarla y nunca se devuelve. Las respuestas de consulta usan una selección explícita de campos permitidos y excluyen `password_cifrado`, `password_nonce` y `password_tag`. Los eventos de configuración y rotación excluyen también esos campos y cualquier clave maestra. La contraseña puede reemplazarse, sin recuperar su valor.

AAD V1: UTF-8 del array JSON compacto `["FT-BANCO-CONEXION","1","UUID_CONEXION","password","CLAVE_VERSION"]`, sustituyendo UUID y versión reales. El UUID es inmutable; al rotar clave se vuelve a cifrar con nueva versión, nonce y tag de forma atómica. La clave externa es aleatoria de 32 bytes, dedicada al módulo y distinta de correo. El índice nonce/version es una defensa sobre configuraciones vigentes, no un registro de todos los nonces históricos; el proceso criptográfico debe asegurar no reutilización durante toda la vida de una clave y establecer sus límites de uso/rotación. La integridad criptográfica depende del backend y no se valida únicamente mediante SQL. Véase [OWASP Cryptographic Storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html).

Conexión MySQL con usuario SELECT de alcance mínimo. TLS con CA confiable y verificación del nombre del servidor es obligatorio; NULL en tls_ca_referencia utiliza confianza del sistema, no desactiva TLS. No permitir parámetros arbitrarios, URLs, SQL libre, puertos o hosts fuera de la lista de infraestructura. Las referencias a CA se resuelven desde una lista permitida de archivos del servidor. No se configura autenticación mutua TLS en V1; si el MySQL la exige, debe ampliarse el diseño antes de implementar. La versión real del origen y sus métodos de autenticación se verificarán antes de seleccionar el adaptador. [Documentación oficial de conexiones cifradas MySQL](https://dev.mysql.com/doc/refman/8.4/en/using-encrypted-connections.html).

Cron o systemd ejecutarán una CLI del backend que utiliza el mismo servicio del reintento manual. La frecuencia se definirá al implementar, según carga real del origen. Bloqueo por conexión, timeouts, lotes cortos y resultados parciales explícitos; la unicidad local protege también entre conexiones. No confiar en fecha bancaria ni fechamod remota como único cursor. Empezar por relectura completa del alcance histórico acordado si el volumen real lo permite. Ninguna ausencia remota produce eliminación automática.

## Restricciones físicas y responsabilidades del servicio

El DDL incluye CHECK de signo ±1, monto >0, auxiliares >=0, estados, consistencia de referencias opcionales, identidad versionada, cierre de ejecuciones y exactamente una entidad por evento histórico. Las FKs a tablas preexistentes se limitan a `factor_cuenta_bancaria`. Los índices incluyen identidad, consulta por cuenta/fecha y relaciones; no se indexan todas las referencias de texto.

El servicio valida además moneda/cuenta, correspondencia de conexión entre mapeo y ejecuciones, actor, permisos, cómputo y comparación de huellas, campos de JSON, inmutabilidad, no sobrescritura y escritura del historial en la misma transacción. Esas reglas entre tablas no quedan garantizadas por un CHECK de fila. Historial usa cuatro FKs reales opcionales y un CHECK de exclusión; no contiene una referencia polimórfica libre sin integridad referencial. El historial no se borra desde el módulo y debe protegerse con permisos de base adecuados; el DDL por sí solo no impide que un administrador lo modifique.

Se usa InnoDB, ROW_FORMAT=DYNAMIC y utf8mb4_unicode_ci, con campos de identidad y etiquetas de origen sensibles a mayúsculas mediante collation binaria. La huella es ASCII binario. Se verificaron MariaDB 11.4.2, tamaño de página compatible, modo estricto, collation y CHECK habilitados en el destino de desarrollo, además de tipos, nulabilidad, valores predeterminados y restricciones de las seis tablas. El runner aplicó con sesión UTC. Esto no acredita otros servidores ni sustituye pruebas sintéticas de comportamiento. [Restricciones oficiales de MariaDB](https://mariadb.com/docs/server/reference/sql-statements/data-definition/constraint).

## Archivos y secuencia de revisión

- `esquema-propuesto.sql`: seis CREATE TABLE en orden de dependencias, comentarios de todas las tablas y columnas, sin ALTER, INSERT, permisos ni conexiones reales.
- `../../scripts/database/plans/20261015-factor-transaccion-bancaria.json`: manifiesto consumible por el runner existente. Su descripción recoge la autorización expresa de creación en desarrollo del 15/10/2026, excluyendo carga de datos y cambios de tablas existentes.
- `revision-estatica.json`: evidencia de lectura del manifiesto y coherencia estructural local; no es validación sintáctica por MariaDB ni integración real.

El enlace relativo al manifiesto desde este directorio es [manifiesto](../../scripts/database/plans/20261015-factor-transaccion-bancaria.json).

El usuario confirmó retirar `_idmoneda` y autorizó expresamente crear este modelo en desarrollo el 15/10/2026. Se utiliza primero la revisión sin cambios de `npm.cmd run db:ddl -- --plan scripts/database/plans/20261015-factor-transaccion-bancaria.json`, luego la aplicación con huellas y referencia de esa autorización según `scripts/database/README.md`, verificación y prisma-sync contra el mismo destino leído exclusivamente de `.env.development`. El resultado se documenta en [aplicación en desarrollo](aplicacion-desarrollo-20261015.md). La carga histórica requiere autorización separada; no hay semillas de conexión ni datos bancarios.

Antes de activar el módulo se recomiendan pruebas sintéticas de normalización/duplicados, GCM/AAD y rotación, permisos, altas manuales luego importadas, fallos/reintentos, carga histórica y persistencia con MariaDB desechable. Las etapas iniciales fueron de revisión estática; la evidencia actual de creación y sincronización se distingue en el informe de aplicación. Crear estas tablas no implementa la interfaz, el cifrado, la importación ni las reglas del servicio.

## Diccionario completo

Los comentarios siguientes se persisten literalmente en el DDL; cada columna indica tipo, nulabilidad y valor predeterminado.

### factor_transaccion_bancaria_conexion

Conexión administrable de lectura al MySQL remoto de movimientos del factor. Contraseña cifrada con AES-256-GCM y clave maestra externa a esta base. No configura credenciales de banca electrónica, escritura remota, pagos ni replicación bidireccional.

| Columna | Tipo, nulabilidad y predeterminado | Comentario persistido |
| --- | --- | --- |
| `_idfactortransaccionbancariaconexion` | `INT UNSIGNED NOT NULL AUTO_INCREMENT` | PK interna autoincremental. Identifica este registro para relaciones internas; no se acepta desde la interfaz ni representa el identificador de una operación bancaria. |
| `factortransaccionbancariaconexionid` | `VARCHAR(50) NOT NULL DEFAULT (uuid())` | UUID público único y estable según el estándar del proyecto. Se utiliza en API y permanece tras correcciones, cambios de presentación y eliminación lógica. |
| `code` | `VARCHAR(20) NOT NULL` | Código único de presentación generado por el servicio según el estándar del proyecto. No sustituye al UUID ni al número de operación del banco. |
| `alias` | `VARCHAR(200) NOT NULL` | Nombre de presentación de la conexión para administradores autorizados. No se usa para autenticar, construir SQL ni determinar las cuentas permitidas. |
| `motor` | `VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'MYSQL'` | Motor de origen fijado a MYSQL en esta versión. El destino de este DDL es MariaDB del proyecto; esta columna no cambia el motor local ni permite DDL en el servidor remoto. |
| `host` | `VARCHAR(253) NOT NULL` | DNS o dirección del servidor MySQL, sin esquema ni credenciales. El backend exige un destino aprobado por infraestructura y verifica certificado e identidad TLS; no permite destinos arbitrarios desde la interfaz. |
| `puerto` | `SMALLINT UNSIGNED NOT NULL DEFAULT 3306` | Puerto TCP del MySQL entre 1 y 65535, sujeto a lista de destinos y puertos autorizados. No habilita explorar otros servicios de red. |
| `base_datos` | `VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL` | Nombre exacto de la base MySQL autorizada. Se valida como identificador y se escapa con el driver; no admite URL, credenciales ni fragmentos SQL. |
| `tabla_origen` | `VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'bcp_transaccion_ahorro'` | Tabla o vista de lectura que satisface el contrato de columnas del origen. No admite consultas libres, JOIN ni expresiones; cambiarla requiere validar el mismo contrato antes de habilitarla. |
| `usuario` | `VARCHAR(128) NOT NULL` | Usuario MySQL exclusivo con SELECT sobre la tabla o vista autorizada. Los permisos reales se verifican en origen; nunca se requieren INSERT, UPDATE, DELETE ni DDL. |
| `password_cifrado` | `VARBINARY(2048) NOT NULL` | Bytes de la contraseña cifrada con AES-256-GCM, sin Base64 ni tag concatenado. Nunca se devuelve al frontend, se registra en logs ni se copia al historial. La interfaz permite reemplazarla, no recuperarla. |
| `password_nonce` | `BINARY(12) NOT NULL` | Nonce criptográficamente aleatorio de 96 bits por cifrado. Debe ser único bajo la misma clave, incluidas rotaciones; no se deriva de la hora, el UUID ni la contraseña. |
| `password_tag` | `BINARY(16) NOT NULL` | Etiqueta de autenticación GCM de 128 bits. Debe verificarse antes de usar la contraseña; ante fallo se rechaza el secreto sin recurrir a otro modo de descifrado. |
| `clave_version` | `VARCHAR(50) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | Identificador de la clave externa de 256 bits utilizada, dedicada a este módulo. No contiene la clave; el backend la resuelve fuera de la base y conserva versiones necesarias durante la rotación. |
| `cifrado_version` | `SMALLINT UNSIGNED NOT NULL DEFAULT 1` | Formato V1: AES-256-GCM, nonce de 12 bytes, tag de 16 y AAD canónico ligado al UUID de conexión, campo password y versión de clave. Cambiar el formato requiere una migración explícita. |
| `tls_ca_referencia` | `VARCHAR(255) NULL` | Referencia autorizada a una CA instalada por infraestructura; NULL usa las autoridades del sistema. No admite rutas libres ni claves privadas. Verificar certificado y nombre del servidor es siempre obligatorio. |
| `habilitado` | `TINYINT NOT NULL DEFAULT 0` | 1 permite sincronizar y 0 suspende nuevas ejecuciones. Habilitar requiere validar SELECT, TLS y cuentas mapeadas; suspender no elimina movimientos ni historial. |
| `version` | `INT UNSIGNED NOT NULL DEFAULT 1` | Versión incremental para actualización optimista desde la interfaz. Se exige la versión vigente al modificar configuración o secreto; los eventos excluyen materiales criptográficos. |
| `idusuariocrea` | `INT NOT NULL` | Usuario autenticado o cuenta técnica habilitada responsable del alta. Se asigna explícitamente en el servicio; no se acepta del frontend ni se atribuye automáticamente al usuario 1. |
| `fechacrea` | `TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Instante de creación con milisegundos y sesión de base de datos en UTC. No representa la fecha civil bancaria ni debe desplazarla al visualizar el movimiento en Lima. |
| `idusuariomod` | `INT NOT NULL` | Usuario de la última modificación autorizada, obtenido de la sesión o cuenta técnica por el servicio. Se actualiza junto con el cambio y su evento histórico. |
| `fechamod` | `TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Instante UTC de última modificación, actualizado explícitamente por el servicio. No tiene ON UPDATE ni se utiliza como cursor de modificaciones del MySQL remoto. |
| `estado` | `TINYINT NOT NULL DEFAULT 1` | Vigencia lógica del proyecto: 1=ACTIVO y 2=ELIMINADO. No implica borrado físico, ausencia del origen, éxito de sincronización ni conciliación con pagos. |

**Índices y restricciones:**

- `PRIMARY KEY (_idfactortransaccionbancariaconexion)`
- `UNIQUE KEY UQ_ftbc_uuid (factortransaccionbancariaconexionid)`
- `UNIQUE KEY UQ_ftbc_code (code)`
- `UNIQUE KEY UQ_ftbc_nonce (clave_version, password_nonce)`
- `CONSTRAINT CK_ftbc_motor CHECK (motor = 'MYSQL')`
- `CONSTRAINT CK_ftbc_puerto CHECK (puerto BETWEEN 1 AND 65535)`
- `CONSTRAINT CK_ftbc_crypto CHECK (cifrado_version = 1 AND OCTET_LENGTH(password_cifrado) > 0)`
- `CONSTRAINT CK_ftbc_habilitado CHECK (habilitado IN (0, 1))`
- `CONSTRAINT CK_ftbc_version CHECK (version > 0)`
- `CONSTRAINT CK_ftbc_estado CHECK (estado IN (1, 2))`

### factor_transaccion_bancaria_origen_cuenta

Mapeo explícito de una cuenta o alias del MySQL a la cuenta bancaria real del factor. Admite varios alias para una cuenta local, sin deducir titularidad por últimos dígitos. Un mapeo utilizado por movimientos no se reasigna silenciosamente a otra cuenta.

| Columna | Tipo, nulabilidad y predeterminado | Comentario persistido |
| --- | --- | --- |
| `_idfactortransaccionbancariaorigencuenta` | `INT UNSIGNED NOT NULL AUTO_INCREMENT` | PK interna autoincremental. Identifica este registro para relaciones internas; no se acepta desde la interfaz ni representa el identificador de una operación bancaria. |
| `factortransaccionbancariaorigencuentaid` | `VARCHAR(50) NOT NULL DEFAULT (uuid())` | UUID público único y estable según el estándar del proyecto. Se utiliza en API y permanece tras correcciones, cambios de presentación y eliminación lógica. |
| `code` | `VARCHAR(20) NOT NULL` | Código único de presentación generado por el servicio según el estándar del proyecto. No sustituye al UUID ni al número de operación del banco. |
| `_idconexion` | `INT UNSIGNED NOT NULL` | Conexión MySQL a la que pertenece la etiqueta de cuenta. Una misma etiqueta puede existir en conexiones distintas; el servicio comprueba que la conexión esté habilitada. |
| `cuenta_origen` | `VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL` | Cuenta o alias remoto normalizado como texto. V1 elimina CR/LF y espacios externos, conservando ceros iniciales y caracteres internos; no transforma el valor en número. |
| `_idfactorcuentabancaria` | `INT UNSIGNED NOT NULL` | Cuenta bancaria del factor asignada explícitamente. El servicio valida titularidad, moneda y vigencia; nunca resuelve el mapeo solamente por últimos cuatro dígitos. |
| `habilitado` | `TINYINT NOT NULL DEFAULT 1` | 1 permite usar el mapeo y 0 lo suspende. Las transacciones históricas mantienen su referencia aunque se suspenda; no se borran ni se reasignan. |
| `version` | `INT UNSIGNED NOT NULL DEFAULT 1` | Versión incremental de concurrencia. Cambiar conexión o cuenta en un mapeo ya utilizado requiere un procedimiento revisado; no se altera la identidad histórica desde el CRUD ordinario. |
| `idusuariocrea` | `INT NOT NULL` | Usuario autenticado o cuenta técnica habilitada responsable del alta. Se asigna explícitamente en el servicio; no se acepta del frontend ni se atribuye automáticamente al usuario 1. |
| `fechacrea` | `TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Instante de creación con milisegundos y sesión de base de datos en UTC. No representa la fecha civil bancaria ni debe desplazarla al visualizar el movimiento en Lima. |
| `idusuariomod` | `INT NOT NULL` | Usuario de la última modificación autorizada, obtenido de la sesión o cuenta técnica por el servicio. Se actualiza junto con el cambio y su evento histórico. |
| `fechamod` | `TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Instante UTC de última modificación, actualizado explícitamente por el servicio. No tiene ON UPDATE ni se utiliza como cursor de modificaciones del MySQL remoto. |
| `estado` | `TINYINT NOT NULL DEFAULT 1` | Vigencia lógica del proyecto: 1=ACTIVO y 2=ELIMINADO. No implica borrado físico, ausencia del origen, éxito de sincronización ni conciliación con pagos. |

**Índices y restricciones:**

- `PRIMARY KEY (_idfactortransaccionbancariaorigencuenta)`
- `UNIQUE KEY UQ_ftboc_uuid (factortransaccionbancariaorigencuentaid)`
- `UNIQUE KEY UQ_ftboc_code (code)`
- `UNIQUE KEY UQ_ftboc_conexion_cuenta (_idconexion, cuenta_origen)`
- `KEY IX_ftboc_factorcuenta (_idfactorcuentabancaria)`
- `CONSTRAINT FK_ftboc_conexion FOREIGN KEY (_idconexion) REFERENCES factor_transaccion_bancaria_conexion (_idfactortransaccionbancariaconexion) ON DELETE RESTRICT ON UPDATE RESTRICT`
- `CONSTRAINT FK_ftboc_factorcuenta FOREIGN KEY (_idfactorcuentabancaria) REFERENCES factor_cuenta_bancaria (_idfactorcuentabancaria) ON DELETE RESTRICT ON UPDATE RESTRICT`
- `CONSTRAINT CK_ftboc_cuenta CHECK (CHAR_LENGTH(TRIM(cuenta_origen)) > 0)`
- `CONSTRAINT CK_ftboc_habilitado CHECK (habilitado IN (0, 1))`
- `CONSTRAINT CK_ftboc_version CHECK (version > 0)`
- `CONSTRAINT CK_ftboc_estado CHECK (estado IN (1, 2))`

### factor_transaccion_bancaria_sincronizacion

Registro operativo de extracción MySQL: carga histórica, ejecución programada y reintento manual. Conserva alcance y resultados, sin credenciales ni filas de clientes en mensajes técnicos. No es un cursor confiable del origen ni configura cron.

| Columna | Tipo, nulabilidad y predeterminado | Comentario persistido |
| --- | --- | --- |
| `_idfactortransaccionbancariasincronizacion` | `INT UNSIGNED NOT NULL AUTO_INCREMENT` | PK interna autoincremental. Identifica este registro para relaciones internas; no se acepta desde la interfaz ni representa el identificador de una operación bancaria. |
| `factortransaccionbancariasincronizacionid` | `VARCHAR(50) NOT NULL DEFAULT (uuid())` | UUID público único y estable según el estándar del proyecto. Se utiliza en API y permanece tras correcciones, cambios de presentación y eliminación lógica. |
| `code` | `VARCHAR(20) NOT NULL` | Código único de presentación generado por el servicio según el estándar del proyecto. No sustituye al UUID ni al número de operación del banco. |
| `_idconexion` | `INT UNSIGNED NOT NULL` | Conexión usada por la ejecución. Las cuentas incluidas deben pertenecer a sus mapeos habilitados; no se acepta una URL libre del cliente. |
| `disparador` | `VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | PROGRAMADA, MANUAL o CARGA_LEGADO. Solo CARGA_LEGADO incorpora enriquecimientos históricos bajo autorización separada; los reintentos conservan la idempotencia. |
| `resultado` | `VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'EN_CURSO'` | EN_CURSO, EXITOSA, PARCIAL, FALLIDA o INTERRUMPIDA. EXITOSA exige lectura completa y ausencia de incidencias de esa ejecución; PARCIAL puede haber confirmado lotes válidos. |
| `fecha_desde` | `DATE NULL` | Primer día bancario incluido, sin hora ni conversión de zona. NULL junto con fecha_hasta significa todo el histórico autorizado de las cuentas declaradas. |
| `fecha_hasta` | `DATE NULL` | Último día bancario incluido, de forma inclusiva. Debe ser igual o posterior a fecha_desde; ambos límites son nulos o ambos se informan. |
| `cuentas_alcance` | `JSON NOT NULL` | Array no vacío de UUID públicos de los mapeos incluidos al iniciar la ejecución. Congela el alcance, no contiene secretos y el servicio valida pertenencia a la conexión. |
| `inicio` | `TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Inicio UTC con milisegundos tras obtener bloqueo por conexión. El proceso no mantiene transacciones locales abiertas mientras espera respuesta de la red remota. |
| `fin` | `TIMESTAMP(3) NULL` | Finalización UTC, también en fallos e interrupciones recuperadas. NULL mientras EN_CURSO; marcar una ejecución abandonada exige comprobar que su trabajador ya no está activo. |
| `lectura_completa` | `TINYINT NOT NULL DEFAULT 0` | 1 solo cuando se leyó de forma consistente todo el alcance. La ausencia de una fila no autoriza borrarla ni anularla localmente, incluso tras una lectura completa. |
| `filas_leidas` | `INT UNSIGNED NOT NULL DEFAULT 0` | Filas remotas efectivamente leídas. Es una métrica de procesamiento, no un saldo ni la cantidad de nuevos movimientos locales. |
| `filas_insertadas` | `INT UNSIGNED NOT NULL DEFAULT 0` | Movimientos nuevos confirmados en lotes cortos e idempotentes. Excluye filas existentes y no acumula importes monetarios. |
| `filas_existentes` | `INT UNSIGNED NOT NULL DEFAULT 0` | Observaciones compatibles con identidades ya registradas, incluidas altas manuales luego reconocidas. No habilita sobrescribir el enriquecimiento local. |
| `filas_incidencia` | `INT UNSIGNED NOT NULL DEFAULT 0` | Filas con validaciones fallidas, identidad ambigua o diferencias pendientes. No se ocultan convirtiéndolas en actualizaciones o inserciones automáticas. |
| `error_codigo` | `VARCHAR(50) NULL` | Código técnico seguro definido por la aplicación. No se copia el mensaje original del driver, que podría revelar SQL, credenciales o datos de clientes. |
| `error_resumen` | `VARCHAR(500) NULL` | Resumen sanitizado para usuarios autorizados. Excluye filas bancarias completas, secretos, materiales criptográficos y cadenas de conexión. |
| `idusuariocrea` | `INT NOT NULL` | Usuario autenticado o cuenta técnica habilitada responsable del alta. Se asigna explícitamente en el servicio; no se acepta del frontend ni se atribuye automáticamente al usuario 1. |
| `fechacrea` | `TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Instante de creación con milisegundos y sesión de base de datos en UTC. No representa la fecha civil bancaria ni debe desplazarla al visualizar el movimiento en Lima. |
| `idusuariomod` | `INT NOT NULL` | Usuario de la última modificación autorizada, obtenido de la sesión o cuenta técnica por el servicio. Se actualiza junto con el cambio y su evento histórico. |
| `fechamod` | `TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Instante UTC de última modificación, actualizado explícitamente por el servicio. No tiene ON UPDATE ni se utiliza como cursor de modificaciones del MySQL remoto. |
| `estado` | `TINYINT NOT NULL DEFAULT 1` | Vigencia lógica del proyecto: 1=ACTIVO y 2=ELIMINADO. No implica borrado físico, ausencia del origen, éxito de sincronización ni conciliación con pagos. |

**Índices y restricciones:**

- `PRIMARY KEY (_idfactortransaccionbancariasincronizacion)`
- `UNIQUE KEY UQ_ftbs_uuid (factortransaccionbancariasincronizacionid)`
- `UNIQUE KEY UQ_ftbs_code (code)`
- `KEY IX_ftbs_conexion_inicio (_idconexion, inicio)`
- `CONSTRAINT FK_ftbs_conexion FOREIGN KEY (_idconexion) REFERENCES factor_transaccion_bancaria_conexion (_idfactortransaccionbancariaconexion) ON DELETE RESTRICT ON UPDATE RESTRICT`
- `CONSTRAINT CK_ftbs_disparador CHECK (disparador IN ('PROGRAMADA', 'MANUAL', 'CARGA_LEGADO'))`
- `CONSTRAINT CK_ftbs_resultado CHECK (resultado IN ('EN_CURSO', 'EXITOSA', 'PARCIAL', 'FALLIDA', 'INTERRUMPIDA'))`
- `CONSTRAINT CK_ftbs_periodo CHECK ((fecha_desde IS NULL AND fecha_hasta IS NULL) OR (fecha_desde IS NOT NULL AND fecha_hasta IS NOT NULL AND fecha_hasta >= fecha_desde))`
- `CONSTRAINT CK_ftbs_fin CHECK ((resultado = 'EN_CURSO' AND fin IS NULL) OR (resultado <> 'EN_CURSO' AND fin IS NOT NULL AND fin >= inicio))`
- `CONSTRAINT CK_ftbs_completa CHECK (lectura_completa IN (0, 1))`
- `CONSTRAINT CK_ftbs_exitosa CHECK (resultado <> 'EXITOSA' OR (lectura_completa = 1 AND filas_incidencia = 0 AND error_codigo IS NULL))`
- `CONSTRAINT CK_ftbs_cuentas CHECK (JSON_TYPE(cuentas_alcance) = 'ARRAY' AND JSON_LENGTH(cuentas_alcance) > 0)`
- `CONSTRAINT CK_ftbs_estado CHECK (estado IN (1, 2))`

### factor_transaccion_bancaria

Movimiento bancario observado o manual en una cuenta real del factor. Monto estrictamente positivo, signo 1=abono y -1=cargo. Conserva identidad inicial, evidencia remota y enriquecimiento local. No registra pagos, no concilia factoring ni modifica saldos de otros módulos.

| Columna | Tipo, nulabilidad y predeterminado | Comentario persistido |
| --- | --- | --- |
| `_idfactortransaccionbancaria` | `INT UNSIGNED NOT NULL AUTO_INCREMENT` | PK interna autoincremental. Identifica este registro para relaciones internas; no se acepta desde la interfaz ni representa el identificador de una operación bancaria. |
| `factortransaccionbancariaid` | `VARCHAR(50) NOT NULL DEFAULT (uuid())` | UUID público único y estable según el estándar del proyecto. Se utiliza en API y permanece tras correcciones, cambios de presentación y eliminación lógica. |
| `code` | `VARCHAR(20) NOT NULL` | Código único de presentación generado por el servicio según el estándar del proyecto. No sustituye al UUID ni al número de operación del banco. |
| `_idfactorcuentabancaria` | `INT UNSIGNED NOT NULL` | Cuenta del factor del movimiento; debe coincidir con el mapeo remoto cuando exista. Permanece estable después del alta: una asignación errónea requiere resolución auditada conservando la identidad inicial. |
| `numero_operacion` | `VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL` | Código de operación normalizado como texto, preservando ceros iniciales. No es único por sí solo. Las correcciones operativas conservan la identidad inicial y su historial. |
| `fecha` | `DATE NOT NULL` | Fecha civil bancaria sin hora ni conversión UTC/Lima. Integra la identidad inicial; una corrección no permite que una relectura del origen duplique el registro. |
| `descripcion` | `VARCHAR(500) NOT NULL` | Descripción bancaria vigente, inicialmente copiada de origen o alta manual. No integra la identidad; una diferencia remota genera incidencia sin sobrescribirla silenciosamente. |
| `signo` | `TINYINT NOT NULL` | Dirección respecto de la cuenta del factor: 1=abono o ingreso y -1=cargo o egreso. Cero no está permitido. Determina la dirección de monto y monto_neto; no se almacenan importes operativos negativos. |
| `monto` | `DECIMAL(20,2) NOT NULL` | Magnitud estrictamente positiva en la moneda del movimiento. Efecto firmado=signo por monto. Se usa aritmética decimal exacta, nunca Number para normalizar dinero, y no se persiste otro monto firmado. |
| `origen_alta` | `VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | Procedencia inicial inmutable: MANUAL, SINCRONIZACION o LEGADO. Un alta manual luego observada en MySQL mantiene su UUID, autoría y origen_alta. |
| `identidad_version` | `SMALLINT UNSIGNED NOT NULL DEFAULT 1` | Versión de normalización y serialización de identidad. V1 usa cuenta local, fecha, operación, signo y monto positivo fijo. Un cambio de algoritmo no reescribe retroactivamente las identidades existentes. |
| `identidad_datos` | `JSON NOT NULL` | Tupla inicial inmutable V1, en orden: ID interno de cuenta como texto, fecha YYYY-MM-DD, operación normalizada, signo como texto 1 o -1 y monto positivo con dos decimales como texto. Excluye descripción, fuente y estado. |
| `identidad_sha256` | `CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | SHA-256 hexadecimal minúsculo del JSON canónico UTF-8 de la tupla inicial. El servicio lo calcula, compara componentes ante coincidencias y no lo acepta del frontend ni lo recalcula tras una corrección operativa. |
| `_idorigencuenta` | `INT UNSIGNED NULL` | Mapeo vinculado cuando se confirma evidencia MySQL. NULL mientras el alta es solo manual; vincularlo exige verificar identidad, cuenta y moneda sin sobrescribir enriquecimientos. |
| `datos_origen_iniciales` | `JSON NULL` | Copia inmutable de los siete campos recibidos; LEGADO incluye también enriquecimientos históricos. Conserva valores originales, incluidos montos firmados como texto de evidencia, nunca como importes operativos. Excluye secretos. |
| `_idsincronizacion_inicial` | `INT UNSIGNED NULL` | Primera ejecución que confirmó evidencia remota. Se completa si un alta manual aparece luego en MySQL sin cambiar su autoría ni identidad local. |
| `_idsincronizacion_ultima` | `INT UNSIGNED NULL` | Última ejecución que observó de forma compatible la identidad en MySQL. Las diferencias o datos inválidos producen incidencia y no confirman una versión operativa nueva. |
| `ultima_observacion` | `TIMESTAMP(3) NULL` | Instante UTC de última observación compatible. No es fecha de modificación bancaria ni cursor incremental y no prueba que el banco no haya publicado otros movimientos. |
| `tipo_operacion` | `VARCHAR(500) NULL` | Clasificación operativa local compatible inicialmente con tipooperacion remoto. Se preserva en la carga histórica y no se sobrescribe en relecturas; la descripción no aprueba una regla financiera automática. |
| `detalle_fecha` | `DATE NULL` | Fecha civil adicional de comprobante o detalle bancario. NULL es desconocida; no se inventa copiando fecha ni se desplaza mediante UTC/Lima. |
| `detalle_hora` | `TIME(0) NULL` | Hora local del detalle en Lima, no duración ni instante UTC. La carga histórica valida el texto remoto y genera incidencia si no representa una hora entre 00:00:00 y 23:59:59. |
| `origen_cuenta` | `VARCHAR(500) NULL` | Cuenta de la contraparte ordenante según evidencia, como texto con ceros iniciales. Puede ser desconocida y no crea automáticamente cuentas ni relaciones de otros módulos. |
| `origen_nombre` | `VARCHAR(500) NULL` | Nombre del ordenante obtenido de evidencia o completado localmente. Es información sensible, editable con historial y excluida de logs técnicos. |
| `origen_comision` | `DECIMAL(20,2) NULL` | Magnitud no negativa de comisión de origen. NULL es desconocido y 0 es comisión conocida igual a cero. No determina dirección ni modifica automáticamente monto. |
| `destino_cuenta` | `VARCHAR(500) NULL` | Cuenta de contraparte beneficiaria según evidencia. Se conserva como texto; no sustituye la cuenta del factor ni crea una asociación con pagos o factoring. |
| `destino_nombre` | `VARCHAR(500) NULL` | Nombre del beneficiario registrado desde evidencia o completado localmente. Su cambio se audita y no se utiliza como identidad del movimiento. |
| `destino_comision` | `DECIMAL(20,2) NULL` | Magnitud no negativa de comisión de destino cuando se conoce. NULL y 0 son distintos; no se aplica una fórmula automática de neto a partir de este campo. |
| `monto_neto` | `DECIMAL(20,2) NULL` | Magnitud no negativa del neto, cuya dirección la determina signo. El legado firmado se transforma solo tras validar coherencia de dirección; NULL es desconocido y no se deduce una fórmula universal de comisiones. |
| `referencia_descripcion` | `VARCHAR(500) NULL` | Explicación operativa local preservada del legado. Se modifica con historial y nunca se sobrescribe mediante sincronización recurrente. |
| `referencia_proveedor_ruc` | `VARCHAR(50) NULL` | Referencia textual histórica al RUC del proveedor. No es FK ni implica una relación validada con empresas del proyecto. |
| `referencia_proveedor_factura` | `VARCHAR(50) NULL` | Referencia textual histórica a factura del proveedor. No crea comprobantes, vínculos ni aplicaciones monetarias dentro de esta etapa. |
| `referencia_proveedor_boleta` | `VARCHAR(50) NULL` | Referencia textual histórica a boleta de proveedor. NULL indica ausencia; no se convierte en factura ni en asociación automática. |
| `referencia_ft_factura` | `VARCHAR(50) NULL` | Referencia textual histórica a comprobante del factor. Se preserva para trazabilidad, sin FK ni creación de relaciones con comprobantes. |
| `referencia_ft_op_factoring` | `VARCHAR(200) NULL` | Referencia textual histórica que puede mencionar varias operaciones. Se conserva íntegra, sin interpretarla, repartir importes ni vincularla con factoring o pagos en esta etapa. |
| `motivo_anulacion` | `VARCHAR(500) NULL` | Justificación obligatoria cuando estado=2. La anulación conserva identidad e historial para que una relectura no recree el movimiento; no anula registros de otros módulos. |
| `version` | `INT UNSIGNED NOT NULL DEFAULT 1` | Versión incremental para edición optimista. Enriquecer, corregir o anular exige la versión vigente y anexar el evento en la misma transacción del cambio. |
| `idusuariocrea` | `INT NOT NULL` | Usuario autenticado o cuenta técnica habilitada responsable del alta. Se asigna explícitamente en el servicio; no se acepta del frontend ni se atribuye automáticamente al usuario 1. |
| `fechacrea` | `TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Instante de creación con milisegundos y sesión de base de datos en UTC. No representa la fecha civil bancaria ni debe desplazarla al visualizar el movimiento en Lima. |
| `idusuariomod` | `INT NOT NULL` | Usuario de la última modificación autorizada, obtenido de la sesión o cuenta técnica por el servicio. Se actualiza junto con el cambio y su evento histórico. |
| `fechamod` | `TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Instante UTC de última modificación, actualizado explícitamente por el servicio. No tiene ON UPDATE ni se utiliza como cursor de modificaciones del MySQL remoto. |
| `estado` | `TINYINT NOT NULL DEFAULT 1` | Vigencia lógica del proyecto: 1=ACTIVO y 2=ELIMINADO. No implica borrado físico, ausencia del origen, éxito de sincronización ni conciliación con pagos. |

**Índices y restricciones:**

- `PRIMARY KEY (_idfactortransaccionbancaria)`
- `UNIQUE KEY UQ_ftb_uuid (factortransaccionbancariaid)`
- `UNIQUE KEY UQ_ftb_code (code)`
- `UNIQUE KEY UQ_ftb_identidad (identidad_sha256)`
- `KEY IX_ftb_cuenta_fecha (_idfactorcuentabancaria, fecha)`
- `KEY IX_ftb_origen (_idorigencuenta)`
- `KEY IX_ftb_sync_inicial (_idsincronizacion_inicial)`
- `KEY IX_ftb_sync_ultima (_idsincronizacion_ultima)`
- `CONSTRAINT FK_ftb_factorcuenta FOREIGN KEY (_idfactorcuentabancaria) REFERENCES factor_cuenta_bancaria (_idfactorcuentabancaria) ON DELETE RESTRICT ON UPDATE RESTRICT`
- `CONSTRAINT FK_ftb_origen FOREIGN KEY (_idorigencuenta) REFERENCES factor_transaccion_bancaria_origen_cuenta (_idfactortransaccionbancariaorigencuenta) ON DELETE RESTRICT ON UPDATE RESTRICT`
- `CONSTRAINT FK_ftb_sync_inicial FOREIGN KEY (_idsincronizacion_inicial) REFERENCES factor_transaccion_bancaria_sincronizacion (_idfactortransaccionbancariasincronizacion) ON DELETE RESTRICT ON UPDATE RESTRICT`
- `CONSTRAINT FK_ftb_sync_ultima FOREIGN KEY (_idsincronizacion_ultima) REFERENCES factor_transaccion_bancaria_sincronizacion (_idfactortransaccionbancariasincronizacion) ON DELETE RESTRICT ON UPDATE RESTRICT`
- `CONSTRAINT CK_ftb_signo CHECK (signo IN (-1, 1))`
- `CONSTRAINT CK_ftb_monto CHECK (monto > 0)`
- `CONSTRAINT CK_ftb_comisiones CHECK ((origen_comision IS NULL OR origen_comision >= 0) AND (destino_comision IS NULL OR destino_comision >= 0))`
- `CONSTRAINT CK_ftb_neto CHECK (monto_neto IS NULL OR monto_neto >= 0)`
- `CONSTRAINT CK_ftb_hora CHECK (detalle_hora IS NULL OR (detalle_hora >= '00:00:00' AND detalle_hora <= '23:59:59'))`
- `CONSTRAINT CK_ftb_origen_alta CHECK (origen_alta IN ('MANUAL', 'SINCRONIZACION', 'LEGADO'))`
- `CONSTRAINT CK_ftb_identidad CHECK (identidad_version = 1 AND JSON_TYPE(identidad_datos) = 'ARRAY' AND JSON_LENGTH(identidad_datos) = 5 AND identidad_sha256 REGEXP '^[0-9a-f]{64}$')`
- `CONSTRAINT CK_ftb_operacion CHECK (CHAR_LENGTH(TRIM(numero_operacion)) > 0)`
- `CONSTRAINT CK_ftb_evidencia CHECK ((_idorigencuenta IS NULL AND datos_origen_iniciales IS NULL AND _idsincronizacion_inicial IS NULL AND _idsincronizacion_ultima IS NULL AND ultima_observacion IS NULL) OR (_idorigencuenta IS NOT NULL AND datos_origen_iniciales IS NOT NULL AND _idsincronizacion_inicial IS NOT NULL AND _idsincronizacion_ultima IS NOT NULL AND ultima_observacion IS NOT NULL))`
- `CONSTRAINT CK_ftb_importada CHECK (origen_alta = 'MANUAL' OR _idorigencuenta IS NOT NULL)`
- `CONSTRAINT CK_ftb_snapshot CHECK (datos_origen_iniciales IS NULL OR JSON_TYPE(datos_origen_iniciales) = 'OBJECT')`
- `CONSTRAINT CK_ftb_anulacion CHECK ((estado = 1 AND motivo_anulacion IS NULL) OR (estado = 2 AND motivo_anulacion IS NOT NULL AND CHAR_LENGTH(TRIM(motivo_anulacion)) > 0))`
- `CONSTRAINT CK_ftb_version CHECK (version > 0)`
- `CONSTRAINT CK_ftb_estado CHECK (estado IN (1, 2))`

### factor_transaccion_bancaria_incidencia

Conflicto de importación o revisión manual: cuenta desconocida, moneda o signo incompatible, duplicado ambiguo o diferencia del origen. La resolución es explícita y auditada; no confirma pagos, no corrige MySQL ni oculta diferencias financieras.

| Columna | Tipo, nulabilidad y predeterminado | Comentario persistido |
| --- | --- | --- |
| `_idfactortransaccionbancariaincidencia` | `INT UNSIGNED NOT NULL AUTO_INCREMENT` | PK interna autoincremental. Identifica este registro para relaciones internas; no se acepta desde la interfaz ni representa el identificador de una operación bancaria. |
| `factortransaccionbancariaincidenciaid` | `VARCHAR(50) NOT NULL DEFAULT (uuid())` | UUID público único y estable según el estándar del proyecto. Se utiliza en API y permanece tras correcciones, cambios de presentación y eliminación lógica. |
| `code` | `VARCHAR(20) NOT NULL` | Código único de presentación generado por el servicio según el estándar del proyecto. No sustituye al UUID ni al número de operación del banco. |
| `_idconexion` | `INT UNSIGNED NULL` | Conexión implicada en un conflicto remoto. NULL para incidencias puramente manuales; el servicio valida coincidencia con las ejecuciones relacionadas. |
| `_idsincronizacion_inicial` | `INT UNSIGNED NULL` | Ejecución en la que apareció el conflicto. Al repetirse, se conserva esta referencia y se actualizan última ejecución y contador. |
| `_idsincronizacion_ultima` | `INT UNSIGNED NULL` | Última ejecución que observó el mismo conflicto. Debe pertenecer a la misma conexión; no se inserta indefinidamente una alerta idéntica por cada relectura. |
| `_idfactortransaccionbancaria` | `INT UNSIGNED NULL` | Movimiento local implicado, si existe. NULL cuando una fila no pudo convertirse en movimiento válido; no se crea una transacción ficticia para completar la relación. |
| `tipo` | `VARCHAR(50) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | Código estable validado por servicio: por ejemplo CUENTA_SIN_MAPEO, SIGNO_INCONSISTENTE, MONEDA_INCONSISTENTE, IDENTIDAD_AMBIGUA o DATOS_ORIGEN_DISTINTOS. No depende del mensaje del driver. |
| `huella` | `CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | SHA-256 canónico del alcance, tipo y evidencia relevante para agrupar repeticiones. No es la identidad del movimiento; un conflicto con contenido distinto puede producir otra incidencia. |
| `datos_revision` | `JSON NOT NULL` | Evidencia mínima estructurada para revisión financiera, con campos fuente afectados y referencias locales. Excluye contraseñas, nonce, tag, clave y URL de conexión; su acceso es restringido. |
| `situacion` | `VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'PENDIENTE'` | PENDIENTE, RESUELTA o DESCARTADA. Resolver o descartar exige motivo; la repetición posterior reabre con historial. Descartar no convierte una fila inválida en válida. |
| `veces_observada` | `INT UNSIGNED NOT NULL DEFAULT 1` | Repeticiones de esta huella, incrementadas con control de concurrencia. No representa cantidad de movimientos bancarios reales. |
| `ultima_observacion` | `TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Última observación UTC del conflicto. La primera se conserva en fechacrea; estas fechas describen el proceso local, no la fecha bancaria. |
| `resolucion_motivo` | `VARCHAR(500) NULL` | Justificación obligatoria al resolver o descartar, con evidencia y acción tomada. No sustituye el evento histórico ni autoriza escritura en MySQL remoto. |
| `idusuarioresuelve` | `INT NULL` | Usuario autenticado de la resolución o descarte. Lo establece el servicio junto con fecha y motivo; no se acepta libremente del payload. |
| `resolucion_fecha` | `TIMESTAMP(3) NULL` | Instante UTC de resolución o descarte. NULL mientras pendiente; al reabrir se conserva la resolución anterior en historial antes de limpiar estos campos. |
| `version` | `INT UNSIGNED NOT NULL DEFAULT 1` | Versión incremental para evitar que dos revisores pierdan o sobrescriban decisiones concurrentes sobre la misma incidencia. |
| `idusuariocrea` | `INT NOT NULL` | Usuario autenticado o cuenta técnica habilitada responsable del alta. Se asigna explícitamente en el servicio; no se acepta del frontend ni se atribuye automáticamente al usuario 1. |
| `fechacrea` | `TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Instante de creación con milisegundos y sesión de base de datos en UTC. No representa la fecha civil bancaria ni debe desplazarla al visualizar el movimiento en Lima. |
| `idusuariomod` | `INT NOT NULL` | Usuario de la última modificación autorizada, obtenido de la sesión o cuenta técnica por el servicio. Se actualiza junto con el cambio y su evento histórico. |
| `fechamod` | `TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Instante UTC de última modificación, actualizado explícitamente por el servicio. No tiene ON UPDATE ni se utiliza como cursor de modificaciones del MySQL remoto. |
| `estado` | `TINYINT NOT NULL DEFAULT 1` | Vigencia lógica del proyecto: 1=ACTIVO y 2=ELIMINADO. No implica borrado físico, ausencia del origen, éxito de sincronización ni conciliación con pagos. |

**Índices y restricciones:**

- `PRIMARY KEY (_idfactortransaccionbancariaincidencia)`
- `UNIQUE KEY UQ_ftbi_uuid (factortransaccionbancariaincidenciaid)`
- `UNIQUE KEY UQ_ftbi_code (code)`
- `UNIQUE KEY UQ_ftbi_huella (huella)`
- `KEY IX_ftbi_revision (situacion, ultima_observacion)`
- `KEY IX_ftbi_conexion (_idconexion)`
- `KEY IX_ftbi_sync_inicial (_idsincronizacion_inicial)`
- `KEY IX_ftbi_sync_ultima (_idsincronizacion_ultima)`
- `KEY IX_ftbi_movimiento (_idfactortransaccionbancaria)`
- `CONSTRAINT FK_ftbi_conexion FOREIGN KEY (_idconexion) REFERENCES factor_transaccion_bancaria_conexion (_idfactortransaccionbancariaconexion) ON DELETE RESTRICT ON UPDATE RESTRICT`
- `CONSTRAINT FK_ftbi_sync_inicial FOREIGN KEY (_idsincronizacion_inicial) REFERENCES factor_transaccion_bancaria_sincronizacion (_idfactortransaccionbancariasincronizacion) ON DELETE RESTRICT ON UPDATE RESTRICT`
- `CONSTRAINT FK_ftbi_sync_ultima FOREIGN KEY (_idsincronizacion_ultima) REFERENCES factor_transaccion_bancaria_sincronizacion (_idfactortransaccionbancariasincronizacion) ON DELETE RESTRICT ON UPDATE RESTRICT`
- `CONSTRAINT FK_ftbi_movimiento FOREIGN KEY (_idfactortransaccionbancaria) REFERENCES factor_transaccion_bancaria (_idfactortransaccionbancaria) ON DELETE RESTRICT ON UPDATE RESTRICT`
- `CONSTRAINT CK_ftbi_huella CHECK (huella REGEXP '^[0-9a-f]{64}$')`
- `CONSTRAINT CK_ftbi_situacion CHECK (situacion IN ('PENDIENTE', 'RESUELTA', 'DESCARTADA'))`
- `CONSTRAINT CK_ftbi_resolucion CHECK ((situacion = 'PENDIENTE' AND resolucion_motivo IS NULL AND idusuarioresuelve IS NULL AND resolucion_fecha IS NULL) OR (situacion <> 'PENDIENTE' AND resolucion_motivo IS NOT NULL AND CHAR_LENGTH(TRIM(resolucion_motivo)) > 0 AND idusuarioresuelve IS NOT NULL AND resolucion_fecha IS NOT NULL))`
- `CONSTRAINT CK_ftbi_sync CHECK ((_idsincronizacion_inicial IS NULL AND _idsincronizacion_ultima IS NULL) OR (_idsincronizacion_inicial IS NOT NULL AND _idsincronizacion_ultima IS NOT NULL AND _idconexion IS NOT NULL))`
- `CONSTRAINT CK_ftbi_contadores CHECK (veces_observada > 0 AND version > 0)`
- `CONSTRAINT CK_ftbi_estado CHECK (estado IN (1, 2))`

### factor_transaccion_bancaria_historial

Historial de solo anexado de movimientos, conexión MySQL, mapeos e incidencias. Cada evento referencia exactamente una entidad y conserva actor, motivo y cambios autorizados. No contiene secretos ni material criptográfico y no se borra desde el CRUD.

| Columna | Tipo, nulabilidad y predeterminado | Comentario persistido |
| --- | --- | --- |
| `_idfactortransaccionbancariahistorial` | `INT UNSIGNED NOT NULL AUTO_INCREMENT` | PK interna autoincremental. Identifica este registro para relaciones internas; no se acepta desde la interfaz ni representa el identificador de una operación bancaria. |
| `factortransaccionbancariahistorialid` | `VARCHAR(50) NOT NULL DEFAULT (uuid())` | UUID público único y estable según el estándar del proyecto. Se utiliza en API y permanece tras correcciones, cambios de presentación y eliminación lógica. |
| `code` | `VARCHAR(20) NOT NULL` | Código único de presentación generado por el servicio según el estándar del proyecto. No sustituye al UUID ni al número de operación del banco. |
| `_idfactortransaccionbancaria` | `INT UNSIGNED NULL` | Movimiento afectado por alta, enriquecimiento, corrección, anulación o vinculación. Exactamente una de las cuatro referencias de entidad del evento debe estar definida. |
| `_idconexion` | `INT UNSIGNED NULL` | Conexión afectada por configuración o rotación de secreto. Registra que cambió la contraseña, sin valor, ciphertext, nonce, tag ni clave externa. |
| `_idorigencuenta` | `INT UNSIGNED NULL` | Mapeo afectado por alta, habilitación o suspensión. No habilita reasignar silenciosamente movimientos históricos a otra cuenta. |
| `_idincidencia` | `INT UNSIGNED NULL` | Incidencia resuelta, descartada o reabierta. Se conserva motivo y evidencia con acceso restringido; la acción no equivale a registrar pagos. |
| `evento` | `VARCHAR(50) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | Código estable validado por servicio, como ALTA, ENRIQUECIMIENTO, CORRECCION, ANULACION, VINCULO_ORIGEN, ROTACION_SECRETO, RESOLUCION o REAPERTURA. Su etiqueta no determina permisos. |
| `motivo` | `VARCHAR(500) NOT NULL` | Justificación del cambio o descripción del alta, obligatoria y registrada con el actor. Excluye secretos, cadenas de conexión y mensajes del driver sin sanitizar. |
| `datos_antes` | `JSON NULL` | Valores previos de campos afectados según lista permitida por entidad; NULL en altas. En conexión excluye contraseña y materiales criptográficos; en movimiento protege datos de contrapartes. |
| `datos_despues` | `JSON NULL` | Valores posteriores permitidos o resumen de acción sin secretos. Se anexa en la misma transacción del cambio; una rotación registra solo metadatos autorizados que no reconstruyen la contraseña. |
| `idusuariocrea` | `INT NOT NULL` | Usuario autenticado o cuenta técnica habilitada responsable del alta. Se asigna explícitamente en el servicio; no se acepta del frontend ni se atribuye automáticamente al usuario 1. |
| `fechacrea` | `TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Instante de creación con milisegundos y sesión de base de datos en UTC. No representa la fecha civil bancaria ni debe desplazarla al visualizar el movimiento en Lima. |
| `idusuariomod` | `INT NOT NULL` | Usuario de creación conservado por convención. El historial es de solo anexado: las rectificaciones generan otro evento y no modifican este registro. |
| `fechamod` | `TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Instante de creación conservado por convención. Este evento no se edita desde el módulo; una rectificación posterior se anexa como otro evento. |
| `estado` | `TINYINT NOT NULL DEFAULT 1` | Vigencia técnica fija en 1=ACTIVO. El CRUD no elimina lógica ni físicamente eventos históricos; el campo conserva la convención del proyecto. |

**Índices y restricciones:**

- `PRIMARY KEY (_idfactortransaccionbancariahistorial)`
- `UNIQUE KEY UQ_ftbh_uuid (factortransaccionbancariahistorialid)`
- `UNIQUE KEY UQ_ftbh_code (code)`
- `KEY IX_ftbh_movimiento_fecha (_idfactortransaccionbancaria, fechacrea)`
- `KEY IX_ftbh_conexion_fecha (_idconexion, fechacrea)`
- `KEY IX_ftbh_mapeo_fecha (_idorigencuenta, fechacrea)`
- `KEY IX_ftbh_incidencia_fecha (_idincidencia, fechacrea)`
- `CONSTRAINT FK_ftbh_movimiento FOREIGN KEY (_idfactortransaccionbancaria) REFERENCES factor_transaccion_bancaria (_idfactortransaccionbancaria) ON DELETE RESTRICT ON UPDATE RESTRICT`
- `CONSTRAINT FK_ftbh_conexion FOREIGN KEY (_idconexion) REFERENCES factor_transaccion_bancaria_conexion (_idfactortransaccionbancariaconexion) ON DELETE RESTRICT ON UPDATE RESTRICT`
- `CONSTRAINT FK_ftbh_origen FOREIGN KEY (_idorigencuenta) REFERENCES factor_transaccion_bancaria_origen_cuenta (_idfactortransaccionbancariaorigencuenta) ON DELETE RESTRICT ON UPDATE RESTRICT`
- `CONSTRAINT FK_ftbh_incidencia FOREIGN KEY (_idincidencia) REFERENCES factor_transaccion_bancaria_incidencia (_idfactortransaccionbancariaincidencia) ON DELETE RESTRICT ON UPDATE RESTRICT`
- `CONSTRAINT CK_ftbh_entidad CHECK ((_idfactortransaccionbancaria IS NOT NULL) + (_idconexion IS NOT NULL) + (_idorigencuenta IS NOT NULL) + (_idincidencia IS NOT NULL) = 1)`
- `CONSTRAINT CK_ftbh_motivo CHECK (CHAR_LENGTH(TRIM(motivo)) > 0)`
- `CONSTRAINT CK_ftbh_estado CHECK (estado = 1)`
