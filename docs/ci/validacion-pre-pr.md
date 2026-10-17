# Validación previa al pull request

Referencia vigente: `.github/workflows/backend-quality.yml`, `.github/workflows/backend-security.yml` y los scripts de package.json. El agrupador local reproduce los controles de calidad e integración; no instala dependencias, no publica y no modifica los workflows. Las pruebas del agrupador contrastan sus comandos con los del workflow para detectar divergencias.

## Comando completo del backend

Desde la raíz de un checkout aislado que contenga todos los archivos que se van a integrar:

```powershell
$env:Path = 'D:\Herramientas\node-v24.21.0-win-x64;' + $env:Path
node --version
node -p "process.execPath"
npm.cmd --version
npm.cmd run ci:check -- --base origin/master
```

Usar Node y npm exactos de `.node-version` y `packageManager`. El agrupador los verifica. `--base` debe identificar la base del PR disponible en Git, actualizada y con historia suficiente para resolver el ancestro común. Para repetir exactamente una revisión usar su SHA; `origin/master` es la referencia habitual de la rama destino del backend. También se admite `FORMAT_BASE` del workflow. No se asume HEAD^: en una rama con varios commits podría dejar cambios sin comprobar.

Revisar primero el plan, sin ejecutar controles ni crear informes:

```powershell
npm.cmd run ci:check -- --base origin/master --plan
```

Variantes para una fase concreta:

```powershell
npm.cmd run ci:quality -- --base origin/master
npm.cmd run ci:integration
```

Cada variante declara su alcance; aprobar solo calidad no equivale a aprobar el comando completo.

| Fase        | Controles existentes que ejecuta                                                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Calidad     | `prisma:generate:ci`, `typecheck:all`, `lint`, `format:changed -- --base <base>`, integridad del contrato de fechas, `test:vitest:ci` con cobertura, `build` con NODE_ENV=production |
| Integración | Cliente Prisma (si se ejecuta separadamente), `test:integration:doctor`, `test:integration` completo —incluye runtime compilado— y `verify-integration-report.mjs`                   |

Calidad conserva diagnósticos independientes: un fallo de tipos no oculta lint, formato o pruebas. Fallar la generación omite sus consumidores; fallar el contrato de fechas omite Vitest. Integración depende de calidad cuando se ejecuta todo. La verificación de evidencia se ejecuta tanto si el runner MariaDB aprueba como si falla, pero no si nunca se lanzó; comprueba la ejecución actual y la limpieza del contenedor propio. Fallos u omisiones devuelven salida distinta de cero, nunca aprobación parcial.

La compilación escribe `dist/` y la generación escribe el cliente local. La integración requiere Docker con contenedores Linux, crea MariaDB desechable y usa su limpieza existente. No invoca `build-prod`, `prisma-sync`, migraciones, DDL de mantenimiento ni exportación de desarrollo. Un comando de cierre no debe ejecutarse por rutina tras cada edición: necesita el alcance autorizado de pruebas/compilación/integración.

## Preparar una copia reproducible

No reinstalar dependencias sobre los servidores de desarrollo en ejecución. En un checkout nuevo, con las versiones exactas seleccionadas:

```powershell
$env:PRISMA_SKIP_POSTINSTALL_GENERATE = 'true'
npm.cmd ci --include=dev --no-audit --no-fund
Remove-Item Env:PRISMA_SKIP_POSTINSTALL_GENERATE
```

Comprobar la salida de la instalación antes de continuar. El agrupador genera Prisma explícitamente después; no conecta a una base para esa generación. No copiar perfiles de entorno personales. Para calidad se inyecta `tests/fixtures/ci-quick.env`, con los valores públicos sintéticos que usa GitHub, y se fija la referencia local de fechas. Se elimina APP_ENV_FILE de los procesos hijos; no se leen sus valores ni se modifica el entorno padre. Si existe `.env.test` local, calidad se rechaza antes de ejecutar controles: usar la copia limpia, sin sobrescribir el perfil.

La copia debe contener también archivos nuevos y cambios sin confirmar que formen parte del pase. Un checkout de HEAD que omita esos archivos no valida el trabajo pendiente. Registrar la revisión y repetir sobre el resultado de combinar la rama con la base actual del PR cuando haya cambios concurrentes.

## Evidencia y límites

Cada control guarda su log en `docs/registros/pruebas/test-ci-backend-*.log`; la compilación usa `docs/registros/compilaciones/build-ci-backend.log`. El resumen `test-ci-backend-summary.json` registra revisión, cambios pendientes, base, plataforma, versiones, alcance y resultado de cada control. Los logs/resúmenes de la última ejecución reemplazan los anteriores: conservarlos por revisión cuando se necesite comparar. La integración conserva además los informes existentes en `coverage/mariadb/`.

GitHub ejecuta Ubuntu 24.04, con sus límites de tiempo, permisos y servicios. Windows puede reproducir los controles, pero no prueba Linux ni garantiza que el PR apruebe. Para igualar también la plataforma usar Ubuntu 24.04 en un entorno aislado, la misma revisión/resultado de mezcla, Node/npm, lockfile y fixtures. El agrupador local no impone los timeouts del job de GitHub ni reemplaza sus artefactos o revisiones de dependencias.

En PR, Backend security ejecuta **Dependency review**, que compara dependencias y bloquea vulnerabilidades altas según el workflow; no tiene un comando npm local idéntico. `npm audit` del backend corresponde al push/schedule, no a ese control del PR. No declarar aprobado CI remoto por un resultado local. Ninguno de estos comandos fusiona ramas ni despliega producción.

## Frontend

El frontend ya dispone de `ci:quality` (tipos, lint, formato global, suite completa y build aislado de CI). Seguridad es un job independiente: `security:profiles` y `security:audit`. Su preparación, comandos y límites están documentados en `ft-app-frontend-mantis/docs/implementaciones/VALIDACION_PRE_PR.md`.

## Validación del agrupador

Para revisar solamente la orquestación, sin lanzar las suites de aplicación, compilaciones ni Docker: `npm run test:vitest -- tests/vitest/unit/ciRunner.test.ts`. Usa ejecutores simulados y cubre dependencias, fallos/omisiones, verificación posterior a un runner fallido, entorno y correspondencia de comandos con el workflow. Esta selección no valida una ejecución real de `ci:check`.

Comprobación de implementación del 17/10/2026: prueba focalizada de orquestación y tipos de Vitest aprobados, sintaxis Node y formato aprobados; planes de las tres variantes y base `origin/master` aprobados. Registros en `docs/registros/pruebas/test-ci-runner-{unit,types,plan,quality-plan,integration-plan,pr-plan}-20261017.log`. Después se completaron los controles reales de ambos proyectos en copias aisladas, con correcciones de formato y preparación de una suite de integración. Ver [resultados, reutilización de evidencia y límites](validacion-pre-pr-20261017.md); el cierre local no acredita CI remoto.
