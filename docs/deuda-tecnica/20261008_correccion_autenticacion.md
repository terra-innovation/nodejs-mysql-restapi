# Corrección de login, vigencia y permisos de JWT — 2026-10-08

## Comportamiento implementado

- `loginUserService` usa `isProduction`: 24 horas en producción, 200 000 horas
  en desarrollo/test. El refresco conserva exp/iat; no prolonga la sesión.
- Login consulta únicamente usuarios y credenciales con `ESTADO.ACTIVO` (1).
  Cuenta/credencial en 0 o `ESTADO.ELIMINADO` (2), o credencial ausente, devuelve
  el mismo 404 genérico que las credenciales incorrectas, sin token ni aviso de login.
- Los roles emitidos al iniciar sesión requieren vínculo y rol activos.
- `isRole` consulta la cuenta y sus roles activos en MariaDB cuando el JWT
  declara un rol admitido por la ruta. Autoriza solo la intersección entre roles
  del JWT y roles SQL actuales; no concede roles nuevos antes del refresco.
- Vínculo/rol desactivado, eliminado lógicamente o vínculo borrado físicamente:
  el JWT antiguo recibe 403 en la siguiente solicitud protegida por rol.
  Cuenta desactivada recibe 401. Un fallo de lectura devuelve error, sin
  autorizar usando los roles antiguos del JWT.

Se reutiliza `getUsuarioAccesosByIdusuario`, que filtra cuenta, vínculo y rol
activos. No hay caché de permisos ni cambios de estructura de base de datos.
Cada control de rol válido añade una lectura de accesos en SQL antes del
controlador. Las rutas sin un rol admisible en el JWT rechazan antes de esa
consulta. Se conserva la identidad y el contrato HTTP de los perfiles.

## Pruebas de regresión

`authHttp.test.ts` reúne 36 casos reales: conserva los recorridos previos,
reemplaza caracterizaciones por regresiones y añade estados 0/2, falta de
credencial, baja física del vínculo, desactivación posterior de cuenta,
rol firmado sin permiso SQL y fallo al leer permisos vigentes. Comprueba que
los roles añadidos requieren refresco, mientras las bajas bloquean el JWT previo.

`secure.business.test.ts` verifica bcrypt/JWT reales: producción 24 horas y
ambas variantes fuera de producción conservan 200 000 horas.
Los fixtures HTTP de integración ahora crean vínculos/roles activos en SQL.
Los fixtures de pruebas rápidas sustituyen esa lectura de infraestructura;
no se desactiva ni sustituye `isRole` para conseguir que las pruebas pasen.
La limpieza respeta claves foráneas: vínculos y credenciales antes de usuarios.

```powershell
npm run test:integration -- tests/mariadb/authHttp.test.ts
npm run test:integration
npm run test:integration:typecheck
npm run test:vitest:typecheck
npm run test:vitest
npm run test:vitest:ci
npm test -- --runInBand
```

## Validación ejecutada

- Autenticación focalizada: 36/36 casos MariaDB aprobados.
- Integración completa, ejecución `96167af18af0bf4917af6cd5`: 493 aprobados
  y un fallo de fixture en 494 casos / 15 archivos. El segundo usuario de la
  caracterización de eliminación de archivo ajeno carecía de vínculo de rol SQL.
  Se añadió su rol 5 activo, conservando la expectativa y la limitación de
  pertenencia existente. Repetición `dbd8027dd67387cf7e45d798` de
  `invoiceHttp.test.ts`: 83/83 aprobados.
  Así se comprobaron los 494 casos distintos mediante ejecución general y
  repetición focalizada; no se afirma una única ejecución completa verde después
  del ajuste. Ambos contenedores se eliminaron. `last-run.json` y el JUnit
  corresponden a la última repetición focalizada; el JSON por ejecución conserva
  la evidencia del primer intento.
- Vitest rápido: 346 aprobados, 8 criterios `todo`, 17 suites aprobadas y una
  pendiente. Modo CI, JUnit y umbrales aprobados; 64.61% de líneas en los 21
  archivos seleccionados. Comprobación de tipos del backend, Vitest e integración aprobada.
- Jest completo: 2 907 aprobados y 7 fallidos, en 15 suites (14 aprobadas).
  Los siete fallos son los ya documentados en la
  [auditoría financiera](../unificacion-fechas-factoring-2026-10-06.md):
  dos pagos anteriores al inicio, dos entradas negativas y tres combinaciones
  controladas de IGV. La suite usa servicios financieros con infraestructura
  sustituida; sus expectativas se conservan y no se modificaron esos servicios.
  La suite HTTP de ficha de empresa pasó usando la lectura vigente de roles.
  Por ello no se declara una ejecución global de Jest completamente aprobada.

## Límites y despliegue

Las correcciones resuelven DT-AUTH-01/02/03 dentro del alcance acordado.
La firma/secreto de JWT y la arquitectura de sesión se conservan. **Los tokens
ya emitidos mantienen su exp original**: cambiar el plazo de login no reescribe
tokens en los clientes, y el refresco tampoco lo extiende ni lo acorta.
Los roles retirados sí se bloquean para esos tokens por la consulta vigente.

La comprobación se realiza al entrar en cada ruta con `isRole`; no cancela una
operación que ya pasó autorización ni procesos en ejecución. No es una lista
general de revocación de sesiones. Cambiar/desactivar una credencial bloquea
nuevos logins, pero no revoca por sí solo un JWT existente con cuenta/roles
activos. Las rutas que usan únicamente `isAuth` siguen verificando firma y
vencimiento y sus servicios aplican sus validaciones particulares.

No se modifican registro, recuperación de contraseña, fórmulas financieras,
proveedores externos ni permisos asignados en bases reales. No se ejecutó
despliegue ni se cambiaron datos históricos.

## Próximo paso propuesto

El usuario definió que las sesiones antiguas se invalidarán rotando la clave
de firma JWT, para exigir nueva autenticación. No se implementa otra política
para tokens antiguos ni se rotó la clave desde esta tarea.
La siguiente ampliación está en la [regresión del backend compilado](20261008_regresion_backend_compilado.md).
