# DT-CI-02: remediación de dependencias reportadas por auditoría

Estado: abierta. Detectada el 10 de octubre de 2026 al implementar el punto 11 de CI. Prioridad: revisar primero los hallazgos altos y su exposición en runtime.

## Evidencia y alcance

`npm audit --package-lock-only --ignore-scripts --include=dev --audit-level=high --json` respondió con código 1 y hallazgos altos sobre el lockfile actual. Se utilizó Node 24.21.0 portable y npm del entorno declarado. El hash del lockfile se conservó. No se ejecutaron pruebas ni instalaciones ni correcciones. Reporte local: `coverage/ci-live/audit-step11.json`, ignorado por Git; los resultados cambian con los avisos del registro.

Entre los paquetes señalados hay `mariadb` en dependencias directas de runtime, `prisma` y `ts-prune` en herramientas de desarrollo, además de dependencias transitivas. npm informa también afectación propagada a paquetes padre: no interpretar cada entrada como una vulnerabilidad independiente ni como una explotación comprobada.

El reporte no ofrece una corrección automática para algunos paquetes y propone retrocesos mayores para otros, por ejemplo Prisma y Jest/ts-jest. Esa propuesta no constituye una migración aprobada ni una garantía de compatibilidad. No se aplicaron downgrades, overrides, excepciones ni cambios de umbral.

## Trabajo pendiente

1. Refrescar el reporte y consultar cada advisory primario, con versiones afectadas, condiciones de explotación y ruta de dependencia. Separar runtime, herramientas y dependencias que solo aparecen en compilación/pruebas.
2. Priorizar MariaDB y transitivas usadas en runtime; comprobar las versiones corregidas disponibles y compatibilidad con el adaptador Prisma. Para paquetes de desarrollo, valorar actualización, sustitución o retirada de herramientas sin uso.
3. Preparar remediaciones acotadas conservando versiones coordinadas de Prisma, Vitest y TypeScript. Comparar las mismas pruebas y checks antes/después; no debilitar expectativas ni regenerar esquemas desde bases compartidas.
4. Validar cada PR y volver a auditar. Si persiste un aviso sin corrección compatible, documentar exposición, mitigación, responsable y fecha de revisión antes de decidir una excepción explícita.

Criterio de cierre: hallazgos altos/críticos resueltos o decisiones explícitas de tratamiento documentadas, con validación proporcional y reporte actualizado. Mantener visible cualquier riesgo aceptado; no presentar aceptación como ausencia de vulnerabilidad.

La [auditoría periódica](../ci/mantenimiento-y-seguridad.md) permanece configurada para fallar ante severidad alta/crítica. Esta deuda no autoriza desactivarla ni alterar reglas financieras.
