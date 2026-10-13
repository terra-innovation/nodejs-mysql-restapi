# Carga de configuración y diagnóstico de PM2 — 2026-10-13

## Problema reproducido

Después del pase en Ubuntu, PM2 conservó un entorno incompleto. El backend
seleccionaba `.env.development` cuando `NODE_ENV` no estaba definido. Al aplicar
producción, la validación falló porque `WEB_SITE_PORT` llegó como `// Tokens`.

Se reprodujo el segundo síntoma con un archivo completamente sintético en Node
24.21.0: una línea `WEB_SITE_PORT = ` vacía, seguida de una línea en blanco y
`// Tokens`, produce `WEB_SITE_PORT="// Tokens"` con `node --env-file`. Con
`dotenv@18.0.7`, esa misma variable permanece vacía y su conversión numérica es 0. No se modificó el esquema Zod para admitir valores inválidos.

Los comentarios de `.env.example` se normalizaron a `#`. Es una plantilla, no
un perfil ejecutable ni un archivo de respaldo que se cargue automáticamente.
Los archivos privados no se modificaron ni se inspeccionaron como texto.

## Selección y precedencia

La aplicación usa `dotenv` para leer el archivo indicado por `APP_ENV_FILE`.
El mensaje inicial `[config]` se emite antes de validar Zod, incluso cuando el
logger de negocio no puede inicializarse. La secuencia `[arranque]` registra el origen una
vez validada la configuración. Se muestran nombre del archivo, estado de
carga, cantidades y nombres de claves en conflicto; nunca valores.

| Inicio                                                       | Archivo seleccionado                                                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| PM2 con `ecosystem.config.cjs`, sin `--env`                  | `.env`, modo producción                                                                     |
| PM2 con `--env production`                                   | `.env`, modo producción                                                                     |
| PM2 con `--env development`                                  | `.env.development`, modo desarrollo                                                         |
| Aplicación sin `NODE_ENV` ni `APP_ENV_FILE`                  | `.env.development`, comportamiento anterior                                                 |
| Aplicación con `NODE_ENV=test`, sin selector explícito       | `.env.test`, comportamiento anterior                                                        |
| Aplicación con `NODE_ENV=production`, sin selector explícito | Variables del proceso; no abre `.env`, conservando el aislamiento del runner de integración |
| Cualquier modo con `APP_ENV_FILE` explícito                  | Ese archivo; si no puede leerse, el inicio falla                                            |

Las variables ya inyectadas en `process.env` conservan precedencia. No se
sobrescriben credenciales, puertos ni otros valores externos silenciosamente.
`conflictingKeys` permite identificar claves antiguas guardadas por PM2. Por
ello, `--update-env` no debe considerarse una limpieza completa del entorno
persistido. En el siguiente pase debe prepararse un registro limpio únicamente
del backend, con respaldo y ventana de mantenimiento; no reiniciar todas las
aplicaciones o módulos como diagnóstico.

El ecosystem fija `cwd` al directorio del proyecto. No se necesita anteponer
`node --env-file=.env` al comando PM2: la aplicación carga el perfil mediante
`dotenv` y mantiene un único criterio de interpretación.

## Comprobación sin conectar a una base

`src/scripts/check_config.ts` importa exclusivamente la configuración. No
importa app, Prisma, servicios ni proveedores. Al finalizar correctamente
imprime `database=not-connected`.

```powershell
# Fuente local; por defecto usa el criterio de desarrollo.
npm.cmd run config:check

# Después de compilar; valida .env con NODE_ENV=production, sin iniciar la API.
npm.cmd run config:check:prod
```

La versión compilada también se ejecuta directamente en Ubuntu:

```bash
node dist/scripts/check_config.js production
```

Los comandos de comprobación no imprimen valores de configuración. Si hay
errores, informan las claves que fallan. `WEB_SITE_PORT` determina el puerto
opcional de enlaces públicos, no el puerto de escucha `PORT`. El valor 0
omite ese puerto; la validación numérica y su uso en enlaces se conservan.

## Diferencias históricas del contrato de variables

El diff de `.env.example` entre `90a03d6^` y HEAD elimina las variables
`DB_FACTORING_HOST`, `DB_FACTORING_USER`, `DB_FACTORING_PASSWORD`,
`DB_FACTORING_DATABASE`, `DB_FACTORING_PORT` y las antiguas `DB_BIGDATA_*`.
Añade `PRISMA_DATABASE_FACTORING_NICKNAME`, el timeout y las banderas Prisma de
logs, junto con `LOG_LEVEL_CONSOLE` y `LOG_LEVEL_FILE`. La conexión vigente usa
`PRISMA_DATABASE_FACTORING_URL`. Los tokens de integraciones siguen siendo
parte del esquema; la revisión se hizo sobre código y plantilla públicos, sin
comparar contenidos del archivo privado `.env`.

