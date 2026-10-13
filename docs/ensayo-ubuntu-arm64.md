# Ensayo reutilizable en Ubuntu ARM64

## Propósito y alcance

Reproducir el flujo de entrega: compilar en Windows, transferir archivos a
Linux, instalar dependencias allí y reiniciar con el ecosystem de PM2. El ZIP
de `build-prod` sigue siendo el archivo histórico de cada pase, incluidos sus
perfiles privados según el procedimiento del usuario. Este laboratorio no
modifica ese empaquetador ni extrae sus ZIPs: prepara una entrega seleccionada.

Se usan Ubuntu 22.04 ARM64 emulado, Node 24.21.0, npm 11.19.0, PM2 6.0.8,
Nginx de Ubuntu 22.04 y MariaDB 11.4.10 ARM64. Se preservan las rutas internas:

```text
/opt/finanzatech/ft-app-backend
/opt/finanzatech/ft-app-frontend-mantis
```

Docker Desktop debe estar iniciado con contenedores Linux. El controlador usa
explícitamente el contexto local `desktop-linux`. Los servicios pertenecen al
proyecto Docker `ft-ubuntu-arm64-lab`; no utiliza el compose antiguo de la raíz.

## Primer inicio desde PowerShell en la raíz del backend

```powershell
$env:Path = 'D:\Herramientas\node-v24.21.0-win-x64;' + $env:Path
node --version
node -p 'process.execPath'
npm.cmd run lab:ubuntu -- prepare
npm.cmd run lab:ubuntu -- up
```

`prepare` comprueba tipos del backend y compila con tsdown en salida aislada.
Compila el frontend con Rsbuild `--no-env`, usando exclusivamente la fixture
pública y URLs locales. No ejecuta `build-prod`, no altera el `dist` o `build`
habitual y no lee `.env`, `.env.development` ni `.env.production` reales.

La configuración sintética se guarda en
`coverage/ubuntu-arm64-lab/release/backend/.env.ensayo`; el primer inicio la
copia al archivo `.env` **dentro del contenedor**. El ecosystem real selecciona
ese archivo y `NODE_ENV=production`. La base `ft_rehearsal` usa una estructura
versionada sin datos de clientes. No se exporta, restaura ni consulta una base
compartida. No se crean usuarios de negocio automáticamente.

`up` construye la imagen, inicia la base/servidor, instala dependencias ARM64,
valida configuración/destino, inicia PM2, comprueba HTTP/estabilidad y guarda
su estado. Reutiliza los archivos ya existentes en el volumen; para aplicar
una nueva entrega preparada se usa `deploy`.

Se reinstalan dependencias cuando cambian los manifiestos, la versión de Node,
la arquitectura o falta una instalación completa. El resultado exitoso se
registra mediante hash en el volumen; un inicio posterior conserva esa
instalación. La caché de npm también se conserva en un volumen exclusivo del
ensayo para reducir descargas. Un fallo de instalación no se marca como exitoso.

La instalación usa `npm ci --omit=dev --ignore-scripts`: no ejecuta scripts
de terceros ni generación/migración Prisma. Es una diferencia deliberada
del ensayo, que debe revisarse si una dependencia futura requiere scripts
de instalación. Las dependencias se instalan en Linux, nunca se copia
`node_modules` de Windows.

## Acceso y SFTP

- Frontend: **http://localhost:18080/**.
- API a través de Nginx: **http://localhost:18080/backend/ping**.
- SFTP: servidor **127.0.0.1**, puerto **2222**, usuario **ssh_finanzatech**.
- Contraseña: campo `sftp` de
  `coverage/ubuntu-arm64-lab/credentials.json`. Es exclusiva del laboratorio.
  No subir ese archivo al repositorio ni compartir su contenido.
- En SFTP las rutas visibles son `/ft-app-backend` y
  `/ft-app-frontend-mantis`, por el chroot. Corresponden a las rutas completas
  indicadas arriba. No se permite escribir en la raíz del chroot.

