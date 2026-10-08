# Montaje global de Express — integración con MariaDB

## Alcance

`tests/mariadb/appHttp.test.ts` importa directamente `src/app.ts`, sin reconstruir
sus routers ni sustituir middleware. Incorpora 29 casos:

- Raíz pública: CORS permitido, exposición de Content-Disposition, identificador
  de correlación y cabeceras Helmet; no modifica SQL.
- `/ping`: ejecuta la consulta real de MariaDB y devuelve `pong`.
- Ruta desconocida: 404 JSON después del montaje global.
- Rutas representativas de administrador, financiero, empresario, inversionista,
  usuario y secure: exigen sesión y permiten detectar un router no montado.
- Creación de liquidación: sesión ausente, formato incorrecto, firma ajena,
  token expirado y rol financiero sobre escritura administrativa.
- Yup: entrada vacía devuelve 400 sin escrituras ni alerta de error inesperado.
- PEN/USD: creación administrativa, actor de sesión, saldo 4000 en SQL y lectura
  por administrador y financiero a través de la aplicación real.
- Trigger SQL real: fallo al insertar detalle devuelve 500 y revierte cabecera
  y detalles. El error se transforma en un error conocido y no alerta a Telegram.
- Error inesperado: se inyecta en la frontera Prisma de `/ping`; devuelve 500
  genérico y llama una vez al proveedor Telegram sustituido. No envía mensajes.
- Filtro IP real: blacklist puntual/global, whitelist vacía y IP fuera del rango.
- User-Agent bloqueado: 404 con cuerpo vacío bajo configuración de producción.
- Preflight CORS permitido/ajeno y `/ping` sin Origin.
- JSON malformado: 400 del manejador global antes de los filtros posteriores.
- Limitador global real: 500 solicitudes admitidas, siguiente 429, otra IP
  admitida. No se sustituye el reloj ni el almacén de rate-limiter-flexible.

Se usa configuración sintética equivalente al modo producción para probar sus
ramas, sin leer `.env.development` ni credenciales reales. La conexión Prisma
apunta exclusivamente a MariaDB 11.4.10 desechable. Los datos de whitelist y
blacklist son entradas en memoria; el algoritmo de filtrado permanece real.
Pino conserva el middleware HTTP real con un logger silencioso sin archivo.
Las funciones de correo se sustituyen por rechazos ante una llamada inesperada;
Telegram se sustituye por un espía. Servicios, DAOs, transacciones y consultas
del recorrido válido y del trigger son reales.

Se prepara un workspace temporal para `pathApp`; estas pruebas no suben ni
descargan archivos y no ejercitan los destinos relativos de Multer. Fixtures,
trigger y workspace se retiran después de cada caso y Prisma se desconecta
al terminar. Cada caso usa una IP documental distinta en X-Forwarded-For para
aislar las cuotas del limitador. Supertest conecta al proxy confiable local:
no representa un proxy Nginx real ni una comprobación de su despliegue.

## Cómo repetir

```powershell
npm run test:integration:typecheck
npm run test:integration -- tests/mariadb/appHttp.test.ts
npm run test:integration
```

Requiere Docker con motor Linux. Se restaura la estructura versionada en la
base desechable; no se consulta desarrollo ni producción. La evidencia local
queda en `coverage/mariadb/last-run.json` y `junit.xml`.

## Validación del 2026-10-08

Comprobación de tipos aprobada; 29/29 casos focalizados y 458/458 casos de
integración completa en catorce archivos. Ejecución `14b5fc330177753dd8e58405`:
`passed`, `cleanup: removed`; sin contenedores restantes
con etiqueta de integración. Se modificaron solo pruebas y documentación.
La primera ejecución detectó dos URLs equivocadas en la preparación y una
expectativa de alerta que no correspondía a un error SQL ya clasificado:
se corrigieron los tests conforme a routers/manejo reales y se añadió un caso
separado de error inesperado. No se corrigió producción ni se omitió el rollback.

## Comportamientos actuales y límites

**Origin obligatorio en producción.** CORS rechaza solicitudes sin Origin,
incluido `/ping`, con 404. Es una caracterización, no una nueva política ni
una recomendación de eliminar esa restricción. Un monitor o cliente de línea
de comandos sin ese encabezado no recibe `pong` con la configuración actual.
No se amplió la lista de orígenes de producción. El modo `isTest` tiene una
lista CORS vacía y no se valida aquí como configuración funcional de despliegue.

**Orden de middleware.** JSON se procesa antes de IP, limitador, CORS, logger
y Helmet; IP y User-Agent también pueden responder antes de CORS/Helmet.
Por ello, un JSON malformado carece de las cabeceras Helmet posteriores y
un rechazo IP carece de Allow-Origin. No se cambia el orden para conseguir
que los tests pasen ni se certifican cabeceras uniformes en todos los errores.

**Alcance representativo.** Importar todos los índices no equivale a validar
todas sus rutas, payloads o roles. El bloque prueba un recorrido financiero
real y montaje/autenticación representativos del resto; no cubre login, OTP,
registro de usuarios, carga de archivos, proveedores externos reales, servidor
de `index.ts`, jobs, HTTPS, Nginx ni Ubuntu ARM64. No certifica todos los
escenarios de trust proxy ni concurrencia del limitador. Las cuotas se prueban
en memoria en un único proceso, no en un despliegue con múltiples instancias.

Las deudas de negocio y PDF previas permanecen pendientes. No se modifican
producción, permisos, fórmulas, configuración real ni dependencias.

## Bloque siguiente implementado

Login y actualización de accesos ya cuentan con 25 pruebas del montaje global.
Ver [cobertura, deudas y siguiente paso](20261008_integracion_login_accesos.md).