## Evidencia y límites

Los artefactos locales están en `coverage/pm2-env-20261013/`, ignorados por Git.
Se usó Node 24.21.0 portable y PM2 6.0.8 en Windows 11, compilando en un
directorio separado de `dist` y sin ejecutar `build-prod`.

- Pruebas focalizadas: 9 casos; archivos temporales sintéticos, sin lectura de
  `.env` real. Incluyen vacío seguido de `// Tokens`, precedencia heredada,
  perfil explícito inexistente, ausencia de fallback a la plantilla y preflight
  con un puerto de base cerrado.
- Comprobación de tipos de fuentes y pruebas Vitest.
- PM2 desarrollo: `.env.development`, mismo PID y cero reinicios en tres
  muestras, `/ping` con 200 y `pong` sobre la base de desarrollo confirmada.
- PM2 producción con `.env`: validación de configuración y salida 0, sin
  iniciar la API ni conectar a MariaDB después de la aclaración del usuario.
- Modo producción con el perfil y base de desarrollo: comprobación separada
  de arranque y HTTP; no representa una certificación de la base de producción.

Las pruebas usan puertos temporales, Telegram desactivado y logs de archivos
desactivados mediante variables del proceso; los conflictos de esas claves
son intencionales. No cambian los archivos privados ni la lógica de negocio.

Antes de recibir la aclaración de que `.env` usa producción, una comprobación
inicial intentó arrancar ese perfil porque su destino aparecía como local. Esa
suposición fue insuficiente: localhost puede representar producción o un
túnel. La petición HTTP no obtuvo respuesta y no acredita un arranque exitoso.
Solo se intentaron comprobaciones de lectura de arranque; no se ejecutaron
migraciones, restauraciones ni escrituras SQL. Los procesos de esa comprobación
se eliminaron. Las comprobaciones posteriores impiden iniciar la API con el
perfil `.env` real.

En Windows, PM2 6.0.8 fija los pipes de IPC aunque cambie `PM2_HOME`. El
controlador temporal usa un gestor propio en su proceso y pipes distintos,
sin intervenir en el daemon del usuario. Los procesos temporales se eliminan
al finalizar. Una ejecución inicial dentro del aislamiento de Windows no
alcanzaba la base local; la evidencia real se obtuvo fuera de ese aislamiento.

Esta evidencia no certifica Ubuntu ARM64, Nginx, HTTPS externo ni despliegue.
Producción sigue en la versión anterior restaurada con Node 20 bloqueado en
APT. Antes del próximo pase, ejecutar el preflight sobre una copia preparada,
reproducir PM2 en Ubuntu ARM64 con una base de desarrollo y comprobar HTTP y
estabilidad antes de guardar el estado nuevo.

La ejecución final usó la selección de perfiles de PM2 sobre una copia del
ecosystem, cambiando únicamente la entrada temporal y los controles de la
validación. Desarrollo y modo producción sobre desarrollo respondieron
`200/pong` con el mismo PID y cero reinicios en sus tres muestras. El perfil
`.env` terminó con salida 0 tras validar configuración, sin iniciar la API.
El preflight compilado también validó `.env` con salida 0 y
`database=not-connected`. Los tipos, las nueve pruebas focalizadas, ESLint de
fuentes cambiadas, Prettier y `git diff --check` quedaron aprobados. Se confirmó
que los procesos temporales habían terminado y se eliminaron sus directorios
PM2. El `dist` habitual no fue regenerado: los cambios deben compilarse antes
de usar el ecosystem habitual con esta versión.

Artefactos concretos:

- [Resumen final de PM2](../coverage/pm2-env-20261013/final-pm2-summary.json).
- [Reproducción sintética del parser](../coverage/pm2-env-20261013/native-port-repro.json).
- [Preflight compilado](../coverage/pm2-env-20261013/compiled-preflight.log).
- [Pruebas focalizadas](../coverage/pm2-env-20261013/unit.log).

## Secuencia de arranque y valores predeterminados

El punto de entrada carga la configuración y las dependencias mediante imports
dinámicos, dentro del control de errores de arranque. Los mensajes `[arranque]`
se escriben directamente en la salida del proceso: se consultan con
`pm2 logs ft-api-backend --lines 100 --nostream`, incluyendo stdout y stderr.
No dependen del archivo rotativo de Pino. Cada secuencia incluye fecha UTC,
identificador de arranque, PID, versión de aplicación/Node, plataforma,
arquitectura, etapa y tiempos total/por etapa.