Los puertos se publican exclusivamente en localhost. La aplicación y la base
usan una red interna sin salida a Internet; la base no publica puerto al host.
Telegram está desactivado y los proveedores apuntan a un puerto local cerrado.
Una pasarela TCP publica HTTP/SFTP en localhost sin ejecutar la aplicación.
Un contenedor separado de instalación puede descargar dependencias, pero no
está conectado a la red de la base ni ejecuta el backend.

La guarda previa al reinicio rechaza `.env` que no corresponda al destino
interno, puerto, perfil y proveedores del ensayo. **No subir nunca el `.env`
real de producción al laboratorio.** Se puede editar el perfil sintético para
ensayar cambios de variables, conservando esos límites.

## Repetir un pase

### Entrega administrada

```powershell
npm.cmd run lab:ubuntu -- prepare
npm.cmd run lab:ubuntu -- deploy
```

`deploy` detiene solo el backend del laboratorio, copia la entrega, instala
dependencias y reinicia. Conserva `.env`, `storage`, `logs` y `security` del
volumen; no modifica la base. No incorpora cambios nuevos de `.env.ensayo`
automáticamente: subir los cambios elegidos al `.env` del laboratorio por SFTP.

### Entrega manual por SFTP

Subir los archivos seleccionados desde `coverage/ubuntu-arm64-lab/release/`,
igual que en el procedimiento habitual. Cuando cambie la compilación del
backend, transferir **todo `dist`**, porque tsdown comparte archivos entre
entradas. Para el frontend, transferir todo el compilado correspondiente.
No sincronizar con eliminación sobre `storage`, `logs`, `security` o `.env`.

```powershell
npm.cmd run lab:ubuntu -- restart
npm.cmd run lab:ubuntu -- check
npm.cmd run lab:ubuntu -- logs
```

Si por SFTP se cambian `package.json`/`package-lock.json`, también debe ejecutarse
la instalación de dependencias. La entrega administrada lo hace automáticamente;
la instalación manual equivalente, limitada al laboratorio, es:

```powershell
docker --context desktop-linux compose --project-name ft-ubuntu-arm64-lab --env-file coverage/ubuntu-arm64-lab/compose.env --file scripts/rehearsal/compose.yml run --rm --no-deps installer
npm.cmd run lab:ubuntu -- restart
```

Las variables heredadas conservan precedencia sobre el archivo, igual que en
el servidor real. `--update-env` no limpia por sí solo todas las variables
persistidas; revisar `conflictingKeys` y el archivo/entorno validado en los logs.

La prueba de protocolo SFTP sube, descarga, compara y elimina un archivo
sintético en `temporal`; también exige que se rechace escribir fuera de las
dos carpetas. Usa una clave efímera, conserva las claves autorizadas existentes
y elimina su material temporal. No imprime la contraseña.

```powershell
npm.cmd run lab:ubuntu -- sftp-check
npm.cmd run lab:ubuntu -- env-check
npm.cmd run lab:ubuntu -- startup-check
```

`startup-check` usa un directorio temporal y el perfil sintético del ensayo:
exige el mensaje de fallback cuando falta `NODE_ENV`, arranque de desarrollo,
HTTP 200/pong, cierre mediante SIGTERM POSIX y rechazo de un puerto inválido
sin `ready` ni exposición de su valor. No abre perfiles privados ni modifica
la configuración del proceso principal.

`env-check` sí reinicia la API del laboratorio: sube por SFTP un cambio de
`APP_STAGE` a `qa`, reinicia con el ecosystem real, comprueba el archivo/instancia
en los logs del PID nuevo y verifica que un archivo sintético de `storage`
se conserva. Finalmente restaura por SFTP el `.env` sintético anterior y
reinicia de nuevo. No ejecutarlo mientras otra persona modifica ese perfil;
produce dos reinicios manuales y elimina su archivo de prueba.

## Detener y conservar

```powershell
npm.cmd run lab:ubuntu -- stop
npm.cmd run lab:ubuntu -- up
```

