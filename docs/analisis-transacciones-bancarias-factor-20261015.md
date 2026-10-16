# Propuesta de movimientos bancarios del factor

Fecha: 15/10/2026. Estado: análisis y diseño propuesto, pendiente de decisiones; no autoriza implementación ni DDL.

> Actualización tras la revisión del usuario: el [modelo detallado vigente](transacciones-bancarias/modelo-propuesto.md) reemplaza las propuestas iniciales de monto firmado, conexión fuera de interfaz y relaciones con pagos. El diseño actual usa monto positivo y signo ±1, configura el origen MySQL con GCM y excluye tablas o relaciones de pagos. Este documento conserva el análisis inicial como antecedente; no debe utilizarse como especificación ejecutable.

## Dictamen

Sí conviene incorporar los movimientos bancarios del factor en esta base. Propongo `factor_transaccion_bancaria`, relacionada con `factor_cuenta_bancaria`. El objetivo es disponer de evidencia bancaria local, enriquecimiento operativo y conciliación con entidades de factoring. La importación debe ser unidireccional y repetible, con reglas de propiedad de campos. La replicación técnica de tablas no resuelve esas reglas.

La ausencia de un identificador bancario estable no impide empezar con la regla de identidad aceptada por el usuario, pero exige registrar conflictos y reconocer que dos movimientos reales con la misma combinación pueden resultar indistinguibles. Un UUID local identifica el registro del proyecto; no elimina esa ambigüedad del origen.

## Evidencia y límites

Se revisaron los seis archivos adjuntos, el esquema Prisma local, las referencias de pagos en el código, `cryptoUtils.ts`, la configuración de correo y la guía de mantenimiento DDL. Los SQL se leyeron como evidencia; no se ejecutaron.

La muestra adjunta contiene 223 INSERT, dos cuentas y monedas PEN/USD. Es una fotografía de archivos, no un inventario del servidor. Se pudo interpretar cada INSERT y comparar sus campos sin cargarlo en una base. No aparecieron grupos duplicados según la combinación cuenta/fecha/operación/signo/monto en esa muestra; esto no acredita unicidad histórica ni futura.

Hallazgos relevantes:

- El DDL remoto **sí declara una PK compuesta**: cuenta, numerooperacion, fecha, descripcion y monto. No dispone de un ID estable independiente de esos datos. Su PK incluye descripción y omite signo, a diferencia de la regla de detección de duplicados indicada por el usuario.
- Los montos de la muestra ya tienen signo. `sumaoresta` contiene `Suma`/`Resta`; la consulta de Excel compara con `+`. Tras mapear explícitamente ambas representaciones, no hay discrepancias entre signo y monto en la muestra. No multiplicar nuevamente los egresos por -1.
- `numerooperacion` se repite entre filas; no debe ser único por sí solo ni convertirse en número, pues puede tener ceros iniciales.
- Hay enriquecimientos existentes y referencias con separadores que pueden agrupar varias operaciones. Una FK única a factoring no cubre todos los casos; esas referencias requieren revisión, no asociación automática por texto.
- La muestra no tiene detalle de fecha/hora, aunque esos campos existen. Deben poder ser nulos.
- Los SQL incluyen clasificaciones de mantenimiento, ITF, detracciones, adelantos, depósitos y pagos. También incluyen cálculos de neto con comisiones. Son evidencia del flujo actual, no reglas financieras aprobadas para automatizar.
- `fechamod` tiene valor predeterminado, pero el DDL no declara actualización automática. Los UPDATE proporcionados no actualizan esa columna. No se puede asumir que permita detectar todas las modificaciones remotas.
- El proyecto ya tiene `banco_transaccion`, ligada a `banco_cuenta`, saldos y vínculos de inversionistas. Por su estructura tiene una semántica diferente de un movimiento observado en una cuenta bancaria real del factor. No propongo reutilizarla sin un rediseño funcional independiente.
- `factoring_pago` ya vincula factoring con la cuenta del factor y conserva operación, fecha e importe. No existe en el esquema revisado un vínculo directo entre ese pago y la nueva evidencia bancaria. Las referencias encontradas en `src` son lecturas de relaciones desde factoring; no se acreditó un CRUD específico de pagos por esa búsqueda.

No se conectó a ninguna base, no se verificaron cuentas ni permisos reales, y no se inspeccionó el servidor Ubuntu. El esquema Prisma local es evidencia del repositorio, no confirmación del estado actual de desarrollo o producción. No se ejecutaron pruebas, compilación ni empaquetado porque este trabajo es documental.

## Modelo propuesto

### Núcleo para la primera versión

