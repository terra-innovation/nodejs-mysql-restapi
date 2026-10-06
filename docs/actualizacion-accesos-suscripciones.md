# Actualización de accesos tras aprobar suscripciones

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

## Validación

Pruebas backend: `npm test -- --runInBand --runTestsByPath tests/unit/services/secure/accesos.Service.test.ts`.

Pruebas frontend: ejecutar el runner instalado de React Scripts con `test --watchAll=false --runInBand --runTestsByPath src/utils/accessSession.test.js src/contexts/JWTContext.accesses.test.js src/utils/axiosFinanzatech.test.js`. Esto permite probar sin el archivo `.env.test`, que actualmente no existe. Todas las peticiones de estas pruebas están simuladas.

Compilación: `npm run build` en cada proyecto. Las pruebas comprueban preservación del vencimiento, autorización HTTP con el token nuevo, identidad del servidor, propiedad de la suscripción, límite por usuario, disponibilidad consistente, petición compartida, reintentos, efectos repetidos de React y sincronización entre pestañas.

Los JWT anteriores continúan válidos hasta su vencimiento. Esta entrega no incorpora revocación inmediata ni cambia la duración configurada de las sesiones.
