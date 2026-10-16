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

## Acceso y mantenimiento de la base de datos

- Se permite acceso de solo lectura a desarrollo cuando sea pertinente a la tarea. Leer explícitamente `.env.development`; no usar una URL heredada ni mostrar credenciales o filas de clientes en logs/contexto.
- Cualquier escritura directa, modificación de datos o cambio de estructura en desarrollo requiere confirmación expresa del usuario para ese alcance concreto. La autorización de una tarea anterior no es un permiso permanente. No ejecutar DDL, semillas, correcciones, `db push` o migraciones por iniciativa propia.
- Para DDL autorizado usar `npm.cmd run db:ddl -- --plan <manifiesto>`: primero revisión sin cambios; aplicar únicamente con `--apply`, huellas de plan/destino y referencia de la autorización. Consultar [la guía del script](scripts/database/README.md). No sustituir la aprobación humana por argumentos del script.
- Flujo obligatorio: crear/modificar tablas, campos y relaciones directamente en la base autorizada; verificar el resultado; después ejecutar `npm.cmd run prisma-sync` contra ese mismo destino para actualizar schema y cliente. No editar manualmente el schema como sustituto ni usar Prisma Migrate como flujo alternativo.
- Las escrituras propias del módulo mediante sus endpoints forman parte del uso autorizado de la aplicación; esto no habilita mantenimiento directo de la base. Las pruebas usan datos sintéticos en MariaDB desechable y nunca escriben en desarrollo o producción.

## Validación

- Usar la skill [backend-validation](.agents/skills/backend-validation/SKILL.md) para seleccionar y ejecutar comprobaciones del backend.
- Antes de validar, identificar fase (desarrollo o cierre), comportamiento, consumidores afectados y riesgo. Durante el desarrollo, seleccionar pruebas concretas del cambio; ampliar primero a consumidores por riesgo financiero, seguridad, persistencia o runtime y justificar cada ampliación. Aplicar la [selección por fase y riesgo](tests/vitest/README.md#selección-por-fase-y-riesgo).
- No ejecutar pruebas de aplicación por cambios exclusivamente documentales. Para texto o presentación local, revisar el resultado y las pruebas afectadas si el texto es un contrato observable; no lanzar la suite completa por rutina ni crear pruebas que solo repitan la implementación.
- Al cerrar una nueva funcionalidad, un cambio transversal o una migración, comprobar la suite completa de cada proyecto afectado, más integración/runtime pertinentes. Antes del cierre, una completa requiere justificar el impacto transversal o la incertidumbre que resolverá. Respetar siempre los límites de ejecución del usuario; si impiden validar, declarar el cierre pendiente.
- `npm test` y `npm run test:vitest` sin filtros ejecutan toda la selección rápida de Vitest, incluidas las suites migradas: no son pruebas focalizadas ni incluyen MariaDB. `test:all` tampoco incluye toda la integración. Vitest no sustituye la comprobación de tipos; cobertura, agregadores de calidad y builds no son comprobaciones rutinarias de cada edición.
- No repetir comprobaciones aprobadas sin cambios relevantes, fallos o dudas nuevas. Registrar revisión, diff pendiente, selección y entorno comprobados; reutilizar evidencia de CI solo cuando corresponda a esa versión y alcance, indicando diferencias de plataforma. No declarar cierre completo con pruebas pendientes.
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


