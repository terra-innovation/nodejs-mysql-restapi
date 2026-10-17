# Permisos de origen administrados externamente

El usuario indicó expresamente el 16/10/2026 que los privilegios de la cuenta remota son responsabilidad del administrador y autorizó continuar la sincronización aunque esa cuenta tenga permisos de escritura, tanto por tabla como por base.

Se eliminó la consulta SHOW GRANTS y el rechazo por privilegios adicionales del lector bancario. No se amplían privilegios del servidor remoto. La aplicación sigue ejecutando consultas SELECT parametrizadas en una transacción READ ONLY; MariaDB/MySQL verifica el permiso efectivo de lectura. Persisten las validaciones de destino autorizado, cifrado de almacenamiento, modalidad TLS elegida, cuenta mapeada, contrato de columnas, límites de extracción y reglas locales de identidad e historial.

Los GRANT USAGE y SELECT sobre la base compartidos por el usuario eran compatibles con la antigua regla; el mensaje histórico no demuestra que el proceso utilizara exactamente esa misma cuenta y coincidencia de host. No se atribuye el fallo a una causa no comprobada. Las ejecuciones anteriores conservan sus mensajes; el cambio opera en ejecuciones nuevas.

Verificación real: se leyó el contrato histórico completo usando la conexión bancaria activa guardada, con una etiqueta sintética de cuenta inexistente. La lectura terminó correctamente y devolvió cero filas; no se mostraron credenciales ni movimientos, no se importaron datos y no hubo escrituras locales ni remotas. El script temporal fue retirado.

Validación sintética: 29 pruebas aprobadas en lector remoto, servicio de sincronización y permisos HTTP. Incluye cuentas con SELECT por base o privilegios adicionales, ausencia de inspección de grants, transacción READ ONLY, denegación efectiva de SELECT, sanitización de errores, límites e idempotencia. [Registro](../registros/pruebas/test-20261016-banca-permisos.log).

No se inició una importación real: el navegador controlable no dispone de una pestaña autenticada de la aplicación. No se usaron tokens inventados, cuentas suplentes ni escrituras directas de mantenimiento para sustituir la sesión financiera. No se modificaron frontend, esquema ni permisos remotos. Los DDL y comentarios históricos anteriores describen la política inicial; esta decisión y la guía de operación actualizada definen el comportamiento vigente.

**Siguiente paso del plan:** asegurar que el backend cargó el cambio, recargar la aplicación y repetir desde la sesión financiera el alcance previamente elegido. Revisar el nuevo resultado y, si es exitoso, repetir el mismo alcance para comprobar que no se duplican movimientos.
