# Vitest en el backend

Versiones actuales desde el 2026-10-09: `vitest@5.0.3`, `vite@7.3.7` y
`@vitest/coverage-v8@5.0.3` como dependencias de desarrollo con versiones
exactas y `package-lock.json` actualizado. Vitest 5.0.3 declara Node
`^22.12.0 || ^24.0.0 || >=26.0.0`; Vite 7.3.7 satisface su requisito de Vite.
En este Windows se usa Node 24.21.0 portable, según `AGENTS.md`.
Para instalaciones reproducibles, usar `npm ci` con las dependencias de
desarrollo habilitadas. La migración a Vitest 5 se verificó mediante compilación
y comprobación de tipos, sin ejecutar pruebas; ver
[alcance y límites](../../docs/migracion-vitest5-20261009.md).

Vitest utiliza Vite para transformar las pruebas TypeScript/ESM. El desarrollo
del servidor continúa con `tsx` y su compilación con `tsdown`. No se requiere un
servidor Vite, navegador, puerto adicional, base de datos ni `.env.test` para
estas pruebas unitarias y HTTP. La carga de archivos usa carpetas desechables
creadas con `mkdtemp` y las elimina tras cada caso.

## Comandos

| Comando | Uso |
| --- | --- |
| `npm test` | Selección existente de Jest |
| `npm run test:vitest` | Ejecutar Vitest una vez; falla si no encuentra pruebas |
| `npm run test:vitest:unit` | Ejecutar solo pruebas unitarias |
| `npm run test:vitest:http` | Ejecutar solo pruebas de rutas y controladores |
| `npm run test:vitest:watch` | Reejecutar durante el desarrollo |
| `npm run test:vitest:coverage` | Generar cobertura V8 en `coverage/vitest/` |
| `npm run test:vitest:typecheck` | Verificar tipos de las pruebas y configuración |
| `npm run test:vitest:ci` | Modo CI, cobertura mínima y reporte JUnit |
| `npm run test:all` | Ejecutar Jest, tipos de Vitest y Vitest; detenerse ante un fallo |

Ejecutar un archivo o filtrar por nombre:

```bash
npm run test:vitest -- tests/vitest/unit/dateUtils.test.ts
npm run test:vitest -- -t "desembolso sin días de interés"
```

Vitest transforma TypeScript pero no sustituye su comprobación de tipos.
Mantener también `npx tsc --noEmit` para el código del backend. En automatización,
ejecutar los comandos de tipos y pruebas en modo `run`, con `CI=true` para
rechazar pruebas marcadas `.only`.

## Configuración y aislamiento

- `vitest.config.ts` selecciona `tests/vitest/unit/`, `tests/vitest/http/` y
  `tests/vitest/pending/`, con hasta cuatro workers. Las pruebas Jest y los
  scripts manuales no se incluyen. `pending` contiene criterios `todo` que no
  ejecutan aserciones ni representan contratos implementados.
- Entorno Node, `TZ=UTC` y `NODE_ENV=test` definidos antes de iniciar el proceso
  mediante `cross-env`, tanto en Windows como en Linux.
- Imports explícitos desde `vitest`, sin globales. El `tsconfig.json` de esta
  carpeta limita los tipos globales a Node para evitar depender de tipos de Jest.
- Los aliases `#src/` y `#root/` resuelven los imports ESM terminados en `.js`
  hacia los archivos fuente. Los tests ejecutan módulos reales, salvo los mocks
  declarados por cada suite; no se reutiliza el mock global de `file-type` de Jest.
- Archivos de prueba aislados; limpieza de llamadas de mocks, restauración de
  spies y de globals/variables modificados con `vi.stubGlobal`/`vi.stubEnv`.
  Los relojes falsos se restauran explícitamente con `vi.useRealTimers()`.
- No se cargan credenciales ni se inicia `src/index.ts`. Prisma/DAOs, SMTP,
  Telegram y generación de PDF se sustituyen antes de importar los servicios
  en las suites rápidas. La suite MariaDB `pdfHttp.test.ts` usa el generador real,
  lee los PDFs descargados y comprueba limpieza, con sus límites documentados.
  Los tests HTTP montan routers de producción en una app Express de prueba, con
  controladores, validación, servicios, calculadores, JWT y manejo de errores reales.
  No validan el montaje global de `src/app.ts` ni sus filtros de IP/CORS/rate limit.
  Las futuras integraciones reales necesitan una base desechable con una
  protección que rechace conexiones a producción.

## Alcance actual: 346 casos activos y 8 pendientes

