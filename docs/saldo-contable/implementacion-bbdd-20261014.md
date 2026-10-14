# Creación de tablas SBS en desarrollo — 14/10/2026

Alcance autorizado por el usuario: crear las cuatro tablas aprobadas directamente en la base de `.env.development`, con relaciones, comentarios y catálogos iniciales; después ejecutar `npm run prisma-sync`. No se implementaron servicios ni interfaz en este bloque.

## Resultado

- Creadas `sbs_saldo_contable_periodo_estado` (12 columnas), `sbs_saldo_contable_operacion_tipo` (13), `sbs_saldo_contable_periodo` (18) y `sbs_saldo_contable_detalle` (23).
- Verificados 66 comentarios de columna y cuatro comentarios de tabla contra el SQL aprobado, ocho FKs restrictivas, índices y restricciones únicas.
- Catálogos: En elaboración/Cerrado; Descuento habilitado y Factoring deshabilitado, ambos lógicamente activos.
- Estructuras anteriores conservadas: cotejo de huellas de SHOW CREATE TABLE antes/después, sin cambios fuera de las cuatro altas. No se consultaron filas de clientes para esta comprobación.
- `prisma-sync` completado contra el mismo destino de desarrollo. Se añadieron cuatro modelos y cinco relaciones inversas a fuentes existentes; comparación normalizada de modelos anteriores sin otros cambios semánticos.
- Script reutilizable [documentado](../../scripts/database/README.md), disponible mediante `npm run db:ddl`; revisión por defecto y aplicación explícita vinculada a huellas de plan/destino.

## Evidencia

- [Informe de aplicación y metadatos verificados](../registros/bbdd/2026-10-14T16-06-23-036Z-ddl.json).
- [Registro sanitizado de prisma-sync](../registros/bbdd/2026-10-14T16-06-23-036Z-prisma-sync.log).
- [Manifiesto aplicado](../../scripts/database/plans/20261014-sbs-saldo-contable.json) y [SQL aprobado](esquema-propuesto.sql). Se conserva el encabezado histórico del SQL para no cambiar la huella del artefacto aplicado; su estado actual se registra aquí.
- Node portable 24.21.0 verificado. Prueba focalizada `databaseMaintenance.test.ts`: 11 aprobadas. Comprobación de tipos del backend (`tsc --noEmit`) y de Vitest (`test:vitest:typecheck`): aprobadas.
- El primer intento de prueba y la primera revisión en aislamiento Windows fallaron con EPERM. Las mismas operaciones fuera de ese aislamiento terminaron correctamente; el intento fallido de revisión no aplicó cambios.

## Límites y decisiones para la siguiente fase

La inmutabilidad al cerrar, reglas de elegibilidad, pertenencia de propuesta aceptada/liquidación vigente y transacciones se implementarán en servicios; las FKs solas no las garantizan. No se insertaron períodos ni asociaciones. No se ejecutó empaquetado de producción, suite de negocio completa ni pruebas de integración funcional del módulo todavía inexistente.

MariaDB representa JSON como LONGTEXT validado; la introspección existente genera `clasificacion_instrumentos String? @db.LongText`. En el adaptador habrá que serializar/deserializar JSON y validar su estructura, sin cambiar manualmente el modelo Prisma a Json. Los comentarios detallados se verificaron en MariaDB; Prisma genera avisos generales de comentarios, no copia cada texto al schema. El diccionario detallado permanece en el documento del esquema.

**Siguiente paso del plan:** implementar las políticas puras de fechas, elegibilidad y cálculo con monto_neto de propuesta aceptada y tipo contable SBS; después conectar DAOs y servicios con cierre transaccional. Cualquier nuevo cambio de estructura requiere autorización expresa adicional.
