---
name: backend-validation
description: Seleccionar y ejecutar comprobaciones de ft-app-backend, diagnosticar fallos y resumir evidencia. Usar al validar cambios, regresiones o migraciones del backend; no para validación exclusiva del frontend ni despliegues.
---

# Validación del backend

Elegir comprobaciones proporcionales al cambio y entregar evidencia breve, conservando el diagnóstico completo cuando sea necesario. Ejecutar desde la raíz del backend y reutilizar sus comandos y guías.

## Seleccionar el alcance

1. Revisar la petición, `git status --short` y el diff pertinente. Si se pide solo analizar o preparar un plan, recomendar las comprobaciones sin ejecutarlas.
2. Confirmar comandos en `package.json` y localizar pruebas por archivo, símbolo o comportamiento; no cargar todas las guías. Usar las referencias de abajo solo para el nivel elegido.
3. Empezar por las pruebas afectadas y los tipos pertinentes. Ampliar ante dependencias compartidas, riesgo financiero, seguridad, persistencia o runtime. Evitar repetir comprobaciones aprobadas sin cambios o dudas nuevas.
4. Para migraciones, conservar la selección y expectativas de la línea base. No mezclar la migración con cambios de reglas financieras o deudas pendientes.

## Comandos disponibles

Los ejemplos usan archivos reales. Sustituir el archivo por la suite afectada; `-t` permite filtrar por nombre. No usar opciones que conviertan ausencia de pruebas en éxito.

| Necesidad | Comando desde la raíz |
| --- | --- |
| Tipos del backend | `npx --no-install tsc --noEmit` |
| Tipos de Vitest | `npm run test:vitest:typecheck` |
| Vitest focalizado | `npm run test:vitest -- tests/vitest/unit/dateUtils.test.ts` |
| Vitest migrado focalizado | `npm test -- tests/vitest/migrated/unit/utils/dateUtils.test.ts` |
| Vitest completo, si corresponde | `npm run test:vitest` |
| Tipos de integración | `npm run test:integration:typecheck` |
| Requisitos de MariaDB desechable | `npm run test:integration:doctor` |
| Integración focalizada | `npm run test:integration -- tests/mariadb/environment.test.ts` |
| Proceso compilado y conexión real | `npm run test:runtime` |

- Los scripts de pruebas establecen `TZ=UTC` y `NODE_ENV=test`. En automatización, establecer `CI=true` temporalmente para rechazar `.only` en Vitest; restaurar el valor previo al terminar. Evitar modos watch.
- `npm test` y `npm run test:vitest` ejecutan la misma selección rápida de Vitest. Vitest transforma TypeScript sin comprobar tipos; conservar la comprobación independiente de tipos. Jest y sus soportes exclusivos fueron retirados.
- La cobertura es una comprobación adicional cuando la tarea la requiere: `npm run test:vitest:coverage`. Los conteos de casos, incluidos los parametrizados, no representan cobertura.

## Elegir referencias según el riesgo

Las rutas siguientes son relativas a la raíz del repositorio; los enlaces se resuelven desde esta skill.

- Lógica, fechas, permisos o HTTP con infraestructura simulada: buscar primero en [tests/vitest/MATRIZ_NEGOCIO.md](../../../tests/vitest/MATRIZ_NEGOCIO.md) y consultar las secciones pertinentes de [tests/vitest/README.md](../../../tests/vitest/README.md). Las suites HTTP rápidas no prueban por sí solas el montaje global ni persistencia real.
- SQL, rollback, concurrencia o persistencia: consultar requisitos, filtros y limpieza de [tests/mariadb/README.md](../../../tests/mariadb/README.md). Ejecutar las suites adecuadas con el runner existente y Docker Linux; no sustituirlas por pruebas con DAO simulado.
- Arranque, compilación o dependencias de runtime: consultar [docs/deuda-tecnica/20261008_regresion_backend_compilado.md](../../../docs/deuda-tecnica/20261008_regresion_backend_compilado.md). `test:runtime` compila en salida aislada y usa MariaDB desechable; no certifica despliegue ni compatibilidad con plataformas no ejecutadas.
- Criterios financieros ambiguos: contrastar [docs/deuda-tecnica/20261006_1451_DT_validaciones_financieras_factoring.md](../../../docs/deuda-tecnica/20261006_1451_DT_validaciones_financieras_factoring.md) y [tests/vitest/pending/business-decisions.test.ts](../../../tests/vitest/pending/business-decisions.test.ts). Un `todo` no valida comportamiento. Confirmar si un fallo coincide con evidencia previa antes de clasificarlo como conocido.

## Ejecución y diagnóstico

- Leer código de salida y resumen del runner; ante un fallo, recuperar el detalle y localizar su causa antes de repetir o ampliar. No ocultar fallos mediante filtros de salida o tuberías que pierdan el código original.
- Para salidas extensas, conservar un log local y leer primero resumen y errores. Mostrar solo fragmentos pertinentes y redactar secretos. Un resultado truncado no prueba éxito.
- Ante dependencias ausentes, Docker indisponible o restricciones del entorno, explicar la limitación y continuar las comprobaciones independientes. No modificar sistema, permisos ni conexiones como reparación implícita.
- No ejecutar como preparación rutinaria `test:integration:schema`, `audit:factoring:historical`, `prisma-sync`, migraciones o `db push`: pueden consultar o modificar recursos fuera de las pruebas aisladas. Usarlos solo cuando la tarea incluya esa operación.
- En integración, verificar fecha, `runId`, estado y limpieza en `coverage/mariadb/last-run.json`; contrastar con la ejecución actual. El archivo puede conservar evidencia anterior. Si falla la limpieza, identificar el recurso propio y seguir las guardas del runner; no usar `docker prune`.
- No ejecutar `build-prod` sin autorización explícita para empaquetar producción. Evitar `npm run build` por rutina: limpia y escribe `dist`; para comprobar arranque compilado, preferir el procedimiento aislado documentado.

## Reportar

Indicar brevemente qué se comprobó, comandos o selección ejecutada, resultado y fallos relevantes; enlazar reportes locales cuando aporten evidencia. Separar aprobado, fallido, pendiente y no ejecutado. Explicar límites (mocks, MariaDB, plataforma o ausencia de navegador) y cerrar con el siguiente paso pertinente. No afirmar ahorro de tokens medido ni validación de toda la aplicación por una selección parcial.
