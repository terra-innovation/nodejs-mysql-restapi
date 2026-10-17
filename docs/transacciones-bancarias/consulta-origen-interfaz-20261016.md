# Consulta de origen y consistencia de interfaz

## Alcance

Financiero dispone de Datos del origen remoto. Consulta la tabla bancaria configurada para una conexión activa y habilitada, incluidas cuentas sin mapear. Es una consulta de lectura independiente de la sincronización; no importa, modifica ni normaliza los importes originales que muestra. El administrador mantiene exclusivamente la configuración técnica de conexiones.

GET `/api/v1/financiero/transaccionbancaria/origen` exige rol financiero vigente, UUID de conexión y ambas fechas bancarias válidas en orden. La tabla empieza vacía y el cliente no consulta datos hasta Buscar. Cambiar conexión o fechas invalida el alcance anterior. Búsqueda, orden permitido, conteo y paginación se ejecutan en origen; límites de 1 a 100 filas por página. La clave compuesta del contrato remoto desempata el orden. No admite SQL, tablas ni columnas libres desde el navegador. Las páginas reflejan el origen en cada consulta; cambios concurrentes entre páginas pueden alterar su posición.

El servicio obtiene las credenciales por DAO y delega al adaptador remoto. Reutiliza allowlist de destinos, cifrado y política TLS configurada. Solo devuelve columnas bancarias explícitas y metadatos de fecha; no entrega credenciales. Errores del driver se sustituyen por un mensaje controlado y se cierra siempre la conexión.

## Fechas

- Sincronización y visor ejecutan `SET SESSION time_zone = '+00:00'` antes de su transacción de lectura. La opción timezone del driver se mantiene en UTC; por sí sola no reemplaza esta instrucción de sesión.
- La fecha bancaria y detalle_fecha son DATE: se filtran por días inclusivos sin conversión de zona. detalle_hora es una hora civil, no un instante. Ninguna debe desplazarse cinco horas.
- TIMESTAMP se lee en UTC por la sesión y se transfiere con sufijo Z explícito.
- Aclaración posterior del usuario: la zona histórica de fechacrea y fechamod DATETIME es desconocida. Se retiró la conversión que se había añadido asumiendo Lima. DATETIME se transfiere literal, sin sufijo Z y con indicación de zona desconocida en el visor. Establecer UTC en la sesión no convierte DATETIME ni permite conocer cómo se grabaron registros anteriores. Una futura conversión exige evidencia de la zona histórica; no inferirla a partir de la zona actual del servidor o de la sesión.
- La interfaz muestra instantes UTC en America/Lima, tanto en listas como detalles. Cambiar el día al mostrar un instante cercano a medianoche es correcto; las fechas civiles conservan el día original.

## Interfaz

Las listas de movimientos, cuentas de origen, ejecuciones, incidencias, historial y Config BBDD reutilizan ReactTableServer o ReactTablePrincipal. Columnas secundarias ocultas inicialmente, búsqueda y paginación pertenecen al componente base. El orden de listas paginadas se realiza antes de paginar mediante listas permitidas de campos; columnas calculadas sin soporte no ofrecen ordenamiento.

Detalle, Editar, Eliminar y Activar usan los iconos y colores existentes. Eliminar movimientos conserva la baja lógica y el sustento/versionado; no representa borrado físico. Los detalles reutilizan la composición Grid/InputLabel/Typography del proyecto. El diagnóstico temporal de conexión conserva su tabla específica de pasos y tiempos.

Frontend incluye `.agents/skills/frontend-ui-consistency/SKILL.md`, referenciada desde AGENTS.md, con componentes, ejemplos reales y criterios para consultar Mantis/MUI si falta una solución local.

## Verificación y límites

Registros de comprobaciones de esta entrega: `docs/registros/pruebas/test-20261016-origen-*` de cada repositorio. Cubren tipos, pruebas focalizadas de consulta, permisos, rango obligatorio, paginación, cierre de conexión, precisión decimal, parametrización y fechas. Revisión de navegador contra la conexión guardada: inicio vacío, rango, páginas, detalle y columnas secundarias. No se ejecutó sincronización del siguiente período ni mantenimiento de datos o estructura.

La integración con MariaDB desechable requiere Docker iniciado: el doctor detectó Docker detenido. Las pruebas con mocks y la consulta real del navegador no sustituyen esa integración. No se empaquetó producción.

El validador Python de skill no pudo iniciar por ausencia de PyYAML en el runtime disponible; se revisó estructura, nombre, frontmatter y referencias sin instalar dependencias.

## Ajustes de filtros y navegación solicitados en las capturas

- Origen remoto: Desde se inicializa tres meses calendario antes del día actual de Lima y Hasta en ese día. Conserva el inicio vacío hasta Buscar. Se ajusta el día en fines de mes cuando el mes de destino es más corto.
- Transacciones locales: carga automáticamente los últimos 60 días civiles, incluyendo hoy (Desde = hoy menos 59 días). Selección múltiple de cuentas; ninguna seleccionada significa todas. Fechas y cuentas se aplican en backend antes del conteo, orden y paginación. La API conserva el filtro individual cuenta y añade cuentas como lista CSV de UUID, con límite y validación de duplicados. Cambiar filtro reinicia la página y un rango inválido suspende la consulta.
- Sincronizar manualmente: Hasta = hoy en Lima, Desde = hoy menos 31 días, según la indicación expresa de la captura. El usuario conserva la posibilidad de cambiar o vaciar el rango; no se ejecuta automáticamente.
- El menú bancario se presenta como collapse dentro de un grupo, siguiendo NavCollapse de Mantis y conservando rutas y permisos.
- Se reprodujo la desaparición de cuentas con una prueba del componente real: DebouncedInput inicializa límites numéricos vacíos después de 500 ms, y el filtro de texto interpretaba el array vacío como una coma. premiumTrimmedFilter distingue ahora rangos numéricos, incluyendo cero y límites inclusivos; el rango vacío no excluye registros. Filter omite límites HTML desconocidos en lugar de emitir NaN.
- ReactTableServer ignora una emisión de búsqueda idéntica al valor actual. Esto evita que el temporizador inicial de búsqueda vacía devuelva a la primera página después de haber navegado.

Evidencia actual en los registros test-20261016-pinceladas-* de ambos repositorios. El archivo de reproducción registra el fallo original; el de cierre incluye la misma prueba después de la corrección. La verificación visual utiliza consultas de lectura y cambios de filtros; no requiere nuevas sincronizaciones ni mantenimiento de la base.
