# HTTP de propuestas, liquidaciones y transferencias — 2026-10-08

La suite `tests/mariadb/financialHttp.test.ts` añade **60 casos** con routers,
JWT, controladores, Yup, servicios, DAOs, Prisma y MariaDB reales. No se cambian
servicios, permisos, fórmulas, respuestas ni esquema. Complementa los 83 casos
HTTP de facturas/archivos y las suites SQL existentes.

## Contratos de rutas

Se montan los seis routers administrativos/financieros en Express con JSON y
el manejador de errores real. Base: `/api/v1/{perfil}/servicio/factoring/`.

| Recurso | Administrador, rol 2 | Financiero, rol 6 | Consulta por operación |
| --- | --- | --- | --- |
| `factoringpropuesta` | Creación, simulación, actualización, baja, activación y consulta | Consulta | 201 |
| `factoringliquidacion` | Creación, simulación, actualización, baja, activación y consulta/detalle | Consulta/detalle | 200 |
| `factoringtransferenciacedente` | Creación, actualización, baja, activación y consulta | Consulta | 201 |

Los routers financieros no ofrecen POST `crear`; esas peticiones devuelven 404
en el montaje de prueba. No se crean rutas nuevas ni se concede escritura al rol
6. La creación administrativa requiere rol 2 y devuelve 201; actualización 200,
baja y activación 204 sin cuerpo. Se mantienen los códigos de lectura existentes,
incluido 201 en consultas de propuestas y transferencias.

Los routers también contienen rutas de maestro, PDF o envío de correo según el
recurso; no forman parte de esta ampliación. La tabla describe las rutas probadas.

## Casos

| Cantidad | Alcance |
| --- | --- |
| 6 | Tres recursos × PEN/USD: creación, actor de sesión, importes independientes, detalles/vínculo y consulta con ambos perfiles; simulación sin escrituras en propuesta/liquidación y lectura de detalle de liquidación |
| 9 | Creación: sin sesión, rol financiero o JWT expirado; rechazo sin escrituras |
| 18 | Consulta: tres recursos × dos perfiles × sin sesión/rol ajeno/JWT expirado |
| 12 | Formulario: campo requerido, identificador corto, fecha inválida y porcentaje/importe/cantidad inválidos |
| 3 | Operación inexistente: 404 sin alterar registros previos |
| 6 | Fallo SQL en cabecera o detalle/vínculo: 500 con rollback y conservación de una creación previa válida |
| 3 | Actualización de estado, baja y activación: actor, estado y conservación de importes/detalles |
| 3 | Ruta financiera de creación ausente: 404 sin escrituras |

El body envía `idusuario` e `idusuariocrea` ajenos y un campo desconocido al
crear. El registro guarda al usuario del JWT. La validación elimina campos que
no pertenecen al DTO; no se cambia el esquema de Yup para aceptar las pruebas.

Oráculos sintéticos de propuesta: financiado 16 000, garantía 4 000, descuento
320, adelanto 15 426.30 PEN o 15 438.10 USD en banco 1, con dos detalles y un
historial. Son valores propios del catálogo de integración, no tarifas de
producción. La liquidación puntual conserva saldo a favor 4 000 y fecha de pago
UTC; la transferencia conserva 4 000.15, moneda, fecha y vínculo de constancia.
La consulta por HTTP devuelve el UUID creado y no modifica SQL.

Los snapshots comparan las nueve tablas implicadas: operación, propuesta,
historial/detalles de propuesta, liquidación/detalles, transferencia/vínculo y
archivo. Los triggers temporales provocan errores reales del motor. No se simula
el rollback ni se borra información para ocultar una escritura parcial.

## Aislamiento y límites

La conexión se dirige a la base exclusiva verificada por `businessSupport`.
Datos y catálogos son sintéticos; los JWT tienen una clave exclusiva de prueba.
El reloj de Luxon se fija para cálculos, mientras JWT usa expiración real (`exp: 1`
para tokens vencidos). Los triggers se eliminan en cada caso y el runner elimina
su contenedor MariaDB 11.4.10. No se consulta desarrollo/producción.

Se sustituyen configuración/conexión, logger y proveedores de correo/Telegram.
No se invocan envíos externos, PDF ni transferencia bancaria. El servicio de
propuesta se actualiza a estado 6 sin correo; eso no equivale al flujo de aceptación
del empresario ni reemplaza sus pruebas. El fixture prepara propuesta aceptada
y fecha de inicio para liquidación/transferencia: todavía no es el recorrido
conectado completo del negocio.

Las consultas verifican existencia del registro y saldo de liquidación; no
certifican toda la proyección de datos de los perfiles. Las pruebas de permisos
se centran en creación/consulta; no prueban cada combinación de rol para todas
las rutas PATCH/DELETE, maestros, descarga o envío de correo. Se monta una app
de prueba; no certifica montaje global, login, CORS/rate limit ni Ubuntu ARM64.

Las deudas de archivos, transacción independiente del calculador y políticas de
deduplicación permanecen sin corrección autorizada. No se reserva crédito ni se
alteran líneas desde estas pruebas.

## Repetir

```powershell
npm run test:integration:typecheck
npm run test:integration -- tests/mariadb/financialHttp.test.ts
npm run test:integration
```

La ejecución específica aprobó los 60 casos. La suite rápida no se modificó ni
se volvió a ejecutar en esta etapa.

La ejecución completa aprobó **315 casos en once archivos, cero fallos**,
incluidos los 60 HTTP reforzados con registros previos en rollback. Tipos de
integración aprobados. RunId `58eb1721737fc99b465d92b7`, estado `passed`,
limpieza `removed`; una consulta independiente de Docker confirmó que no
quedaron contenedores del runner. `git diff --check` sin errores de whitespace.

Siguiente bloque recomendado: recorrido conectado PEN/USD, usando los IDs y
resultados reales de XML, operación, propuesta, aprobación, inicio y liquidación,
para comprobar la compatibilidad entre etapas sin sustituir sus resultados por
fixtures. Ver [plan](../../tests/mariadb/PLAN_AMPLIACION.md).
