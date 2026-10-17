# CI local previo al pase: consolidado de Factoring — 2026-10-14

El usuario confirmó la descarga manual del reporte Excel con operaciones reales en la aplicación y autorizó ejecutar las pruebas completas de CI en ambos proyectos. No se efectuó despliegue ni empaquetado de producción.

## Resultado

| Control | Backend | Frontend |
| --- | --- | --- |
| Suite completa | Aprobada en repetición: 46 suites, 3.621 pruebas; 1 suite omitida con 3 todo | Aprobada tras confirmar reglas: 85 suites, 3.000 pruebas; sin fallos |
| Tipos | Aplicación, Vitest e integración aprobados | Aplicación y pruebas aprobados |
| Lint | Salida 0; 355 advertencias, sin errores | Salida 0 |
| Formato | Archivos modificados aprobados | Comprobación completa aprobada |
| MariaDB desechable | Aprobada: 19 suites y 554 pruebas; runtime compilado aprobado y contenedor eliminado | No aplica |

Node 24.21.0 y npm 11.19.0 portable verificados. Backend HEAD 7dd22b7 y frontend HEAD 2f21ba6, ambos con cambios locales: la evidencia corresponde al workspace, no solo a esos commits. No se verificó GitHub Actions/Ubuntu ni se reinstalaron dependencias. La integración incluye compilación aislada y runtime real Windows x64 con MariaDB Linux en Docker; no equivale a validar el proceso Node en Ubuntu/ARM64. No se ejecutó empaquetado de producción ni auditoría de seguridad. Estos resultados no certifican todo el pipeline remoto.

## Backend

Comando: `npm run test:vitest:ci`, con variables sintéticas de `tests/fixtures/ci-quick.env`, CI=true y Node portable. Se ejecutó fuera del aislamiento por la restricción EPERM observada anteriormente.

La primera ejecución, simultánea con pruebas y controles del frontend, terminó con 3.620 aprobadas y 1 fallo: timeout de 5 segundos en la descarga PDF real PEN de `factoringpropuestaPDF.empresario.test.ts`. La repetición completa sin esas otras comprobaciones simultáneas pasó, incluidos los 22 casos de esa suite. No se modificaron límites ni expectativas. El fallo no reproducido no permite concluir su causa; la contención de recursos es una hipótesis.

Cobertura de la repetición: statements 71,51%; branches 67,81%; functions 62,92%; lines 71,61%. Salida 0; duración 53,73 s. Los porcentajes corresponden a la selección configurada de cobertura, no a toda la aplicación.

Registros:

- [Ejecución inicial](../registros/pruebas/test-ci-backend-consolidado-20261014.log)
- [Repetición aprobada](../registros/pruebas/test-ci-backend-consolidado-repeticion-20261014.log)
- [Tipos](../registros/pruebas/test-ci-backend-typecheck-all-20261014.log)
- [Lint](../registros/pruebas/test-ci-backend-lint-20261014.log)
- [Formato](../registros/pruebas/test-ci-backend-format-changed-20261014.log)

El doctor de integración inicialmente falló por Docker no disponible. En la ejecución posterior autorizada mediante Alfa 3, Docker Linux ya estuvo disponible y se completó la integración descrita más abajo. No se ejecutaron pruebas contra desarrollo ni se modificó la base de datos de desarrollo.

## Frontend: cuatro fallos iniciales ajenos al consolidado

Comando: `& .\scripts\npm-node24.ps1 --silent run test:ci`. Suite completa, salida 1; duración 538,49 s.

1. `DetraccionForm.test.tsx`: la copia del nombre sugerido devuelve `E001-23.pdf`; la prueba espera `E001-00000023.pdf`.
2. `facturasNegociadas.test.ts`: misma diferencia de número sin completar a ocho dígitos en el nombre de constancia.
3. `detraccionSunat.test.ts`: tipo de bien/servicio devuelve sugerencia `037`; la prueba espera código XML `022` con origen comprobante.
4. `detraccionSunat.test.ts`: ante códigos contradictorios devuelve `037`; la prueba espera valor ausente.

Inspección de fuentes e historial: `datosSunat` fija `037`, mientras calcula pero no usa el código del XML; `nombreConstanciaSugerido` utiliza el número original sin completar. Ambas implementaciones y sus pruebas pertenecen al commit existente `2f21ba6` (pendientes de pagar detracción), y sus fuentes no tienen cambios locales. El reporte XLSX no modificó estos archivos. No se alteraron reglas de detracciones ni expectativas para aprobar CI; se requiere resolver el comportamiento esperado antes de corregir.

Pasaron las pruebas nuevas `factoring.consolidado.test.ts` (4) y `FactoringLista.consolidado.test.tsx` (2), además de `ReactTablePrincipal.test.tsx` (2). La validación manual de descarga fue realizada y confirmada por el usuario, no por el modelo.

Registros en `D:/10_Workspace_react/ft-app-frontend-mantis/docs/registros/pruebas/`:

- `test-ci-frontend-consolidado-20261014.log`
- `test-ci-frontend-typecheck-20261014.log` (vacío: comando silencioso, salida 0 registrada por la ejecución)
- `test-ci-frontend-lint-20261014.log`
- `test-ci-frontend-format-check-20261014.log`