| Suite | Casos | Contrato comprobado |
| --- | ---: | --- |
| `unit/factoring.Calculator.test.ts` | 4 | Desembolso V3 sin días de interés, PEN/USD, banco propio/interbancario, tres facturas, descuento de comisión, IGV y garantía |
| `unit/dateUtils.test.ts` | 8 | Fecha civil por defecto antes/después de medianoche de Lima, cambio de año, rechazo de fechas inválidas y año bisiesto |
| `unit/fileType.test.ts` | 2 | Carga ESM real, identificación de un PNG y rechazo de texto como imagen |
| `unit/factoringpropuesta.business.test.ts` | 25 | Simular/crear en PEN y USD, conciliación de cabecera y detalles, riesgos y catálogos ausentes, historial, cambios de estado, notificación y fallos de escritura |
| `unit/factoringliquidacion.business.test.ts` | 38 | Pago en inicio, puntual y tardío, reintegro, mora, IGV, exoneración, cargos/abonos adicionales, saldo cero o por cobrar, importes aceptados, persistencia y errores |
| `unit/factoringtransferencia.business.test.ts` | 17 | Crear transferencia y vincular constancia, relaciones requeridas, cambios de estado, actor, activar/eliminar y fallos de persistencia |
| `unit/secure.business.test.ts` | 29 | Login con bcrypt/JWT reales, vigencia por entorno, reset con cifrado real, OTP incorrecto/usado/vencido, errores de escritura, actualización de roles, expiración durante lectura, privacidad y pertenencia de suscripciones |
| `unit/archivo.business.test.ts` | 14 | Filesystem y MIME reales, límite exacto, extensión, contenido incompatible, catálogos ausentes, limpieza del temporal, descarga y eliminación lógica |
| `http/factoring.business.test.ts` | 46 | Rutas reales de propuestas/liquidaciones, autenticación, separación de roles, validación, simulación/creación, actor desde sesión y errores 400/401/403/404/500 |
| `unit/facturaXML.business.test.ts` | 26 | XML real, codificaciones/prefijos, fechas/impuestos, cuotas, neto, detracción PEN/USD, retención y persistencia de vencimiento/moneda |
| `unit/facturaRegistro.business.test.ts` | 18 | Tipos de archivo, cabecera/detalles/vínculos, actor, moneda PEN/USD y vencimiento enviados al DAO, enriquecimiento y errores |
| `unit/factoringfactura.business.test.ts` | 21 | Asociar factura, estados de factura/detracción, constancia, fechas UTC, actualizar, activar/eliminar y errores |
| `unit/factoringaprobacion.business.test.ts` | 15 | Pertenencia/vigencia, reserva condicional, propuesta aprobada 6 y operación 4, ambos historiales, vínculo aceptado, conflicto y notificaciones |
| `unit/factoringestado.business.test.ts` | 26 | Estado actual e historial, adjuntos, estados 29/10/36, fecha de inicio, edición/baja lógica y errores |
| `http/facturaXML.business.test.ts` | 13 | Router de registro XML, permisos, validación, actor desde JWT, respuesta y errores |
| `http/factoringestado.business.test.ts` | 29 | Routers de aceptación e historial, permisos separados, validación, auditoría y errores |
| `unit/mariadbEnvironment.test.ts` | 15 | Rechazo de destinos ajenos, limpieza de contenedores por identidad, integridad del snapshot y argumentos permitidos; no equivalen a ejecución de MariaDB |
| `pending/business-decisions.test.ts` | 8 `todo` | Seis deudas financieras y DT-TEST-01/02; no se cuentan como casos aprobados |

Los importes esperados son valores fijos con un cálculo independiente explicado
en la prueba, sin ejecutar el calculador para fabricar sus propios resultados
esperados. Estos casos amplían la suite existente de Jest; no reemplazan ni
duplican sus archivos completos.

La primera ampliación agregó 167 casos a los 14 iniciales. La del 2026-10-08
agrega otros 142 casos para XML, asociación de facturas, aprobación y estados.
La corrección de DT-XML-02 agrega cuatro casos PEN/USD; DT-XML-01 corregido
por el usuario queda protegido por vencimiento distinto de emisión y ausencia
de vencimiento. Ambos criterios XML tienen pruebas activas y salen de `todo`.
Véanse los contratos, supuestos
y límites en la [matriz de regresión](MATRIZ_NEGOCIO.md).

## Cobertura y validación

La cobertura incluye 21 archivos: calculador, fechas y XML, servicios de factoring/
facturas, aprobación del empresario, login/accesos, archivos/suscripciones,
autenticación y cinco controladores. Incluye funciones aún no ejercitadas y no
representa la cobertura de todo el backend ni agrega resultados de Jest.

