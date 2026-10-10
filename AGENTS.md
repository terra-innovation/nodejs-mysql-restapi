# Guía para trabajar en ft-app-backend

## Alcance y mapa

- Backend Node.js/TypeScript ESM, Express y Prisma sobre MariaDB. Usar npm y conservar `package-lock.json`.
- En este Windows, ejecutar comandos, pruebas y herramientas del backend con Node 24.21.0 portable de `D:\Herramientas\node-v24.21.0-win-x64`. Anteponer esa carpeta al `Path` de cada sesión de comandos y verificar `node --version` y `node -p "process.execPath"` antes de validar. Usar `npm.cmd` y `npx.cmd` en PowerShell. No asumir que las herramientas del agente heredan la configuración de terminal de VS Code; no recurrir silenciosamente a Node 20 si falta el portable.
- Mantener el alcance solicitado; trabajar en frontend solo cuando la tarea lo incluya.
- Flujo: `src/routes` → `src/controllers` → `src/services` → `src/daos`. Cálculos extraídos en `src/domain/factoring`; utilidades compartidas en `src/utils`.
- Consultar [arquitectura](src/README.md) solo para las capas o roles afectados. Conservar imports ESM con `.js` y aliases `#src/` y `#root/`.

## Contexto y cambios

- Buscar primero rutas y símbolos con `rg`; leer funciones y secciones pertinentes antes de archivos completos.
- Delimitar búsquedas a código, pruebas y documentación. Omitir normalmente `node_modules`, `generated`, `dist`, `coverage`, logs, temporales y backups; consultarlos solo cuando sean objeto de la tarea.
- Leer del esquema Prisma solo los modelos y relaciones necesarios. Modificar fuentes, no el cliente generado.
- Conservar contratos HTTP, permisos, IDs, validaciones y transacciones salvo cambios solicitados.
- En Factoring, preservar fórmulas, redondeos y semántica UTC/Lima. Una deuda documentada no es una regla aprobada: ver [criterios pendientes](docs/deuda-tecnica/20261006_1451_DT_validaciones_financieras_factoring.md).
- En migraciones, comparar la misma selección de pruebas antes/después; no debilitar expectativas para obtener resultados aprobados.
- No mostrar secretos de `.env`, credenciales o datos de clientes en contexto, logs o reportes.

## Validación

- Usar la skill [backend-validation](.agents/skills/backend-validation/SKILL.md) para seleccionar y ejecutar comprobaciones del backend.
- `npm test` y `npm run test:vitest` ejecutan la misma selección rápida de Vitest, incluidas las suites migradas. Vitest no sustituye la comprobación de tipos.
- Preferir pruebas afectadas; ampliar según el riesgo de negocio, seguridad, persistencia o runtime. Consultar [Vitest](tests/vitest/README.md), [matriz de negocio](tests/vitest/MATRIZ_NEGOCIO.md) o [MariaDB](tests/mariadb/README.md) según corresponda.
- Ejecutar integración mediante el runner existente de MariaDB desechable. No regenerar snapshots ni acceder a bases compartidas como preparación rutinaria.
- `npm run build-prod` empaqueta producción: ejecutarlo solo con autorización explícita para esa operación.
- Reportar alcance, resultado, fallos y límites de lo verificado. Distinguir resultados actuales de evidencia histórica y pruebas con mocks de integración real.

## Entrega

- Responder en español, con cambios, validación y cierre de próximos pasos. Mantener la salida breve y enlazar informes completos cuando sean necesarios.
- **Cierre y próximos pasos obligatorios**:
  - Si hay un **plan de implementación activo o en curso**: usar estrictamente el término **Siguiente paso del plan** e indicar la acción inmediata y concreta a ejecutar.
  - Si **no** hay un plan en curso (consultas, análisis completados, tareas puntuales o abiertas): sugerir dos o más alternativas bajo el título **Opciones para continuar**.
  - **Formato fonético antiambigüedad y apto para dictado por voz**: cada opción para continuar debe identificarse con una palabra fonética seguida de un número secuencial del turno actual (ej. `[Opción Alfa 1]`, `[Opción Bravo 1]`; en la siguiente respuesta `[Opción Alfa 2]`, `[Opción Bravo 2]`). Esto evita confusiones con opciones de mensajes anteriores en el hilo y facilita el dictado por voz.
- Documentar decisiones o limitaciones nuevas en `docs/`; usar `docs/deuda-tecnica/` para deuda relevante. Evitar duplicar guías o guardar conteos que pronto queden desactualizados.


