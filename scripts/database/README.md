# Mantenimiento DDL autorizado de desarrollo

Este script ejecuta SQL revisado directamente en MariaDB y después puede ejecutar el flujo existente `npm run prisma-sync`. Usa exclusivamente `PRISMA_DATABASE_FACTORING_URL` del archivo `.env.development`; no toma el destino de variables heredadas. No requiere MCP ni agrega dependencias.

## Procedimiento

1. Obtener autorización expresa del usuario para las tablas, campos y relaciones concretos. La autorización SBS del 14/10/2026 cubre únicamente las cuatro tablas de su manifiesto y sus catálogos iniciales. No autoriza cambios futuros.
2. Preparar SQL y manifiesto versionados dentro del repositorio. Revisar ambos antes de conectar. No guardar credenciales en esos archivos.
3. Usar Node portable 24.21.0 y revisar sin modificar:

```powershell
$env:Path = 'D:\Herramientas\node-v24.21.0-win-x64;' + $env:Path
node --version
node -p "process.execPath"
npm.cmd run db:ddl -- --plan scripts/database/plans/20261014-sbs-saldo-contable.json
```

4. Revisar el informe y copiar las huellas del plan y destino mostradas por esa ejecución. Si el usuario ya autorizó exactamente ese alcance, aplicar con ambas huellas y una referencia a su autorización:

```powershell
npm.cmd run db:ddl -- --plan scripts/database/plans/20261014-sbs-saldo-contable.json --apply --expected-plan <SHA256_PLAN> --expected-target <SHA256_DESTINO> --authorization <REFERENCIA_AUTORIZACION> --prisma-sync
```

Los marcadores deben reemplazarse; no son argumentos literales. Las huellas no sustituyen la autorización humana. El manifiesto SBS ya fue aplicado: una nueva ejecución abortará al encontrar sus tablas existentes.

5. Revisar informe, registro sanitizado de sincronización, diferencias del schema y comprobaciones de tipos pertinentes. No modificar manualmente el schema para simular una introspección ni editar el cliente generado.

## Manifiestos y límites

Consultar `plans/20261014-sbs-saldo-contable.json` como ejemplo. Campos: `formatVersion: 1`, `id`, `description`, `sqlFile` relativo al manifiesto, `createTables`, `alterTables`, `seedTables` y `seedChecks` opcional. Cada comprobación de semillas declara tabla, columnas y filas esperadas en orden de la primera columna. Los archivos deben permanecer dentro del repositorio.

El analizador admite `CREATE TABLE`, `ALTER TABLE` declarado y `INSERT ... VALUES` en tablas creadas en esa misma ejecución. No admite DROP TABLE, DML sobre datos existentes, procedimientos, comentarios ejecutables ni archivos con escapes dependientes de `sql_mode`. Es una herramienta para SQL confiable revisado, no un entorno para ejecutar SQL de terceros. Los ALTER requieren autorización específica y revisión de sus efectos y recuperación; nunca reutilizar el permiso SBS para ellos. La comprobación actual de referencias existentes está dirigida a PK `INT UNSIGNED`, como las de este esquema.

La revisión es el comportamiento predeterminado: sesión de solo lectura y sin DDL/DML. Aplicar requiere coincidencia de huellas, referencia de autorización, destino MariaDB escribible y bloqueo asesor por base. Se comprueban existencia previa y tipos de referencias antes del primer CREATE. No se reemplazan ni ignoran tablas existentes. El entorno y SQL se vuelven a leer para detectar cambios antes de aplicar.

En el plan SBS se verifican columnas/comentarios exactos, FKs restrictivas, índices y semillas. Las huellas de `SHOW CREATE TABLE` antes/después permiten detectar cambios en estructuras existentes, ignorando únicamente el contador AUTO_INCREMENT. Este cotejo detecta también cambios concurrentes; el bloqueo asesor coordina solo ejecuciones de esta herramienta. No es un respaldo ni impide DDL ejecutado por otros clientes.

## Registros y fallos

El ajuste del 16/10/2026 agrega `renameTables: [{ from, to }]` para `ALTER TABLE ... RENAME TO` exacto y `copyTables: [{ from, to }]` para una copia conservadora a una tabla creada en el mismo plan. El origen debe declararse en `alterTables`; solo se permite `INSERT (columnas) SELECT columnas FROM tabla`, sin expresiones, filtros ni JOIN. Se coteja el número de filas copiadas antes de continuar. `referenceRenames` declara los nombres previos de una PK para revisar su tipo antes del cambio. Los renombres se incluyen en la huella y en las tablas autorizadas para el cotejo final de estructura. Continúan rechazados UPDATE, DELETE y DROP TABLE. Estas extensiones no amplían la autorización humana a otras tablas ni convierten el script en un ejecutor de SQL libre.

Los informes JSON y registros Prisma quedan en `docs/registros/bbdd/`, sin credenciales ni filas de negocio. Incluyen huellas, pasos completados, metadatos del esquema creado y resultado. Los mensajes del driver no se publican; se conserva únicamente su código seguro. Prisma recibe explícitamente la misma URL leída del archivo de desarrollo, y su salida se sanitiza antes de guardarla.

MariaDB confirma DDL implícitamente: una falla puede dejar pasos aplicados. El script se detiene y registra el último paso; **no elimina tablas ni simula rollback**. Inspeccionar el informe y el estado real antes de diseñar una continuación, conservando la autorización original solo para el alcance pendiente. Una reversión destructiva exige autorización expresa adicional. Si falla únicamente `prisma-sync`, conservar el DDL verificado y volver a sincronizar el mismo destino; no repetir CREATE.

Pruebas puras del analizador, selección explícita del entorno, redacción y guardas: `npm.cmd run test:vitest -- tests/vitest/unit/databaseMaintenance.test.ts`. Estas pruebas no se conectan a bases reales. La verificación de esquema posterior a aplicación sí consulta la base de desarrollo expresamente autorizada.
