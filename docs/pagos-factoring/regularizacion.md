# Regularización de maestros: un solo SQL

Estado: SQL único preparado y validado en MariaDB desechable. Posteriormente el usuario informó que lo ejecutó manualmente en desarrollo y autorizó pruebas web. El agente verificó maestros disponibles y flujos de pagos en dos operaciones, sin auditar todo el lote ni ejecutar la regularización. No hay aplicación ni verificación de producción en esta evidencia.

Archivo único: [regularizacion-maestros.sql](regularizacion-maestros.sql). Sustituye la versión que requería consulta previa y cinco variables externas; ya no necesita un segundo SQL ni conteos manuales.

## Ejecución

Seleccionar la base destino y ejecutar el archivo completo en una sesión dedicada de MariaDB, sin transacción abierta. El responsable está en la primera declaración (`v_actor = 105`); revisar ese ID en cada destino y cambiarlo si el responsable aprobado es otro. El script usa la base seleccionada, no contiene credenciales, `USE` ni nombres de entornos.

El archivo incluye `DELIMITER` para el cliente MariaDB. Con un driver se envía el bloque completo `BEGIN NOT ATOMIC ... END`, sin las órdenes del cliente. No usar el runner `db:ddl`, que no admite esta carga de datos; no se necesita prisma-sync porque no cambia estructura.

La autorización vigente es preparar el archivo. Su ejecución sobre una base compartida requiere autorización expresa del destino y alcance; un usuario activo en la tabla no constituye por sí mismo esa autorización. En desarrollo, obtener siempre el destino de `.env.development`. Para el pase, conservar respaldo, versión del SQL y ventana de mantenimiento con escritores pausados. El bloqueo asesor coordina este script y los bloqueos de operaciones coordinan con el alta del servicio; no impiden DML directo desde otros clientes.

## Lo que hace al ejecutarse

1. Valida base seleccionada, responsable activo y catálogo PENDIENTE activo.
2. Fija el corte UTC y un identificador único de lote. Bloquea las operaciones candidatas y calcula internamente cuántos maestros faltan.
3. Crea únicamente los maestros faltantes de operaciones activas con inicio no nulo hasta ese corte, en PENDIENTE y versión 1. Conserva todos los maestros existentes, incluso eliminados.
4. Registra un evento `ALTA_REGULARIZACION` por maestro, con actor, instante real, referencia del script, corte y lote. No copia la fecha de inicio como fecha de creación.
5. Verifica candidatos frente a creados, faltantes cero y eventos del lote frente a maestros creados. Si algo falla, revierte todo. Si pasa, confirma y devuelve base, responsable, lote, corte, candidatos, maestros y eventos creados y faltantes.

No crea abonos, no vincula transacciones bancarias y no modifica operaciones, propuestas, liquidaciones ni estados de maestros existentes. No infiere pagos históricos. Se puede volver a ejecutar sin parámetros nuevos: si no hay faltantes, confirma cero altas, sin duplicados ni eventos adicionales.

Ante pérdida de conexión al confirmar, revisar la base y el historial del lote antes de concluir el resultado. Después del COMMIT no se eliminan maestros automáticamente, pues podrían recibir pagos; una reversión posterior exige revisión y autorización específicas.

## Validación

Se ejecutó el mismo bloque del archivo en MariaDB desechable 11.4.10, con Node portable 24.21.0; solo se configura un actor sintético en la prueba. **7 pruebas aprobadas**, tipos de integración y formato aprobados. Se comprobaron ejecución sin variables externas, resumen y lote auditable, catálogo/responsable activos, selección por inicio/vigencia/corte, preservación de maestros existentes, reejecución sin duplicados, rollback por fallo de historial o verificación y protección de una transacción ajena ya abierta. El contenedor de pruebas quedó eliminado. Ver [registro](../registros/bbdd/pagos-regularizacion-pruebas.log), [tipos](../registros/bbdd/pagos-regularizacion-tipos.log) y [huellas/evidencia](revision-regularizacion.json). No se consultaron ni escribieron bases compartidas para estas pruebas.
