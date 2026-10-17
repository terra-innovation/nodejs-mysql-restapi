# Validación aislada previa al PR — 17/10/2026

Resultado local: controles completados y aprobados en ambos proyectos. Esta evidencia corresponde al contenido de trabajo identificado abajo, incluidos los archivos nuevos del agrupador de CI. No acredita checks remotos de GitHub ni una mezcla posterior con la rama principal.

## Revisión y aislamiento

- Backend: HEAD `6d537f47ffae966c94889eb540f0dd006945ccea`, con cambios pendientes; base de formato `98b5a7687ff23cd04cd201debe4a462f72283d82` (`origin/master` local).
- Frontend: HEAD `68cebe5a22bf475371909352b4654bad49b6a7ee`, con cambios pendientes. Su rama principal remota local es `primero/main`.
- Entorno: Windows x64, Node 24.21.0 portable y npm 11.19.0. MariaDB 11.4.10 en Docker Linux.
- Copias Git independientes bajo `coverage/pre-pr-20261017T142752Z/`, con dependencias instaladas desde cada lockfile. Incluyen archivos nuevos y modificaciones del checkout original. No se copiaron perfiles personales; se utilizaron los fixtures públicos del CI.
- Se habilitó `core.longpaths` únicamente en la copia del frontend para resolver el límite de rutas de Windows. No se modificó la configuración global.
- Verificación SHA-256 final: 875 archivos del backend y 1.444 del frontend, excluyendo registros generados; ninguna diferencia inesperada. Manifiestos iniciales, correcciones y comprobación final conservados en los directorios de evidencia.
- Sin mantenimiento de desarrollo/producción, sin `prisma-sync` ni `build-prod`. Los builds, clientes generados, instalaciones y bases de prueba se limitaron a las copias aisladas.

## Controles y resultados

| Proyecto | Control                                                                                               | Resultado                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Backend  | Generación Prisma, tipos de aplicación/pruebas, lint, formato respecto a la base y contrato de fechas | Aprobados                                                                            |
| Backend  | Suite rápida completa con cobertura y umbrales de CI                                                  | 58 suites aprobadas, 1 omitida; 3.751 pruebas aprobadas y 3 TODO existentes          |
| Backend  | Cobertura                                                                                             | Statements 71,61%; branches 67,91%; functions 62,92%; lines 71,72%; control aprobado |
| Backend  | Compilación normal del CI                                                                             | Aprobada                                                                             |
| Backend  | Integración completa, incluido runtime compilado                                                      | 23 suites y 582 pruebas aprobadas                                                    |
| Backend  | Verificación del informe y limpieza de MariaDB                                                        | Aprobadas; contenedor eliminado                                                      |
| Frontend | Tipos de aplicación/pruebas, lint y formato global                                                    | Aprobados                                                                            |
| Frontend | Suite completa `test:ci`                                                                              | 92 suites y 3.051 pruebas aprobadas                                                  |
| Frontend | `build:ci`, salida `.cache/frontend-ci-build`                                                         | Aprobado                                                                             |
| Frontend | Perfiles versionados y auditoría con excepciones vigentes                                             | Aprobados; 4 entradas, 2 avisos conocidos, 0 bloqueos                                |

Los TODO/omisiones del backend no equivalen a comportamiento validado. La auditoría frontend conserva los avisos `GHSA-f596-whhp-79r4` y `GHSA-m9gg-hp2v-232j`; sus excepciones son válidas antes del 11/11/2026. No se cambiaron excepciones ni dependencias.

## Fallos encontrados y correcciones

El primer control completo de formato detectó ocho archivos del backend y tres del frontend que las selecciones focalizadas previas no habían cubierto. Se aplicó exclusivamente Prettier; cada resultado se comparó con la salida del formateador sobre su versión original. Las listas y huellas están en `format-corrections.json` de cada proyecto. No se modificaron fórmulas, contratos ni aserciones.

La primera integración aprobó 22 suites y 575 pruebas, pero `tests/mariadb/detraccion.test.ts` falló al importarse: `archivotipo.Dao` cargaba el logger y este intentaba validar configuración real ausente en la copia limpia. Se añadieron únicamente los adaptadores de configuración y logging ya usados por las otras suites. Se conserva Prisma real contra MariaDB y todas las aserciones. Tipos de integración y formato aprobaron; ESLint ignora ese archivo por su configuración actual, por lo que su ejecución puntual no aporta cobertura de lint.

La suite corregida aprobó sus siete casos en MariaDB desechable. Después se repitió toda la integración mediante `ci:integration`: 23 suites, 582 pruebas, salida 0 y verificación del informe aprobada. Entre ejecuciones Docker Desktop estaba cerrado; el primer intento quedó detenido por `doctor`, sin ejecutar integración. Se inició la instalación existente, sin cambiar configuración, y se completó la repetición.

Los controles rápidos aprobados del backend se reutilizan: la corrección posterior afecta exclusivamente a la preparación de una suite MariaDB, comprobada de nuevo con tipos y la integración completa. En frontend, el agrupador inicial aprobó tipos y lint y se detuvo en formato; después de los tres cambios exclusivos de Prettier se ejecutaron formato global, suite completa y build. Se reutilizan tipos, lint y seguridad porque no cambiaron comportamiento, dependencias ni perfiles. No se presenta el primer agrupador fallido como una ejecución íntegra exitosa.

Última integración completa: `runId=78195ffc42d83c6752cac1ca`, inicio `2026-10-17T16:36:15.198Z`, fin `2026-10-17T16:41:15.344Z`, `status=passed`, `cleanup=removed`, 141 tablas sintéticas/restauradas desde el snapshot versionado.

## Evidencia

- Backend: [registros y manifiestos](../registros/pruebas/pre-pr-20261017T142752Z/), incluidos `integration-initial/`, `detraccion-focused/`, `test-ci-backend-summary.json`, `integration-final-result.json`, `last-run.json` y `junit.xml`. El resumen final del agrupador corresponde a alcance integración; el resumen anterior conserva los controles de calidad aprobados.
- Frontend: `D:/10_Workspace_react/ft-app-frontend-mantis/docs/registros/pruebas/pre-pr-20261017T142752Z/`, con `summary.json`, `remaining-quality-result.json`, logs por control, auditoría y manifiestos.

## Límites del cierre

La ejecución local fue en Windows; GitHub utiliza Ubuntu 24.04 y puede evaluar el resultado de combinar el PR con una base más reciente. No se actualizaron referencias remotas ni se ejecutaron checks de GitHub. Backend Dependency review sigue siendo un control remoto independiente. Los resultados frontend con transporte simulado no sustituyen navegación E2E; la integración backend sí usa MariaDB real. No se crearon commits, PR ni fusiones durante esta validación.

El informe y la actualización de la guía son documentación posterior a la comprobación de huellas, sin cambios ejecutables posteriores.
