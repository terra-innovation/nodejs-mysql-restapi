-- BORRADOR 16/10/2026. Solo preparación y revisión autorizadas.
-- NO ejecutar sin autorización expresa para estas tablas y columnas.
-- Destino exclusivo: desarrollo leído desde .env.development por db:ddl.
-- Requiere factoring_pago VACIO y CHECK habilitados en sesión y escritores.
-- Detener escritores y comprobar estructura, FKs entrantes y respaldo primero.
-- No contiene pagos, maestros iniciales, catálogo sembrado ni datos de clientes.

-- Primera operación: validar vacío y cerrar temporalmente la tabla a INSERT/UPDATE.
-- ALGORITHM=COPY fuerza revisar las filas existentes. No usar IGNORE.
-- La guarda permanece si falla un paso posterior; no reejecutar a ciegas.
ALTER TABLE `factoring_pago`
  ADD CONSTRAINT `CK_fp_transicion_vacia` CHECK (CHAR_LENGTH(`code`) < 0),
  ALGORITHM=COPY, LOCK=EXCLUSIVE;

CREATE TABLE `factoring_pago_estado` (
  `_idfactoringpagoestado` INT UNSIGNED NOT NULL COMMENT 'Identificador interno fijo del catálogo. La configuración inicial propuesta reserva 1=PENDIENTE, 2=PARCIAL y 3=CANCELADO, sin insertar esas filas en este DDL.',
  `factoringpagoestadoid` VARCHAR(50) NOT NULL DEFAULT (uuid()) COMMENT 'UUID público estable del estado de pago. No sustituye al código funcional.',
  `code` VARCHAR(20) NOT NULL COMMENT 'Código funcional único y estable. Configuración inicial propuesta: PENDIENTE, PARCIAL y CANCELADO.',
  `nombre` VARCHAR(50) NOT NULL COMMENT 'Nombre visible del estado seleccionado por el usuario.',
  `alias` VARCHAR(50) NOT NULL COMMENT 'Etiqueta breve del estado para presentación según el estándar del catálogo.',
  `color` VARCHAR(50) NOT NULL COMMENT 'Color de presentación del catálogo. No determina reglas financieras ni transiciones.',
  `idusuariocrea` INT NOT NULL COMMENT 'Actor autorizado del alta, validado por el servicio. Sin asignación automática al usuario 1.',
  `fechacrea` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Instante de creación en UTC con milisegundos.',
  `idusuariomod` INT NOT NULL COMMENT 'Actor autorizado de la última modificación, asignado explícitamente por el servicio.',
  `fechamod` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Instante UTC de última modificación, actualizado explícitamente por el servicio.',
  `estado` TINYINT NOT NULL DEFAULT 1 COMMENT 'Vigencia lógica: 1=ACTIVO, 2=ELIMINADO. Independiente del estado de pago que describe esta fila.',
  PRIMARY KEY (`_idfactoringpagoestado`),
  UNIQUE KEY `UQ_fpe_uuid` (`factoringpagoestadoid`),
  UNIQUE KEY `UQ_fpe_code` (`code`),
  CONSTRAINT `CK_fpe_id` CHECK (`_idfactoringpagoestado` > 0),
  CONSTRAINT `CK_fpe_estado` CHECK (`estado` IN (1, 2))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='Catálogo funcional de pagos de Factoring. El usuario selecciona pendiente, parcial o cancelado sin bloqueo por diferencias frente a la propuesta aceptada. No se reutilizan estados de liquidación ni operación.';

-- La guarda temporal sigue activa mientras se transforma el maestro vacío.
ALTER TABLE `factoring_pago`
  DROP FOREIGN KEY `FK_factoring_pago_empresa_cuenta_bancaria`,
  DROP FOREIGN KEY `FK_factoring_pago_factor_cuenta_bancaria`,
  DROP FOREIGN KEY `FK_factoring_pago_factoring`,
  DROP INDEX `_idaceptante`,
  DROP INDEX `_idcedente`,
  DROP INDEX `_idmoneda`,
  DROP COLUMN `_idempresacuentabancaria`,
  DROP COLUMN `_idfactorcuentabancaria`,
  DROP COLUMN `numero_operacion`,
  DROP COLUMN `fecha_pago`,
  DROP COLUMN `monto_pagado`,
  MODIFY COLUMN `_idfactoringpago` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'PK interna del maestro de pago. Se conserva la identidad de la tabla adaptada, cuya transición exige ausencia de abonos.',
  MODIFY COLUMN `factoringpagoid` VARCHAR(50) NOT NULL DEFAULT (uuid()) COMMENT 'UUID público estable del maestro por operación.',
  MODIFY COLUMN `code` VARCHAR(255) NOT NULL COMMENT 'Código de presentación único del maestro. Se conserva la longitud del contrato existente.',
  MODIFY COLUMN `_idfactoring` INT UNSIGNED NOT NULL COMMENT 'Operación de Factoring del maestro. Factor, pagador, moneda y propuesta aceptada se obtienen de esta relación.',
  ADD COLUMN `_idfactoringpagoestado` INT UNSIGNED NOT NULL COMMENT 'Estado funcional elegido por el usuario. El servicio resuelve PENDIENTE al crear, sin inferir estados por importes.',
  ADD COLUMN `version` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Versión de concurrencia del maestro. Aumenta al modificar sus datos o aplicaciones de pago.',
  MODIFY COLUMN `idusuariocrea` INT NOT NULL COMMENT 'Actor autenticado del alta, asignado explícitamente por el servicio, sin DEFAULT 1.',
  MODIFY COLUMN `fechacrea` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Instante UTC de creación del maestro.',
  MODIFY COLUMN `idusuariomod` INT NOT NULL COMMENT 'Actor autenticado de la última modificación, asignado explícitamente por el servicio, sin DEFAULT 1.',
  MODIFY COLUMN `fechamod` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Instante UTC de última modificación, actualizado por el servicio junto con versión e historial.',
  MODIFY COLUMN `estado` TINYINT NOT NULL DEFAULT 1 COMMENT 'Vigencia lógica: 1=ACTIVO, 2=ELIMINADO. No representa pendiente, parcial ni cancelado.',
  ADD UNIQUE KEY `UQ_fp_operacion` (`_idfactoring`),
  ADD KEY `IX_fp_pagoestado` (`_idfactoringpagoestado`),
  ADD CONSTRAINT `FK_fp_factoring` FOREIGN KEY (`_idfactoring`) REFERENCES `factoring` (`_idfactoring`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `FK_fp_pagoestado` FOREIGN KEY (`_idfactoringpagoestado`) REFERENCES `factoring_pago_estado` (`_idfactoringpagoestado`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `CK_fp_version` CHECK (`version` > 0),
  ADD CONSTRAINT `CK_fp_estado` CHECK (`estado` IN (1, 2)),
  COMMENT='Maestro único de pagos por operación de Factoring. El acumulado y la diferencia frente al monto neto de la propuesta aceptada se calculan, no se almacenan. Estado funcional manual sin restricciones por diferencia de importe.';

CREATE TABLE `factoring_pago_detalle` (
  `_idfactoringpagodetalle` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'PK interna de la aplicación de un movimiento bancario a una operación.',
  `factoringpagodetalleid` VARCHAR(50) NOT NULL DEFAULT (uuid()) COMMENT 'UUID público estable del detalle de pago.',
  `code` VARCHAR(20) NOT NULL COMMENT 'Código único de presentación del detalle, generado por el servicio.',
  `_idfactoringpago` INT UNSIGNED NOT NULL COMMENT 'Maestro receptor del importe. La operación se obtiene de este maestro y no se duplica en el detalle.',
  `_idfactortransaccionbancaria` INT UNSIGNED NOT NULL COMMENT 'Movimiento bancario del factor que acredita el abono. Puede participar en detalles de distintas operaciones.',
  `monto_aplicado` DECIMAL(20,2) NOT NULL COMMENT 'Importe positivo del movimiento aplicado a este maestro. La suma global aplicada al movimiento no puede superar su monto.',
  `version` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Versión de concurrencia del detalle. La escritura también incrementa la versión del maestro.',
  `idusuariocrea` INT NOT NULL COMMENT 'Actor autenticado que registra la aplicación, obtenido por el servicio.',
  `fechacrea` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Instante UTC de registro. La fecha bancaria se consulta en el movimiento y no se copia.',
  `idusuariomod` INT NOT NULL COMMENT 'Actor autenticado de la última corrección o anulación.',
  `fechamod` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Instante UTC de última modificación, actualizado explícitamente por el servicio.',
  `estado` TINYINT NOT NULL DEFAULT 1 COMMENT 'Vigencia lógica: 1=ACTIVO, 2=ELIMINADO. Solo las aplicaciones activas integran el acumulado.',
  PRIMARY KEY (`_idfactoringpagodetalle`),
  UNIQUE KEY `UQ_fpd_uuid` (`factoringpagodetalleid`),
  UNIQUE KEY `UQ_fpd_code` (`code`),
  UNIQUE KEY `UQ_fpd_maestro_movimiento` (`_idfactoringpago`, `_idfactortransaccionbancaria`),
  KEY `IX_fpd_movimiento` (`_idfactortransaccionbancaria`),
  CONSTRAINT `FK_fpd_maestro` FOREIGN KEY (`_idfactoringpago`) REFERENCES `factoring_pago` (`_idfactoringpago`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_fpd_movimiento` FOREIGN KEY (`_idfactortransaccionbancaria`) REFERENCES `factor_transaccion_bancaria` (`_idfactortransaccionbancaria`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `CK_fpd_importe` CHECK (`monto_aplicado` > 0),
  CONSTRAINT `CK_fpd_version` CHECK (`version` > 0),
  CONSTRAINT `CK_fpd_estado` CHECK (`estado` IN (1, 2))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='Detalle de importes aplicados a pagos de Factoring con evidencia bancaria obligatoria. Resuelve varios abonos por operación y varias operaciones por transacción, sin copiar datos bancarios ni repartir por factura.';

CREATE TABLE `factoring_pago_historial` (
  `_idfactoringpagohistorial` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'PK interna del evento auditable de pagos.',
  `factoringpagohistorialid` VARCHAR(50) NOT NULL DEFAULT (uuid()) COMMENT 'UUID público estable del evento histórico.',
  `code` VARCHAR(20) NOT NULL COMMENT 'Código único de presentación del evento, generado por el servicio.',
  `_idfactoringpago` INT UNSIGNED NOT NULL COMMENT 'Maestro al que pertenece el evento. Permite consultar conjuntamente eventos del maestro y sus detalles.',
  `_idfactoringpagodetalle` INT UNSIGNED NULL COMMENT 'Detalle afectado, cuando corresponda. El servicio comprueba su pertenencia al maestro indicado.',
  `evento` VARCHAR(50) NOT NULL COMMENT 'Tipo de evento validado por el servicio: alta, corrección, anulación, reactivación o cambio de estado funcional.',
  `motivo` VARCHAR(500) NULL COMMENT 'Motivo del cambio. El servicio exige contenido para corregir, anular o reabrir, sin exigirlo por diferencias de céntimos.',
  `valores_anteriores` LONGTEXT NULL COMMENT 'JSON de campos anteriores permitido por el servicio. Evidencia de auditoría, nunca fuente para calcular acumulados.',
  `valores_posteriores` LONGTEXT NULL COMMENT 'JSON de campos posteriores permitido por el servicio. No incluye credenciales, filas de clientes ni copias completas de movimientos.',
  `idusuariocrea` INT NOT NULL COMMENT 'Actor autenticado responsable del evento, asignado explícitamente.',
  `fechacrea` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Instante UTC del evento, escrito en la misma transacción del cambio.',
  `idusuariomod` INT NOT NULL COMMENT 'Mismo actor del alta. El módulo no permite editar eventos después de insertarlos.',
  `fechamod` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Mismo instante del alta. El módulo conserva los eventos sin modificaciones posteriores.',
  `estado` TINYINT NOT NULL DEFAULT 1 COMMENT 'El historial permanece en 1=ACTIVO; no se elimina ni anula desde el módulo.',
  PRIMARY KEY (`_idfactoringpagohistorial`),
  UNIQUE KEY `UQ_fph_uuid` (`factoringpagohistorialid`),
  UNIQUE KEY `UQ_fph_code` (`code`),
  KEY `IX_fph_maestro_fecha` (`_idfactoringpago`, `fechacrea`),
  KEY `IX_fph_detalle` (`_idfactoringpagodetalle`),
  CONSTRAINT `FK_fph_maestro` FOREIGN KEY (`_idfactoringpago`) REFERENCES `factoring_pago` (`_idfactoringpago`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_fph_detalle` FOREIGN KEY (`_idfactoringpagodetalle`) REFERENCES `factoring_pago_detalle` (`_idfactoringpagodetalle`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `CK_fph_antes_json` CHECK (`valores_anteriores` IS NULL OR JSON_VALID(`valores_anteriores`)),
  CONSTRAINT `CK_fph_despues_json` CHECK (`valores_posteriores` IS NULL OR JSON_VALID(`valores_posteriores`)),
  CONSTRAINT `CK_fph_evento` CHECK (CHAR_LENGTH(TRIM(`evento`)) > 0),
  CONSTRAINT `CK_fph_estado` CHECK (`estado` = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='Historial de pagos y aplicaciones con actor, instante y valores afectados. Solo inserción desde el módulo, en la misma transacción del cambio. Las FKs y CHECK no sustituyen permisos ni validaciones del servicio.';

-- Último paso: abrir únicamente el esquema ya transformado.
-- El catálogo vacío impide crear maestros hasta configurar estados con actor autorizado.
INSERT INTO `factoring_pago_estado` (`_idfactoringpagoestado`, `code`, `nombre`, `alias`, `color`, `idusuariocrea`, `idusuariomod`) VALUES
  (1, 'PENDIENTE', 'Pendiente de pago', 'Pendiente', 'warning', 105, 105),
  (2, 'PARCIAL', 'Pago parcial', 'Parcial', 'info', 105, 105),
  (3, 'CANCELADO', 'Cancelado totalmente', 'Cancelado', 'success', 105, 105);

ALTER TABLE `factoring_pago` DROP CONSTRAINT `CK_fp_transicion_vacia`;
