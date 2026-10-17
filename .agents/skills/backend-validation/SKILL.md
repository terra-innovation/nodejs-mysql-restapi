---
name: backend-validation
description: Seleccionar y ejecutar comprobaciones de ft-app-backend, diagnosticar fallos y resumir evidencia. Usar al validar cambios, regresiones o migraciones del backend; no para validación exclusiva del frontend ni despliegues.
---

# Validación del backend

Elegir comprobaciones proporcionales al cambio y entregar evidencia breve, conservando el diagnóstico completo cuando sea necesario. Ejecutar desde la raíz del backend y reutilizar sus comandos y guías.

## Seleccionar el alcance

1. Revisar la petición, `git status --short` y el diff pertinente. Identificar fase (desarrollo o cierre), comportamiento, consumidores y riesgo. Si se pide solo analizar o preparar un plan, recomendar las comprobaciones sin ejecutarlas.
2. Confirmar comandos en `package.json` y localizar pruebas por archivo, símbolo o comportamiento; no cargar todas las guías. Usar las referencias de abajo solo para el nivel elegido.
3. Durante el desarrollo, elegir suites concretas del cambio y tipos pertinentes; ampliar primero a consumidores por riesgo financiero, seguridad, persistencia o runtime, explicando qué protege cada ampliación. Aplicar la [matriz por fase y riesgo](../../../tests/vitest/README.md#selección-por-fase-y-riesgo). No lanzar suites completas, cobertura, agregadores de calidad ni builds por rutina en cada edición.
4. Para migraciones, conservar la selección y expectativas de la línea base. No mezclar la migración con cambios de reglas financieras o deudas pendientes.
5. Documentación sin efecto ejecutable: revisar contenido y enlaces, sin pruebas de aplicación. Texto local: revisar resultado y pruebas afectadas si el texto es contrato observable, sin full por rutina. Si no existe prueba pertinente, declarar el hueco y añadir regresión útil cuando el comportamiento y riesgo lo requieran; no crear pruebas que solo repitan la implementación.

## Cierre y reutilización de evidencia

- Al cerrar una nueva funcionalidad, un cambio transversal o una migración, comprobar la selección completa de cada proyecto afectado y la integración/runtime pertinentes. Antes del cierre, justificar una completa por impacto transversal o por una incertidumbre concreta que no resuelva la selección focalizada. Respetar límites del usuario y autorizaciones específicas de cada proyecto; declarar el cierre pendiente cuando falte evidencia.
- No repetir comprobaciones aprobadas sin cambios relevantes, fallos o dudas nuevas. Registrar revisión, diff pendiente, selección y entorno; una full anterior no valida cambios ejecutables posteriores. Reutilizar evidencia de CI solo para esa misma versión y alcance pertinentes, indicando diferencias de plataforma. No repetir por cambios exclusivamente documentales sin efecto ejecutable.

## Comandos disponibles

Los ejemplos usan archivos reales. En Windows, anteponer al Path `D:\Herramientas\node-v24.21.0-win-x64`, verificar `node --version` y `node -p "process.execPath"`, y usar `npm.cmd`/`npx.cmd` en los comandos siguientes. Sustituir el archivo por la suite afectada; combinar `-t` con el archivo cuando solo se necesite un caso. No usar opciones que conviertan ausencia de pruebas en éxito.

| Necesidad | Comando desde la raíz |
| --- | --- |
| Tipos del backend | `npx --no-install tsc --noEmit` |
| Tipos de Vitest | `npm run test:vitest:typecheck` |
| Vitest focalizado | `npm run test:vitest -- tests/vitest/unit/dateUtils.test.ts` |
| Vitest migrado focalizado | `npm test -- tests/vitest/migrated/unit/utils/dateUtils.test.ts` |
| Vitest completo al cierre, sin cobertura | `npm run test:vitest` |
| Vitest completo con cobertura y umbrales, si corresponde al cierre/CI | `npm run test:vitest:ci` |
| Tipos de integración | `npm run test:integration:typecheck` |
| Requisitos de MariaDB desechable | `npm run test:integration:doctor` |
| Integración focalizada | `npm run test:integration -- tests/mariadb/environment.test.ts` |
| Proceso compilado y conexión real | `npm run test:runtime` |

- Los scripts de pruebas establecen `TZ=UTC` y `NODE_ENV=test`. En automatización, establecer `CI=true` temporalmente para rechazar `.only` en Vitest; restaurar el valor previo al terminar. Evitar modos watch.
- `npm test` y `npm run test:vitest` sin filtros ejecutan toda la selección rápida de Vitest: no son focalizados ni incluyen MariaDB. `test:all` añade tipos de Vitest, pero no toda la integración ni todos los tipos del proyecto. Nombrar el alcance de una full; no implica navegador/E2E. Vitest transforma TypeScript sin comprobar tipos; conservar la comprobación independiente de tipos. Jest y sus soportes exclusivos fueron retirados.
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

Indicar brevemente fase, selección, motivo, resultado, código de salida y fallos relevantes; enlazar reportes locales cuando aporten evidencia. Separar aprobado, fallido, pendiente y no ejecutado. Explicar límites (mocks, MariaDB, plataforma o ausencia de navegador) y cerrar con el siguiente paso pertinente. No afirmar ahorro de tokens medido ni validación de toda la aplicación por una selección parcial.
