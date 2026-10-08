# Login y actualización de accesos con aplicación real

Actualización del 2026-10-08: DT-AUTH-01/02/03 se corrigieron dentro del alcance
autorizado. La suite actual tiene 36 casos. Ver [implementación, regresiones y
límites de sesiones existentes](20261008_correccion_autenticacion.md). Lo que
sigue conserva la evidencia histórica del comportamiento anterior.

## Alcance inicial de pruebas

La ampliación inicial de `tests/mariadb/authHttp.test.ts` incorporó 25 casos con `src/app.ts` real,
MariaDB 11.4.10 desechable, bcrypt real, JWT firmado y middleware real:

- Login de roles 2/3/4/5/6: usuario correcto, firma, roles y ausencia de cambios
  en usuario, credencial, rol y vínculo. Se caracteriza la vigencia actual.
- Correo inexistente/password incorrecta: 404 sin token; entrada inválida,
  contraseña corta o ausente: 400. No hay notificación de login exitoso.
- Refresco: conserva exp/iat, elimina hash del JWT actualizado, depura perfil
  público, entrega menú y Cache-Control no-store sin escrituras.
- Rol financiero añadido después del login: aparece en token y menú nuevos
  sin extender el vencimiento; el token previo conserva sus roles originales.
- Vínculo/rol inactivo: desaparece del token actualizado y del menú; el nuevo
  token recibe 403 en ruta administrativa. El JWT previo aún pasa autorización
  y llega al servicio, que devuelve 404 por la operación sintética inexistente.
- Cuenta/credencial/vínculo/rol inactivo durante login: caracteriza la diferencia
  con el refresco, sin presentar ese comportamiento como política recomendada.
- Refresco con token expirado, sin exp, usuario inexistente o sin id: 401 sin
  escrituras. Fallo controlado de lectura en Prisma: 500 sin alterar SQL.
- Login: diez intentos por IP; el siguiente 429; otra IP puede autenticar.
- Refresco: diez solicitudes por usuario, incluso cambiando IP; siguiente 429
  con Retry-After; otro usuario en la misma IP conserva su propia cuota.

La preparación crea credenciales bcrypt sintéticas (coste 4 solo en fixture),
usuarios y roles. No sustituye bcrypt, JWT, servicios, DAOs, menús ni routers.
Correo y Telegram son proveedores sustituidos: no se envían mensajes reales.
Configuración, listas IP, conexión y almacenamiento se aíslan igual que en la
suite de montaje global. El cambio de roles es una entrada SQL del escenario,
no una prueba de aprobación administrativa de servicios o de suscripciones.

Se esperan snapshots SQL y se retiran credenciales y vínculos antes de usuarios,
manteniendo claves foráneas activas. La limpieza es local a esta suite para
evitar cambios innecesarios en las demás. No se accede a desarrollo/producción.

## Cómo repetir

```powershell
npm run test:integration:typecheck
npm run test:integration -- tests/mariadb/authHttp.test.ts
npm run test:integration
```

Requiere Docker con motor Linux. Informes locales: `coverage/mariadb/last-run.json`
y `junit.xml`. El refresco no renueva la sesión original.

## Validación del 2026-10-08

Comprobación de tipos aprobada; 25/25 casos focalizados y 483/483 casos de
integración completa en quince archivos. Ejecución `2f90dd879a8ac2e336f02598`:
`passed`, `cleanup: removed`; sin contenedores restantes
con etiqueta de integración. Solo se modificaron pruebas y documentación.
La preparación se ajustó al booleano real de Prisma y al 404 del servicio
al consultar una operación inexistente; no se ocultó un fallo de producción.
El intento previo de suite completa no pudo ejecutarse por revisión automática
indisponible; tras reanudar se inició Docker Linux y se completó la validación.

## Hallazgos iniciales — corregidos posteriormente según el alcance autorizado

**DT-AUTH-01 — Vigencia del login de 200 000 horas.**
`loginUserService` firma con `expiresIn: "200000h"`. La prueba verifica el
intervalo real exp-iat, aproximadamente 22,8 años. No se adopta ese plazo como
política profesional recomendada ni se reduce silenciosamente en esta entrega.
Definir una duración y una estrategia de renovación/revocación requiere revisar
el contrato con el frontend y la arquitectura de sesión actual.

**DT-AUTH-02 — Login no filtra estados activos.**
Los DAOs de autenticación y lectura de roles para login no filtran estado de
usuario, credencial, vínculo ni rol. Con contraseña correcta, los cuatro casos
inactivos obtienen 201 y rol 2 en el JWT. El refresco sí rechaza al usuario
inactivo con 401 y filtra vínculos/roles inactivos, pero no consulta credencial.
Se documenta una brecha entre login y refresco, no una autorización de cuentas
inactivas. Una futura corrección debe definir los estados admitidos y exigir
rechazo sin token ni aviso de login, conservando el contrato de errores acordado.

**DT-AUTH-03 — JWT anterior conserva permisos después de retirar un rol.**
El middleware verifica firma y roles del JWT sin releer sus estados en SQL.
El token actualizado refleja la baja, pero el anterior sigue pasando el control
de rol hasta su vencimiento. Los tests distinguen autorización de lectura: el
404 posterior corresponde al servicio y no afirma que se haya leído una operación.
No se implementan lista de revocación, versión de sesión ni consulta por solicitud.
Una política de revocación debe acordarse junto con DT-AUTH-01.

Estos casos son caracterizaciones; que aprueben no significa que esas deudas
estén corregidas. No se modificó código de producción ni dependencias.
La prueba no cubre registro, OTP, recuperación de contraseña, proveedor real,
Nginx, múltiples procesos del limitador ni todos los estados/roles posibles.
Tampoco valida el refresco automático del frontend ni aprobación administrativa
de servicios de factoring: esos flujos siguen siendo bloques separados.

## Continuación

El rechazo de login inactivo y los permisos de roles anteriores ya se corrigieron
con estado activo 1 confirmado por el usuario. La vigencia de nuevos JWT es
24 horas en producción. Consultar [límites y siguiente decisión](20261008_correccion_autenticacion.md).