| Tabla propuesta | Responsabilidad |
| --- | --- |
| `factor_transaccion_bancaria` | Movimiento local con identidad, datos bancarios originales, valores operativos vigentes, procedencia y auditoría. |
| `factor_transaccion_bancaria_origen_cuenta` | Mapeo explícito de fuente y cuenta remota a `factor_cuenta_bancaria`; conservar el valor remoto como dato de procedencia. |
| `factor_transaccion_bancaria_sincronizacion` | Cada ejecución: fuente, período leído, inicio/fin, resultado y contadores; no guardar secretos ni filas completas en logs. |
| `factor_transaccion_bancaria_incidencia` | Cuenta desconocida, moneda/signo inválido, conflicto de identidad o diferencia remota pendiente de resolución. |
| `factor_transaccion_bancaria_historial` | Cambios, anulaciones y resoluciones: actor, instante, motivo y valores afectados. Es información sensible con acceso restringido. |

Son responsabilidades propuestas; el diseño físico definitivo puede simplificarlas si conserva esas garantías. No hace falta un motor de integración genérico para comenzar con una sola fuente.

La tabla principal seguiría el estándar local: PK interna `INT UNSIGNED` autoincremental, UUID público único, `code` si lo exige el contrato del módulo, FK restrictiva a `_idfactorcuentabancaria`, auditoría y estado. El ID interno no debe exponerse como sustituto del UUID de API.

Grupos de columnas:

- **Datos bancarios:** número de operación como texto, fecha bancaria `DATE`, descripción, signo normalizado y monto firmado `DECIMAL(20,2)`. Relación con moneda y comprobación de coherencia con la cuenta. Mantener la moneda recibida como procedencia. Una cuenta no se resuelve por sus últimos cuatro dígitos.
- **Procedencia:** fuente, cuenta/operación/signo recibidos, copia original de los siete campos, clave canónica de importación, primera importación, última observación y última ejecución. La clave de importación se conserva aunque posteriormente se corrija la representación operativa.
- **Enriquecimiento local:** tipo, detalle de fecha/hora opcionales, origen/destino, comisiones, neto y referencias existentes. Empezar conservando su semántica; no convertir un campo vacío en cero ni deducir una fórmula universal de neto. Los tamaños finales se basarán en contratos y datos completos, no solamente en máximos de esta muestra.
- **Control operativo:** procedencia manual/importada, estado de conciliación independiente del estado activo/anulado, versión para concurrencia y motivo de corrección/anulación cuando corresponda.

Usar charset/collation compatibles con el proyecto y Unicode; verificar cómo se decodifica la conexión latin1 del origen. Conservar operación/cuenta como texto y precisión decimal en toda la importación. Fecha bancaria sin transformación de zona horaria; hora local de detalle separada de los instantes de auditoría UTC. Su visualización debe respetar Lima.

Índices iniciales: identidad de importación única, cuenta+fecha, estado de conciliación+fecha y FKs. No indexar todos los textos de referencia por anticipado. Evitar cascadas que borren evidencia financiera.

### Identidad y duplicados

Aplicaría la regla aceptada: cuenta local mapeada + fecha bancaria + operación normalizada + signo normalizado + monto decimal exacto. La moneda debe validarse contra la cuenta; si se almacena en la clave, eso no debe permitir aceptar una moneda incorrecta para esa cuenta. Excluir la descripción de la identidad evita insertar otro registro por una corrección meramente descriptiva.

Normalizar de forma explícita y versionada: quitar CR/LF y espacios externos cuando corresponda, preservar ceros iniciales, no borrar arbitrariamente caracteres internos y mapear `Suma`/`+` y `Resta`/`-`. Si se usa SHA-256 para un índice compacto, serializar una tupla inequívoca, guardar sus componentes y compararlos ante una coincidencia. La huella no es una prueba de que el banco haya emitido una transacción única.

Comportamientos necesarios:

1. Misma identidad y mismos datos originales: observación repetida, sin nueva transacción.
2. Misma identidad y distinta descripción u otros datos: incidencia; conservar el original y el enriquecimiento local. No sobrescribir silenciosamente.
3. Cambios en fecha, operación, signo o importe: la identidad cambia y no se puede inferir con certeza si es una corrección o un movimiento nuevo. Registrar una posible relación para revisión; no fusionar por similitud ni por importe solamente.
4. Dos filas distintas del origen con la misma identidad de negocio: no elegir una arbitrariamente; generar conflicto.
5. Movimiento manual que después aparece en origen: vincular la procedencia a ese mismo registro tras comprobar compatibilidad, preservando ID e información local.
6. Movimiento anulado: conservar su identidad y su registro para impedir que la siguiente sincronización lo recree.

El índice único hace efectiva la regla aceptada incluso con concurrencia. Su límite es conocido: dos movimientos bancarios reales idénticos no caben como movimientos ordinarios separados. Para admitir una excepción se necesitaría un discriminador autorizado y evidencia adicional; no inventar un correlativo automático que convierta cada relectura en otro movimiento. Resolverlo como incidencia manual o revisitar la regla antes de ampliar el alcance.

