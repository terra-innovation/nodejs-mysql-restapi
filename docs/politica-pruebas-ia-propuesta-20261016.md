# Propuesta de política de pruebas para IA: backend y frontend

Fecha: 2026-10-16. Estado: opción Alfa 1 aplicada por autorización del usuario. Se actualizaron instrucciones y documentación; no se ejecutaron pruebas ni builds ni se modificaron scripts o pipelines.

## Reglas vigentes y alcance aplicado

Este documento conserva el diagnóstico y la propuesta originales como antecedente. Las reglas operativas están en AGENTS.md y las skills existentes de cada repositorio; las matrices mantenidas están en [Vitest backend](../tests/vitest/README.md#selección-por-fase-y-riesgo) y [selección frontend](../../../10_Workspace_react/ft-app-frontend-mantis/docs/pruebas/SELECCION_PRUEBAS_FRONTEND.md).

Se aplicaron selección por fase y riesgo, cierre completo de funcionalidades, justificación de ampliaciones, reutilización de evidencia y corrección de ejemplos frontend a `.ts/.tsx`. Se conserva la solicitud explícita para ejecutar pruebas del frontend; se armonizó la skill con esa excepción de AGENTS.md. No se implementaron lanzadores nuevos ni cambios de CI. La validación de esta edición es documental: coherencia, destinos de enlaces, existencia de archivos y scripts, y revisión del diff. La eficacia en una tarea real y el ahorro medido quedan por observar.

El validador `quick_validate.py` de skill-creator no pudo iniciarse porque el Python disponible no incluye PyYAML. No se instalaron dependencias: se revisaron directamente los frontmatter simples (delimitadores, nombre, descripción y ausencia de campos adicionales), además de los enlaces y ejemplos. Esta comprobación documental no valida el comportamiento futuro del modelo.

## Objetivo

Durante el desarrollo, comprobar el comportamiento modificado y sus consumidores afectados. Reservar la suite completa para cerrar una funcionalidad, una regresión transversal o el control de integración en CI. Evitar ejecuciones completas por cambios menores y repeticiones que no aportan evidencia nueva.

## Revisión actual

Se inspeccionaron AGENTS.md, skills de validación, package.json, configuración Vitest, lanzadores y workflows de ambos repositorios. No se ejecutaron pruebas, builds, servidores ni operaciones de base de datos. Los workflows se revisaron como configuración local; no se comprobó su resultado remoto. No se midieron tiempos ni ahorro.

### Backend

- AGENTS.md y `.agents/skills/backend-validation/SKILL.md` ya priorizan pruebas afectadas y ampliación por riesgo.
- `npm test` y `test:vitest`, sin filtro, ejecutan toda la selección rápida configurada, incluidas las suites migradas. “Rápida” distingue esta selección de la integración real; no significa focalizada en el cambio.
- `test:vitest:ci` añade cobertura, umbrales y reportes a esa selección. `test:all` comprueba tipos de Vitest y ejecuta la selección rápida: no incluye toda la integración MariaDB ni todos los tipos del proyecto.
- MariaDB tiene runner separado y admite selección de suites. Runtime usa compilación aislada y base desechable.
- El workflow de calidad configura selección completa con cobertura, otras comprobaciones y un job posterior de integración. No contiene filtros por rutas para evitar ejecuciones de calidad por cambios exclusivamente documentales.

### Frontend

- AGENTS.md, `.agents/skills/frontend-validation/SKILL.md` y `docs/pruebas/SELECCION_PRUEBAS_FRONTEND.md` ya distinguen pruebas enfocadas, rápidas y completas.
- `test:fast` selecciona cinco archivos explícitos; no demuestra cobertura del cambio si este está fuera de esa selección.
- `test`, `test:vitest` y `test:ci`, sin filtros, ejecutan toda la selección configurada. Los lanzadores admiten filtros de archivos.
- Existen grupos por comportamiento, como sesión, Factoring, listas y PDF, que pueden reutilizarse cuando coincidan con el impacto real.
- La skill conserva ejemplos `.js` que deben actualizarse a los archivos `.ts/.tsx` actuales para evitar comandos que no encuentren las pruebas.
- La ejecución por el modelo exige solicitud explícita según AGENTS.md. Esta propuesta conserva esa restricción.
- El workflow de calidad ejecuta `ci:quality`, que incluye `test:ci` completo. El evento pull_request no está limitado a un hito de cierre; por tanto, las actualizaciones del PR pueden activar validación completa durante el desarrollo.

## Matriz propuesta

| Cambio | Durante el desarrollo | Cierre |
| --- | --- | --- |
| Documentación sin efecto ejecutable | Revisar diff y enlaces; sin pruebas de aplicación | Revisión documental |
| Texto visible, etiqueta o estilo local | Revisar presentación; prueba de componente existente si comprueba el texto, accesibilidad o interacción afectada | Comprobación focalizada; sin full local por rutina |
| Función, validación, componente o endpoint local | Suite del comportamiento, casos límite y regresión del defecto si aplica | Regresión del módulo; si forma parte de una nueva funcionalidad, full al cerrar esa funcionalidad |
| Dinero, fechas, permisos, sesión o caché | Suites del cambio y consumidores afectados; integración focalizada cuando la propiedad dependa de persistencia real | Full al cierre y controles reales pertinentes |
| SQL, transacciones o concurrencia | Integración focalizada con MariaDB desechable, además de pruebas de lógica pertinentes | Regresión de persistencia y full correspondiente al cierre |
| Dependencias, aliases, configuración global, setup o runner | Comprobación inicial focalizada que detecte incompatibilidades; ampliar al estabilizar el bloque | Full de los proyectos afectados; comparar selección antes/después en migraciones |
| Nueva funcionalidad terminada | Iterar con pruebas focalizadas hasta estabilizar comportamiento | Una ejecución completa sobre la versión final de cada proyecto afectado, más integración/runtime/navegador cuando sean necesarios |

Un texto puede ser un contrato observable: por ejemplo, un mensaje de validación o un nombre accesible. Clasificar por efecto real, no solo por tamaño del diff. Un cambio de frontend no obliga a ejecutar todo el backend si su implementación y contrato no fueron afectados, y viceversa.

“Full” siempre debe nombrar su alcance: selección Vitest, integración MariaDB o controles de calidad. Ninguno de esos nombres implica automáticamente E2E, navegador real o empaquetado de producción.

## Texto normativo propuesto para AGENTS.md

1. Antes de comprobar un cambio, identificar la fase (desarrollo o cierre), comportamiento afectado, consumidores, riesgo y archivos concretos de prueba. Elegir la selección mínima suficiente y explicar brevemente qué protege.
2. Durante el desarrollo, usar pruebas focalizadas. No ejecutar por rutina comandos sin filtro que lancen la suite completa, agregadores de calidad, cobertura global ni builds.
3. No ejecutar pruebas de aplicación por cambios exclusivamente documentales. Para texto o estilos locales, usar revisión y comprobaciones focalizadas pertinentes; no crear pruebas que solo repitan detalles de implementación para justificar la tarea.
4. Ampliar primero a consumidores y flujos afectados cuando haya riesgo financiero, de seguridad, persistencia o infraestructura compartida. Si se necesita una full antes del cierre, justificar el impacto transversal o la incertidumbre concreta que resolverá.
5. Si no existen pruebas relevantes, declarar el hueco. Añadir regresión útil cuando el comportamiento y riesgo lo requieran; una suite ajena aprobada no valida el cambio.
6. Al cerrar una nueva funcionalidad o un cambio transversal, ejecutar o proponer, según autorización vigente, la suite completa de cada proyecto afectado sobre su versión final. No considerar full una selección filtrada o test:fast.
7. Una full aprobada sigue aportando evidencia mientras no cambien fuentes ejecutables, pruebas, dependencias, configuración o entorno relevantes. Repetir solo ante cambios que invaliden esa evidencia, un fallo o una duda nueva. Registrar la revisión y el diff pendiente que fueron comprobados.
8. Respetar restricciones del usuario y autorizaciones específicas de cada repositorio. En frontend, sin solicitud explícita, entregar comandos manuales y marcar ejecución pendiente. Una validación pendiente no permite declarar cierre verificado.
9. No cambiar expectativas, eliminar casos, aumentar timeouts sin diagnóstico, actualizar snapshots automáticamente ni aceptar ausencia de pruebas para obtener éxito. No sustituir persistencia real por mocks cuando la propiedad bajo prueba dependa de la base.
10. Reportar fase, selección, motivo, resultado, código de salida y límites en pocas líneas. Guardar logs extensos solo cuando aporten diagnóstico, sin secretos. No repetir pruebas aprobadas como ritual de cada respuesta.

## Aplicación sin duplicar guías

1. Añadir el resumen normativo en AGENTS.md de ambos repositorios, adaptando permisos y referencias locales.
2. Ajustar las skills existentes de validación; no crear una tercera skill equivalente. Mantener allí comandos y decisiones técnicas.
3. Actualizar la guía de selección del frontend y sus ejemplos obsoletos; en backend, incorporar la matriz en la documentación existente de Vitest o enlazar una guía específica si resulta necesaria.
4. Verificar estáticamente que los scripts propuestos existen, los archivos seleccionados corresponden a las pruebas actuales y los filtros llegan al runner. La edición documental no requiere ejecutar la aplicación.
5. Probar la aplicación de la política en la siguiente tarea real: una selección focalizada durante el desarrollo y cierre completo cuando corresponda. Medir tiempo real si se desea cuantificar el ahorro.

No cambiar el significado de `npm test` ni reducir las suites de CI como parte de la primera etapa. La mejora inicial es escoger y ordenar correctamente las comprobaciones existentes.

## Opciones adicionales de eficiencia

- Introducir posteriormente un lanzador focalizado que rechace ausencia de filtros, para prevenir full accidentales. Necesita diseño y validación propios; no está implementado.
- Mantener un mapa pequeño de módulos críticos y consumidores en las matrices existentes. No inventariar todos los casos ni duplicar listas que puedan quedar obsoletas.
- Usar selección automática como ayuda, con revisión humana o del modelo de consumidores. Vitest documenta que `related` depende de imports estáticos y no resuelve imports construidos dinámicamente: https://vitest.dev/guide/cli.html#vitest-related.
- Optimizar CI por separado: primero exclusión segura de cambios puramente documentales, conservando checks requeridos; después valorar full en hitos de PR listo para revisión y antes de integrar. Requiere revisar eventos, protecciones de ramas y ejecución sobre la revisión final. No basta con modificar las instrucciones de IA para cambiar cuándo GitHub ejecuta pruebas.
- Evitar repetir localmente una full ya aprobada en CI para la misma revisión, alcance y entorno pertinentes, salvo que exista una diferencia que justifique otra ejecución. La evidencia Linux no demuestra comportamiento Windows ni viceversa.

## Criterio de aceptación

La política queda implementada cuando ambos AGENTS.md y sus skills coincidan en fase, selección y cierre; no haya comandos de ejemplo obsoletos; un cambio de texto no provoque full local; y una funcionalidad nueva no se declare verificada sin su cierre completo y controles de riesgo pertinentes. Las autorizaciones de ejecución y los controles financieros, de base de datos y producción se conservan.
