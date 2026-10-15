# Actualización de accesos tras aprobar suscripciones o verificar cuentas

Factoring empresarial e inversión en factoring actualizan la sesión existente cuando la pantalla confirma una suscripción aprobada y el token, el perfil o el menú todavía no permiten utilizar el servicio. La aprobación sigue ocurriendo exclusivamente en el flujo administrativo existente.

## API

- `GET /api/v1/usuario/usuarioservicio/estado/:id`: requiere autenticación. Busca una suscripción activa del propio usuario y devuelve `{ usuarioservicioid, estado: { code, alias, color }, suscrito, acceso }` dentro de `{ error: false, data }`. No carga catálogos del formulario. Una suscripción ajena, inexistente o inactiva devuelve 404.
- `POST /api/v1/secure/actualizar-accesos`: requiere un JWT vigente; usa su identidad, sin aceptar roles ni usuarios del cuerpo. Devuelve `{ token, usuarioid, usuario, menu }` dentro de `{ error: false, data }`. Cuenta inactiva o sesión vencida devuelve 401; exceder 10 peticiones por minuto por usuario devuelve 429 con `Retry-After`. El límite en memoria se aplica por proceso, como los límites existentes.

El nuevo JWT conserva `exp` e `iat` del original, incluye únicamente roles y asignaciones activos y excluye los datos privados del perfil. Esta operación no extiende sesiones, no modifica suscripciones ni dispara notificaciones de login. Ambas respuestas llevan `Cache-Control: no-store`.

El estado de usuario-servicio 2 significa suscrito. Servicio 1 requiere rol 3 y conduce a `/empresario/factoring/nuevo`; servicio 2 requiere rol 4 y conduce a `/inversionista/factoring/oportunidades`. Otros servicios devuelven `acceso: null` hasta integrarlos explícitamente.

## React y experiencia

La consulta ocurre al entrar, volver a la pestaña, recuperar conexión o pulsar `Consultar estado`. No hay consultas periódicas. Las consultas simultáneas se comparten y las automáticas están separadas por al menos cinco segundos. Los catálogos se cargan solamente cuando se necesita el formulario; se conserva el flujo de agregar múltiples empresas.

La actualización usa una única petición por pestaña, compartida por el panel de suscripción y la acción `Actualizar mis accesos` del menú de perfil. Cada suscripción y token tiene un único intento automático por sesión de la aplicación. Un fallo requiere reintento manual. Las peticiones tienen un timeout de 15 segundos.

Los accesos se consideran disponibles únicamente si coinciden el rol activo del JWT, el perfil y la ruta del menú. Entonces desaparece el botón de actualización del panel y aparece `Ceder factura` o `Ver oportunidades`. Si faltan los permisos incluso después de sincronizar, se muestra el error y el botón de reintento, sin asignar permisos en el cliente ni generar bucles.

El contexto aplica token, perfil y menú conjuntamente. Los eventos de almacenamiento transmiten el resultado a otras pestañas sin conservar otra copia persistente del perfil. Un logout o cambio de cuenta invalida las respuestas anteriores. El menú deriva sus opciones de los datos actuales y actualiza también las vistas basadas en el perfil, como Inicio.

## Verificación personal

Desde 2026-10-15 la verificación personal también reutiliza la sincronización de sesión existente:

- `GET /api/v1/usuario/persona/estado`: autenticación y rol 5 vigente mediante el middleware existente. La identidad se deriva del JWT, sin parámetros de usuario. Devuelve `{ usuarioid, ispersonavalidated, estado }`, donde `estado` puede ser `null` o contener `code`, `alias`, `color`, `isusuarioedit`, `ispersonavalidated`. Solo consulta campos seleccionados de una cuenta activa y su relación de persona; no devuelve catálogos ni datos de contacto. Cuenta inactiva/inexistente: 401. Respuesta no cacheable.
- La pantalla consulta al entrar, recuperar foco/visibilidad o conexión y mediante «Consultar estado». Las consultas automáticas se separan por cinco segundos y las simultáneas se comparten. No hay consultas periódicas.
- La aprobación exige coherencia entre el indicador de usuario y el estado de persona. Si discrepan, se informa y se ofrece reconsultar; no se repara la base ni se infiere un permiso.
- Para mostrar «Ir a servicios» deben coincidir identidad e indicador de verificación en token y perfil, y estar presentes las rutas Inicio y Servicios en el menú. No se conceden roles de Factoring por verificar una cuenta.
- Los intentos de actualización automática tienen un ámbito independiente del de las suscripciones; mantienen el refresco compartido, el vencimiento original, el límite y la invalidación de respuestas antiguas. Un fallo permite reintento manual.
- La pantalla vuelve a consultar su estado si otra pestaña o la acción del perfil ya sincronizó los accesos. El formulario solo se monta cuando el estado permite editar; volver al foco no borra sus pasos ni borradores. Tras enviar se espera cualquier consulta anterior y se realiza una nueva, sin reenviar la solicitud.

## Validación

Backend, PowerShell desde su raíz:

```powershell
$env:Path = 'D:\Herramientas\node-v24.21.0-win-x64;' + $env:Path
node --version
node -p "process.execPath"
$env:CI = 'true'
npm.cmd run typecheck
npm.cmd run test:vitest:typecheck
npm.cmd run test:vitest -- tests/vitest/migrated/unit/services/secure/accesos.Service.test.ts
```

Frontend, desde su raíz y con `.env.test` disponible, sin eludir su carga:

```powershell
& .\scripts\npm-node24.ps1 --silent run test:ci -- src/pages/usuario/persona/PersonaVerificacion.test.tsx src/utils/accessSession.test.ts src/contexts/JWTContext.accesses.test.tsx src/utils/axiosFinanzatech.test.ts
& .\scripts\npm-node24.ps1 --silent run test:ci -- src/test-utils/remaining-unused-vars.test.tsx -t 'Asistente persona'
```

La primera selección cubre el panel, la coordinación de sesión y la regresión de suscripciones y transporte. La segunda conserva las comprobaciones existentes del envío y payload del asistente personal, con sus pasos aislados. Todas usan transporte/persistencia simulados; no acreditan una aprobación real. Revisar resumen, omisiones por filtro en el segundo comando y código de salida 0.

El escenario real pendiente requiere usuario en revisión y aprobación desde otra sesión administrativa mediante la aplicación. Comprobar consulta manual y recuperación de foco, menú, navegación a Servicios, segunda pestaña, errores/reintentos y preservación del vencimiento. No requiere mantenimiento directo de la base de datos.

Este cambio conserva la política existente de vigencia y comprobación de permisos y no modifica la duración configurada de las sesiones. No se necesita empaquetar producción para estas comprobaciones.