## Propiedad de campos y carga histórica

| Información | Responsable después del corte |
| --- | --- |
| Siete campos bancarios recibidos | Fuente remota como evidencia; las diferencias se revisan. |
| Tipo, detalle, neto, comisiones y referencias | Aplicación local. |
| Asociaciones a pagos, operaciones y comprobantes | Aplicación local mediante relaciones explícitas. |
| Historial, incidencias y conciliación | Aplicación local. |

La primera carga debe traer también los enriquecimientos históricos existentes, con origen marcado como legado y controles de conteos e importes por cuenta/moneda/período. Importar únicamente los siete campos desde el primer día perdería trabajo ya realizado.

Después del corte, las sincronizaciones recurrentes solo leen los campos bancarios y metadatos necesarios; nunca actualizan referencias, comisiones, netos o clasificaciones locales. Evitar dos equipos editando los enriquecimientos en ambos servidores. Cualquier corrección bancaria local conserva el dato recibido y su motivo, sin escribir de regreso al origen.

## Sincronización operativa

Para un volumen bajo confirmado, empezar con lectura completa del conjunto de cuentas autorizadas y su período histórico acordado, comparación local y transacciones cortas de escritura. No depender solo de `fecha > ultima_fecha`: perdería movimientos cargados tarde y correcciones históricas. Si el volumen exige una ventana móvil, complementar con revisiones completas periódicas; esa alternativa tiene una latencia explícita para detectar cambios antiguos.

El proceso debe:

1. Obtener un bloqueo por fuente que coordine ejecución programada y manual. Tener timeouts de conexión, lectura y duración total.
2. Leer únicamente las cuentas autorizadas desde un usuario remoto con SELECT. Para una extracción paginada, usar orden determinista y una lectura consistente; evitar OFFSET sobre un conjunto que cambia sin snapshot.
3. Resolver mapeo, normalizar y validar; aislar filas inválidas sin inventar moneda, signo ni cuenta.
4. Insertar de forma idempotente y registrar diferencias. Procesar lotes cortos; no mantener abierta una transacción local mientras se espera la red remota.
5. Registrar éxitos parciales, errores y conteos. Repetir una ejecución interrumpida debe converger sin duplicados. No marcarla exitosa si quedan fallos de procesamiento ocultos.
6. Actualizar última observación solamente de filas efectivamente leídas. La ausencia en una lectura fallida, filtrada o parcial no significa eliminación.
7. No borrar ni anular automáticamente porque una fila desaparezca del origen. Señalar ausencias solo tras una comparación completa y consistente, para revisión humana.