## Confirmación de reglas por el usuario

Durante la opción Alfa 2, el usuario indicó expresamente conservar el comportamiento ajustado del código: el nombre de la constancia usa el número original, sin rellenarlo a ocho dígitos; la ayuda mantiene 01 y 037 como códigos sugeridos. Esta confirmación sustituye las expectativas anteriores que originaron los cuatro fallos.

Se revirtieron los cambios que priorizaban el código XML y rellenaban el nombre. Se actualizaron las tres suites afectadas a las reglas confirmadas, conservando las comprobaciones de cuenta XML, datos ausentes, fechas, copia y guardado. Se añadió una comprobación para preservar los ceros iniciales cuando ya existen en el número original. Se eliminaron únicamente tres cálculos sin uso de la utilidad SUNAT; el comportamiento final de códigos y nombre coincide con el código previo. La guía del módulo frontend quedó actualizada.

Validación enfocada actual: 3 suites y 20 pruebas aprobadas, salida 0. Registro frontend: `docs/registros/pruebas/test-detracciones-regla-confirmada-20261014.log`. La ejecución preliminar `alfa` se interrumpió tras la corrección del usuario y no se presenta como CI final.

CI final frontend: tipos, lint y formato completos aprobados; 85 suites y 3.000 pruebas aprobadas, sin fallos ni omisiones, salida 0; duración 317,58 s. Comprobaciones ejecutadas secuencialmente con Node portable 24.21.0. Registros finales en `D:/10_Workspace_react/ft-app-frontend-mantis/docs/registros/pruebas/`:

- `test-ci-frontend-reglas-typecheck-20261014.log` (vacío por comando silencioso; salida 0 verificada).
- `test-ci-frontend-reglas-lint-20261014.log` (vacío, sin advertencias; salida 0 verificada).
- `test-ci-frontend-reglas-format-check-20261014.log`.
- `test-ci-frontend-reglas-test-ci-20261014.log`.

## Integración completa Alfa 3

Doctor aprobado con Docker Linux. Se ejecutó `npm run test:integration` mediante el runner existente, restaurando las 131 tablas versionadas en MariaDB 11.4.10 desechable, con datos sintéticos, sin consultar desarrollo.

La primera ejecución completa obtuvo 553 pruebas aprobadas y un fallo de preparación en la prueba nueva del consolidado: se suministró `code` al vínculo `factoring_factura`, que no tiene ese campo. Se retiró únicamente ese dato sintético inválido; no se modificaron expectativas, reglas ni código de la aplicación. El contenedor de esa ejecución fue eliminado (`04db092d396a287db636390d`, cleanup=removed). La prueba focalizada posterior aprobó y eliminó su contenedor (`abc601b2eb95c46cbefa374b`). Tipos de integración y formato de la prueba también aprobaron.

Repetición completa final: **19 suites y 554 pruebas aprobadas**, salida 0, duración 464,15 s. Incluye la consulta real del consolidado, fechas Perú, registros eliminados, multiplicidad por factura, propuestas ausentes y conservación de zona de sesión UTC; también incluye runtime compilado, conexión real HTTP, cierre y rechazo de credenciales incorrectas.

Evidencia final: runId `940aa5425b804fa747a22f10`, status=passed, cleanup=removed. Ejecución del 2026-10-14 de 23:34:33 a 23:42:41 en Lima. El verificador del workflow aprobó frescura, hash del esquema, runtime win32/x64 con Node v24.21.0 y compilación en salida aislada. Se consultó directamente Docker y se confirmó la ausencia del contenedor propio al terminar.

Registros:

- [Doctor](../registros/pruebas/test-integracion-doctor-alfa3-20261014.log).
- [Primera ejecución y fallo de preparación](../registros/pruebas/test-integracion-completa-alfa3-20261014.log).
- [Prueba focalizada aprobada](../registros/pruebas/test-integracion-consolidado-alfa3-20261014.log).
- [Repetición completa aprobada](../registros/pruebas/test-integracion-completa-alfa3-repeticion-20261014.log).
- [Verificación final](../registros/pruebas/test-integracion-evidencia-alfa3-repeticion-20261014.log).
- [Tipos de integración](../registros/pruebas/test-integracion-tipos-alfa3-20261014.log).
- [Formato de la prueba](../registros/pruebas/test-integracion-formato-alfa3-20261014.log).

Evidencia detallada del runner: `coverage/mariadb/run-940aa5425b804fa747a22f10.json`, `coverage/mariadb/last-run.json`, `coverage/mariadb/junit.xml` y `coverage/mariadb/runtime/result-940aa5425b804fa747a22f10.json`. `last-run.json` y JUnit corresponden a esta ejecución final; las ejecuciones inicial y focalizada conservan sus JSON por runId.

## Cierre

Pruebas enfocadas y CI completa del frontend aprobadas con las reglas confirmadas. Suite CI del backend e integración MariaDB completa aprobadas, incluido runtime compilado y limpieza verificada. Solo se corrigió la preparación de datos sintéticos del test de integración del consolidado durante Alfa 3. Falta confirmar el pipeline remoto sobre los commits que se integrarán y preparar el pase controlado. No se activó producción.