`stop` elimina los contenedores/redes de este proyecto, pero conserva los
volúmenes de aplicación, base y PM2. `up` conserva los archivos subidos por SFTP.
No se implementa una limpieza global ni se usa `docker prune`. No borrar los
volúmenes ni `credentials.json` si se desean conservar estos datos de ensayo.
Si hay conflicto de puertos, resolverlo antes del inicio; no se detienen
servicios ajenos automáticamente.

## Evidencia y límites

El informe `coverage/ubuntu-arm64-lab/last-check.json` registra fecha, Node,
arquitectura real del proceso, Ubuntu, respuesta 200/pong de la transacción
Prisma, entrega del HTML por Nginx y tres muestras de PID/reinicios. Los logs
del backend quedan en el mismo directorio; la compilación del frontend queda
en su repositorio bajo `docs/registros/compilaciones/build-ensayo-arm64.log`.
Un informe anterior no acredita una ejecución nueva: comprobar su fecha.

La configuración de Nginx del laboratorio adapta el encabezado Origin hacia
el origen que admite el backend en producción, permitiendo ensayar el frontend
en localhost **sin cambiar las reglas CORS del código**. Por tanto no certifica
CORS real entre dominios, HTTPS, certificados, cookies entre dominios ni DNS.
El acceso SFTP interno y el puerto local tampoco certifican la configuración
SSH del servidor real. El kernel es el de WSL/Docker, no Oracle; no se ejecuta
systemd ni se prueba el inicio automático del host. La emulación no sirve como
medición representativa de rendimiento ARM64 nativo.

La estructura vacía permite arranque y `/ping`, pero no navegación autenticada
de negocio. Para probarla se deben preparar fixtures sintéticas coherentes
con permisos y relaciones; nunca restaurar datos reales como preparación
automática. Las integraciones externas quedan pendientes de un entorno
específico autorizado.

El DDL de la fixture se aplica solo al crear el volumen de MariaDB por primera
vez. Preparar otra entrega no migra ni reconstruye una base existente; un
cambio futuro de esquema requiere un procedimiento explícito para la base de ensayo.

### Evidencia inicial: 13 de octubre de 2026

- Compilados aislados de Windows servidos en Ubuntu 22.04 ARM64 emulado;
  Node 24.21.0, npm 11.19.0, PM2 6.0.8, Nginx 1.18.0 y MariaDB 11.4.10
  comprobados en los contenedores. La imagen de MariaDB usa su propio sistema
  base Ubuntu 24.04; el servidor de aplicación sí usa Ubuntu 22.04.
- HTTP 200/pong a través de Nginx, PID estable y cero reinicios espontáneos
  durante las muestras iniciales. Pantalla de inicio de sesión visible en
  el navegador local; esto no acredita autenticación ni operaciones de negocio.
- SFTP real: subida/descarga iguales y escritura fuera de las carpetas permitidas
  rechazada. Cambio de APP_STAGE a qa por SFTP cargado tras reiniciar PM2,
  storage conservado y perfil sintético original restaurado.
- Fallback de desarrollo, mensaje por NODE_ENV ausente, HTTP y SIGTERM POSIX
  aprobados; configuración inválida rechazada antes de ready sin divulgar
  su valor. Pruebas focalizadas de diagnóstico/guardas y tipos aprobados.
- Storage y marcador SQL del ensayo sobrevivieron a la recreación de
  contenedores. Un intento de reinstalación falló por ECONNRESET; el siguiente
  completó correctamente. Se añadió caché persistente y reutilización por hash.

Evidencia local ignorada por Git bajo `coverage/ubuntu-arm64-lab/`:
`last-check.json`, `unit.log`, `sftp-check.log`, `env-check.log`,
`startup-check.log`, `lifecycle-retry.log` y `reuse-up.log`. ESLint de los
scripts del ensayo y formato/diff se comprueban por separado. El laboratorio
queda iniciado para futuras pruebas; producción permanece sin cambios.

Referencias: [Docker Desktop sobre WSL 2](https://docs.docker.com/desktop/features/wsl/)
y [emulación multiplataforma](https://docs.docker.com/build/building/multi-platform/).