Umbrales mínimos para esta etapa: 60% de líneas, sentencias y ramas, y 50% de
funciones en el conjunto seleccionado. Accesos exige 100% de líneas/sentencias/
funciones y 90% de ramas; archivos exige 100% de líneas, 95% de sentencias,
80% de ramas y 85% de funciones. `test:vitest:coverage` y `test:vitest:ci` fallan
si se incumplen. Al ampliar la matriz, subir estos mínimos de forma gradual.

Reportes ignorados por Git: `coverage/vitest/index.html`, `lcov.info` y
`coverage-summary.json`; el comando CI agrega `junit.xml`. El CI se valida como
comando local, sin crear todavía un workflow de un proveedor externo.

Validación actual (Windows, Node 20.20.2, 2026-10-08): 17 suites / 346
casos aprobados, 8 criterios `todo`, modo CI con JUnit y umbrales aprobados,
64.61% de líneas en los 21 archivos seleccionados. Comprobación de tipos de
Vitest y `tsc --noEmit` del backend aprobadas. El caso que genera y verifica
un hash bcrypt de coste 12 admite 15 segundos bajo cobertura; los demás
conservan el timeout predeterminado. No se sustituye bcrypt por un mock.

Se añaden 15 pruebas rápidas de protección del nuevo entorno de integración.
Las cuatro comprobaciones reales de MariaDB son una suite separada y pasaron
tras el reinicio de Windows: restauración de 127 tablas, relaciones/collations,
MariaDB 11.4.10 en UTC y lectura mediante Prisma. El contenedor fue eliminado.
La suite separada ahora incluye 175 casos de negocio, cinco del auditor y cuatro de entorno, todos
aprobados. XML PEN/USD, lectura y rollback se prueban con servicios/DAOs/Prisma
reales. La aprobación concurrente y la importación administrativa atómica se
corrigieron con regresión real. Se añadieron 27 casos del empresario y se
unificaron sus etapas para garantizar rollback ante rechazos de elegibilidad
y errores posteriores. Creación de empresas se verifica en el DAO; el servicio
XML exige empresas preexistentes. Las suites rápidas siguen independientes.
Ver [alcance empresario](../../docs/deuda-tecnica/20261008_DT_XML_empresario_integracion.md).
Se añadieron 27 casos de creación de factoring y líneas administrativas;
se corrigieron sumas Decimal y doble creación concurrente, conservando la
decisión de no reservar/consumir líneas al crear la operación. Ver
[alcance de operaciones](../../docs/deuda-tecnica/20261008_DT_creacion_factoring_integracion.md).
Se añadieron 36 casos de liquidaciones/transferencias y cinco regresiones del
auditor de lectura; total real 114. Ver
[alcance y auditoría](../../docs/deuda-tecnica/20261008_integracion_liquidaciones_transferencias_auditoria.md).
Se añadieron después 19 casos de cálculo y creación de propuestas; total real
133. Guardado/lectura, rollback, conexiones distintas del calculador y creación
mientras otra propuesta se aprueba: [hallazgos](../../docs/deuda-tecnica/20261008_integracion_propuestas_calculo.md).
La ampliación de solicitudes repetidas/concurrentes añade 12 casos; total 145.
Ver [comportamiento actual y rollback aislado](../../docs/deuda-tecnica/20261008_integracion_concurrencia_liquidaciones_transferencias.md).
El recorrido HTTP/Multer añade 36 casos; total 181. JWT, routers, controlador,
parser, disco y SQL reales: [alcance y límites](../../docs/deuda-tecnica/20261008_integracion_HTTP_Multer_facturas.md).
La frontera global de 20 MiB agrega tres casos HTTP reales; total 184. La versión
actual acepta un byte menos, pero rechaza exactamente el límite y un byte más.
La ampliación de JWT expirados y sesiones sin roles válidos añade 30 casos reales;
total 214. Carga, registro y descarga rechazados conservan los datos y archivos previos.
La eliminación lógica añade 14 casos reales; total 228. Se prueban permisos,
rollback y conservación de contenido/vínculos; pertenencia y descarga posterior
quedan descritas como límites actuales, sin cambios productivos.
Estados e historial de operación añaden 27 casos SQL reales; total 255 en diez
archivos. Se validan PEN/USD, 29/10/36, inicio, adjuntos y rollback. Ver
[evidencia](../../docs/deuda-tecnica/20261008_integracion_estados_historial_operacion.md).
El HTTP administrativo/financiero agrega 60 casos; total 315 en once archivos.
Permisos 2/6, PEN/USD, DTO, actor, simulación, consulta y rollback SQL:
[alcance](../../docs/deuda-tecnica/20261008_integracion_HTTP_financiero.md).
El recorrido conectado suma diez casos; dejó el total en 325 en doce archivos. XML,
operación, propuesta, disponibilidad, aprobación, inicio y liquidación reales,
sin preparar directamente los resultados intermedios:
[evidencia](../../docs/deuda-tecnica/20261008_integracion_recorrido_conectado.md).
PDF reúne 104 casos; negocio y entorno reúnen 494 en quince archivos. Generación/descarga real,
PEN/USD, dos facturas vinculadas, importes, fechas, anticipación/mora, 60 conceptos
con paginación, permisos y temporales. Doce casos de concurrencia del mismo
documento reproducen DT-PDF-04 (una descarga falla); cuatro de documentos
distintos responden correctamente. Doce casos adicionales cubren nombres largos
y veinte facturas; DT-PDF-05 registra superposición nombre/RUC en propuesta.
Dieciséis cancelaciones TCP antes del cuerpo comprueban limpieza, SQL y reintento.
Dieciséis fallos de escritura caracterizan DT-PDF-01: sin PDF al fallar la
apertura, parcial huérfano al fallar después de 64 bytes reales y reintento correcto.
La corrección de concurrencia queda diferida por decisión del usuario:
[alcance y límites](../../docs/deuda-tecnica/20261008_integracion_PDF.md).
El montaje global agrega 29 casos de MariaDB en `appHttp.test.ts`, importando
`src/app.ts` real con filtros, permisos y manejo de errores sin sustituirlos.
Incluye liquidación PEN/USD y rollback. Ver [montaje global y límites](../../docs/deuda-tecnica/20261008_integracion_montaje_global.md).
Login/refresco reúnen 36 casos de MariaDB en `authHttp.test.ts`, con bcrypt,
JWT y montaje reales. Ver [correcciones de autenticación y límites](../../docs/deuda-tecnica/20261008_correccion_autenticacion.md).
Ver [hallazgos](../../docs/deuda-tecnica/20261008_DT_integracion_MariaDB.md).
Fuente, requisitos y comandos:
[`tests/mariadb/README.md`](../mariadb/README.md).
El proceso compilado agrega dos casos separados: `npm run test:runtime`.
La matriz total de integración reúne 496 casos en 16 archivos; la ampliación
validó los dos casos nuevos, sin repetir toda la matriz. Ver
[compilación, proceso real y límites](../../docs/deuda-tecnica/20261008_regresion_backend_compilado.md).

