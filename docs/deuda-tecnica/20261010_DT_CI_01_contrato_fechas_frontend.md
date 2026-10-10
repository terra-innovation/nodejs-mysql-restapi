# DT-CI-01: sincronización de la referencia de fechas del frontend

- Estado: abierta, aceptada temporalmente por el usuario el 10 de octubre de 2026.
- Prioridad: media; revisar antes de modificar los helpers de fechas o sus contratos UTC/Lima.
- Alcance: CI del backend y compatibilidad del contrato de fechas con el frontend.

## Problema y solución temporal

Las suites `tests/unit/services/factoring.dateTrace.test.ts` y `tests/unit/services/admin/factoringliquidacion.audit.test.ts` invocan `scripts/analisis/fecha-liquidacion-frontend.cjs`. Este ayudante lee el helper real del frontend, cuya ruta local predeterminada es `D:/10_Workspace_react/ft-app-frontend-mantis`. Un checkout limpio del backend en GitHub Actions no contiene ese repositorio.

Se conserva una copia exacta en `tests/fixtures/frontend-date-contract/src/utils/dateUtils.js`, con procedencia en `provenance.json`. CI define `LIQUIDACION_FRONTEND_ROOT` a esa carpeta y verifica su hash y tamaño antes de Jest. Se mantienen las suites, el ayudante, las aserciones y las fórmulas; no se descargan repositorios privados ni se requieren secretos adicionales. Localmente el ayudante conserva su comportamiento previo con el frontend real.

## Riesgo pendiente

El backend puede aprobar las pruebas contra una referencia desactualizada si cambia el frontend. El checksum detecta alteraciones de la copia respecto de su manifiesto, pero no detecta divergencias con el repositorio de origen ni constituye una firma de autenticidad. No se debe interpretar CI del backend como validación del frontend actual, de una navegación completa o de persistencia real.

## Revisión futura y criterios de cierre

1. Definir quién mantiene este contrato y qué cambios de frontend requieren revisar la referencia.
2. Evaluar una librería compartida versionada, pruebas coordinadas entre repositorios o un mecanismo explícito que detecte divergencias. Elegir considerando coste y permisos de acceso.
3. Mientras exista la copia, registrar cada actualización con revisión de origen y hash nuevos, comparar las diferencias y validar las mismas expectativas en ambos lados.
4. Cerrar la deuda cuando exista un mecanismo reproducible que detecte incompatibilidades entre versiones reales del frontend y backend, sin depender de carpetas locales ni de actualizaciones manuales silenciosas.

No actualizar fórmulas, snapshots o expectativas únicamente para aprobar el pipeline. Esta implementación se comprobó estáticamente y por integridad de archivos, sin ejecutar pruebas por la restricción vigente; la ejecución remota sigue pendiente.