Etapas: `configuracion`, `dependencias`, `base_de_datos` y `servidor_http`.
El evento `listo` se emite solamente después de comprobar la base con `SELECT 1`
y confirmar que el servidor escucha. Las peticiones HTTP siguen siendo una
comprobación necesaria; un proceso online no demuestra estabilidad posterior.

Cuando falta `NODE_ENV` y tampoco se indica `APP_ENV_FILE`, se informa:

```text
[config] No se encontró NODE_ENV en el proceso. Por defecto se usa development para seleccionar .env.development; el archivo deberá definir un NODE_ENV válido.
```

Esto describe el valor predeterminado para **elegir el archivo**. No se inventa
un valor válido de `NODE_ENV` si falta también en ese archivo: la validación
continúa rechazándolo. Si hay un selector explícito, el mensaje explica que
`APP_ENV_FILE` decide el archivo. El entorno finalmente validado se registra
por separado. También se explican los valores predeterminados del esquema
para `PORT`, `WEB_SITE_PORT` y las URLs públicas de proveedores cuando las
variables están ausentes. Una cadena vacía no se describe como variable ausente.

`APP_STAGE` es opcional y admite `development`, `production`, `test`, `qa` y
`preproduction`. Solo etiqueta el diagnóstico; para QA/preproducción puede
usarse `NODE_ENV=production`, `APP_STAGE=qa` o `preproduction` y un
`APP_ENV_FILE` explícito. No modifica decisiones de negocio ni convierte
`.env.example` en un archivo ejecutable.

Los errores de arranque identifican la etapa y códigos conocidos: configuración
inválida, archivo no legible, dependencia ausente, autenticación/conectividad
de base, puerto ocupado, permisos o tiempo agotado. Un error desconocido se
reporta como tal. No se imprimen mensajes/stack originales, valores de
variables, URLs de conexión ni parámetros SQL en este diagnóstico. Las
notificaciones del motor Prisma anteriores a la primera conexión validada
también se resumen sin mensajes originales. Después de esa validación se
conserva la configuración habitual de logs de negocio; esta mejora no es una
revisión completa de la redacción de logs durante peticiones.

Hay un límite de 120 segundos para el arranque; al fallar o agotarse el plazo
el proceso sale con código 1 y no envía `ready`. Se mantienen cinco intentos y
la espera exponencial existentes de la base. El ecosystem usa `wait_ready`,
`listen_timeout=125000`, `min_uptime=130000` y `max_restarts=3`. La ventana de
estabilidad supera el límite de arranque para que PM2 pueda contabilizar los
fallos de inicio. No sustituye la revisión de HTTP y del contador de reinicios.
El cierre ante fallo de arranque termina el proceso; no implementa drenaje
de peticiones ni cambia el hook habitual de cierre una vez listo.

El preflight sigue importando solamente configuración y utilidades basadas
en Node; no importa app, Prisma ni proveedores. El archivo privado `.env`
no fue abierto por el asistente durante este cambio y no se conectó a producción.

### Evidencia de la secuencia nueva

Artefactos en `coverage/startup-20261013/` (ignorados por Git):

- Tipos de fuentes, Vitest e integración aprobados; compilación aislada con
  tsdown. No se regeneró `dist` ni se ejecutó `build-prod`.
- [Pruebas focalizadas](../coverage/startup-20261013/unit.log): archivos
  sintéticos, fallback de selección, conflictos sin valores, preflight sin
  base, captura de fallo temprano, secuencia y tiempos, clasificación segura,
  puerto ocupado real y reloj simulado para el límite de arranque.
- [PM2 desarrollo](../coverage/startup-20261013/pm2-summary.json): ecosystem
  con `--env development`, Node 24.21.0, evento `listo`, HTTP 200/pong,
  mismo PID y cero reinicios en tres muestras. Solo base de desarrollo confirmada.
- [Fallo compilado sintético](../coverage/startup-20261013/synthetic-database-failure.json):
  destino local cerrado y contraseña ficticia, salida 1 en la etapa de base,
  sin señal `ready`, evento `listo`, escucha HTTP ni contraseña en logs.
- ESLint sin errores, con la advertencia preexistente de `logLevel` sin uso
  en el gestor Prisma. Formato y `git diff --check` aprobados.

Docker no estaba disponible ni fuera del aislamiento de Windows: no se
ejecutó la regresión con MariaDB desechable, incluida la autenticación rechazada
contra un motor real. La prueba de conexión fallida anterior usa un puerto
cerrado y no sustituye ese caso. No se ha ensayado todavía Ubuntu ARM64.
Los gestores PM2 temporales emplearon pipes separados, se eliminaron sus
aplicaciones y se comprobó que los procesos habían terminado. No se modificó
el gestor habitual del usuario. No se ejecutó ningún pase en producción.