Coexistencia validada el 2026-10-08: 2 suites de Jest / 14 casos aprobados
(propuestas administrativas y delegación de facturas financieras). No representa
una ejecución completa de Jest. Hallazgos y límites nuevos:
[XML, aprobación y estados](../../docs/deuda-tecnica/20261008_DT_hallazgos_XML_regresion.md).

Referencia de la instalación inicial (Windows, Node 20.20.2, 2026-10-07): 3 suites / 14
casos de Vitest aprobados con cobertura V8; comprobación de tipos de Vitest y
`tsc --noEmit` del backend aprobadas. También se ejecutaron 10 suites existentes
de Jest (125 casos aprobados): calculador, fechas, simulación, propuesta,
liquidación, accesos, ficha de empresa por roles, archivos, facturas y tipo de
cambio. Esa selección no representa toda la suite de Jest ni una validación en
Linux ARM64. La cobertura inicial de líneas de los dos módulos del piloto fue
42.51%. No comparar directamente ese porcentaje con el actual: el alcance pasó
de dos a veintiún archivos.

## Incorporar más pruebas

1. Crear pruebas unitarias en `tests/vitest/unit/` con imports explícitos
   `import { describe, expect, it, vi } from "vitest"`.
2. Para migrar una suite de Jest, conservar sus escenarios y resultados esperados;
   usar `vi.mock`/`vi.fn`/`vi.mocked`, revisar el hoisting de las fábricas y sustituir
   `jest.requireActual` por `await vi.importActual` cuando corresponda.
3. Comparar la suite original y la migrada antes de retirar la original. No
   incluir automáticamente todos los archivos Jest en Vitest ni usar un alias
   global `jest = vi`.
4. Agregar pruebas HTTP con Supertest, permisos y errores; luego persistencia
   real con MariaDB 11.4 y flujos completos, cada nivel con fixtures y limpieza
   propios. Supertest ya está instalado.
5. Mantener los contratos de fechas civiles e instantes UTC/Lima. La deuda
   financiera documentada no es una regla aprobada; resolver las expectativas
   de esos casos antes de convertirlas en criterios de aceptación.

Referencias: [configuración oficial de Vitest](https://vitest.dev/config/),
[migración a Vitest 5](https://vitest.dev/guide/migration/),
[migración desde Jest](https://vitest.dev/guide/migration/jest).