El cron de Ubuntu es suficiente si se acompaña de bloqueo, timeouts, logs sanitizados, reintentos limitados y un indicador visible de última sincronización exitosa. Como alternativa operativa propongo un servicio `oneshot` con `systemd.timer`: una unidad ya activa no genera otra instancia por el mismo timer y `Persistent` con calendario permite recuperar una activación omitida. El bloqueo en la aplicación sigue siendo necesario para coordinar el botón manual y otros ejecutores. Fuente: [documentación oficial de systemd.timer](https://github.com/systemd/systemd/blob/main/man/systemd.timer.xml).

La periodicidad se decide según la frecuencia real de carga en el otro servidor. Sincronizar más seguido no hace que ese servidor obtenga antes la información bancaria. No se configuró ninguna tarea ni alerta en este análisis.

## Seguridad de conexión

Para una sola fuente administrada por infraestructura, prefiero **credencial fuera de la base de negocio**, inyectada al proceso desde un secreto o archivo protegido del servidor. En la base puede quedar configuración no secreta y una referencia al secreto. Es más simple que construir inicialmente un CRUD de credenciales. Evitar secretos en Git, argumentos del proceso y respuestas HTTP.

Si es un requisito que administradores gestionen varias conexiones desde la aplicación, sí cabe una tabla de configuración con contraseña cifrada. Usar cifrado autenticado AES-256-GCM, nonce único por cifrado, etiqueta de autenticación y versión de clave; clave maestra aleatoria externa a la base y separada de la de correo. Administrar rotación y recuperación del secreto. La API permite reemplazar la contraseña, pero no recuperarla para mostrarla.

La referencia de correo sirve como precedente funcional, pero `src/utils/cryptoUtils.ts` usa AES-256-CBC con IV y sin MAC explícito. No copiaría ese formato para la nueva integración. Esto no prueba explotación ni autoriza cambiar correo en esta tarea. OWASP recomienda modos autenticados y separar claves de los datos: [Cryptographic Storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html).

Conexión remota con usuario exclusivo SELECT sobre la tabla o vista permitida, acceso de red restringido y TLS con certificado verificado; si no existe conectividad privada, evaluar VPN o túnel administrado. Si el host es configurable desde una pantalla, restringir destinos y puertos autorizados. La cuenta local del proceso requiere permisos limitados de DML del módulo, sin DDL. Proteger también respaldos, historiales y registros. Estas medidas siguen el principio de mínimo privilegio de [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).

Ninguna modalidad protege los secretos frente a un compromiso completo del proceso autorizado para descifrarlos; el beneficio es reducir exposición en copias de la base, interfaces y accesos no autorizados. La elección depende de quién debe administrar la conexión, no de imitar la tabla de correo.

## CRUD manual y conciliación

La pantalla debe ofrecer lista, filtros, alta manual, enriquecimiento, corrección justificada, anulación, incidencias, última sincronización y reintento. Separar permisos de consulta, edición, conciliación, reintento y administración de conexiones. Aplicar el mismo servicio y reglas desde HTTP y desde la CLI, siguiendo rutas → controladores → servicios → DAOs; el cliente remoto queda en integración/infraestructura y el cron en `scripts/`.

Un fallo de red habilita registrar un movimiento manual; al restablecerse la conexión, la deduplicación debe resolverlo contra ese registro. El CRUD no debe proporcionar eliminación física de evidencia ni edición silenciosa del original importado. Un conflicto de versión evita que una edición concurrente pierda trabajo. Corregir movimientos conciliados requiere revisar/deshacer sus aplicaciones de forma auditada antes de cambiar importes o moneda.

Para relacionar pagos, propongo posteriormente `factor_transaccion_bancaria_factoring_pago`, con FKs al movimiento y a `factoring_pago`, importe aplicado, auditoría y estado. Permite repartir un abono entre pagos de varias operaciones y cubrir un pago con varios abonos. El pago existente sigue representando el hecho de negocio; el movimiento representa evidencia bancaria. Importar no debe crear pagos, liquidar operaciones ni alterar saldos automáticamente.

Antes de activar conciliación definir: misma cuenta del factor, misma moneda, abonos elegibles, importes positivos aplicados, suma aplicada no superior al disponible bancario ni al pago, tratamiento de comisiones y anulaciones. Aplicar esas comprobaciones con bloqueo de filas y transacción; una validación previa sin bloqueo no basta con concurrencia. El importe bancario bruto y el neto no son intercambiables por defecto. No aprobar fórmulas a partir de SQL de ejemplo.

No llenar `factoring_pago` con movimientos de mantenimiento, ITF, transferencias internas o gastos. Otras relaciones futuras, como transferencias a cedentes y comprobantes, deben usar FKs específicas y sus propias reglas. Conservar las referencias de texto como legado, pero no sustituir integridad referencial con listas de códigos ni con una relación polimórfica sin FK.

## Secuencia sugerida y criterios de cierre

Esta secuencia es una propuesta, no un plan de implementación iniciado.

| Etapa | Entregable | Criterio para avanzar |
| --- | --- | --- |
| Diseño | Diccionario, DDL y manifiesto revisables, sin aplicar | Acordar identidad, mapeo, signo, históricos, correcciones y modalidad de secretos; verificar metadatos actuales del destino. |
| Base y carga inicial | Tablas autorizadas y carga histórica separadamente autorizada | DDL verificado, después `prisma-sync` contra el mismo destino; conteos/importes conciliados y enriquecimientos preservados. |
| Uso manual | API y pantalla con auditoría | Alta, corrección, anulación y control de duplicados funcionales con permisos. |
| Importación recurrente | CLI, programador y manejo de incidencias | Reejecución, concurrencia, caídas, carga tardía, modificaciones y recuperación manual probadas sin pérdida de datos. |
| Conciliación | Relación con pagos y validación de importes | Repartos parciales, múltiples pagos/abonos, moneda, comisiones y anulaciones acordados y probados. |

La aplicación de estructura requiere autorización expresa para tablas/campos/relaciones concretos, mediante el flujo existente de `scripts/database/README.md`; primero revisión del manifiesto, luego aplicación con huellas y referencia de autorización, verificación y `prisma-sync`. La carga histórica es escritura de datos y necesita su alcance autorizado; no queda cubierta automáticamente por autorizar DDL.

Antes de implementar, confirmar el volumen real y mapeo de cuentas, acceso y TLS remotos, versión/collation del destino, período histórico y estrategia de respaldo/recuperación. No son bloqueos para este dictamen, pero sí entradas del diseño ejecutable.

Recomiendo avanzar con la importación unidireccional y la regla de identidad aceptada, incorporando desde el inicio auditoría, propiedad de campos y manejo de conflictos. Dejar conciliación automática, colas distribuidas, CDC y gestores de secretos adicionales para cuando exista una necesidad medida.
