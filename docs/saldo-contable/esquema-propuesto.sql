-- PROPUESTA PARA VALIDACION. NO EJECUTADA.
-- Crea dos tablas operativas y dos catálogos; revisar y aprobar antes de aplicar.
-- Conserva columnas de auditoría habituales. El cierre se protege transaccionalmente en servicios.

CREATE TABLE `sbs_saldo_contable_periodo_estado` (
  `_idsbssaldocontableperiodoestado` INT UNSIGNED NOT NULL COMMENT 'Clave primaria interna de catálogo con identificadores estables sembrados por la migración. Las relaciones internas usan esta clave; no es el identificador público de la API.',
  `sbssaldocontableperiodoestadoid` VARCHAR(50) NOT NULL DEFAULT (uuid()) COMMENT 'UUID público único, siguiendo el patrón del esquema actual. Identifica el registro en API y no cambia al editar etiquetas, desactivar o reactivar lógicamente.',
  `code` VARCHAR(20) NOT NULL COMMENT 'Código único estable según el patrón existente. En catálogos identifica la semántica de negocio aunque cambie nombre o alias; en registros operativos lo genera la aplicación.',
  `nombre` VARCHAR(50) NOT NULL COMMENT 'Nombre del estado funcional para presentación: EN ELABORACION o CERRADO. No se usa el texto editable para decidir permisos; se utiliza su code estable.',
  `alias` VARCHAR(50) NOT NULL COMMENT 'Etiqueta breve para lista, chip y selector. Es presentación del mismo estado funcional y no crea una tercera condición de cierre.',
  `color` VARCHAR(50) NOT NULL COMMENT 'Color o identificador visual del estado, siguiendo catálogos existentes. No determina permisos ni reemplaza controles de inmutabilidad del servicio.',
  `orden` SMALLINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Orden de presentación del catálogo en listas/controles. No indica prioridad de transacciones ni secuencia automática de aprobación.',
  `idusuariocrea` INT NOT NULL DEFAULT 1 COMMENT 'Usuario responsable de crear el registro. La aplicación debe asignar el usuario autenticado; el valor por defecto conserva la convención técnica existente y no sustituye la autoría real.',
  `fechacrea` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Instante de creación con milisegundos. Se almacena bajo la convención UTC del backend; no representa el inicio, fin o corte civil del reporte.',
  `idusuariomod` INT NOT NULL DEFAULT 1 COMMENT 'Usuario que realizó la última modificación autorizada. Lo establece la aplicación desde la sesión; no se acepta como dato libre del cliente.',
  `fechamod` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Instante de última modificación con milisegundos, actualizado explícitamente por la aplicación. No modifica ni sustituye las fechas civiles o fechas fuente del reporte.',
  `estado` TINYINT NOT NULL DEFAULT 1 COMMENT 'Vigencia lógica del registro: 1=ACTIVO y 2=ELIMINADO. En detalle, activo significa asociado y eliminado significa retirado. No indica elaboración/cierre ni sustituye el catálogo de estado del período.',
  PRIMARY KEY (`_idsbssaldocontableperiodoestado`),
  UNIQUE KEY `UQ_sbscpe_uuid` (`sbssaldocontableperiodoestadoid`),
  UNIQUE KEY `UQ_sbscpe_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Catálogo del estado funcional del período de saldo contable SBS. Distingue EN_ELABORACION y CERRADO; no representa eliminación lógica ni situación temporal de la cobertura. Cambiar nombre o alias no altera su semántica estable.';

CREATE TABLE `sbs_saldo_contable_operacion_tipo` (
  `_idsbssaldocontableoperaciontipo` INT UNSIGNED NOT NULL COMMENT 'Clave primaria interna de catálogo con identificadores estables sembrados por la migración. Las relaciones internas usan esta clave; no es el identificador público de la API.',
  `sbssaldocontableoperaciontipoid` VARCHAR(50) NOT NULL DEFAULT (uuid()) COMMENT 'UUID público único, siguiendo el patrón del esquema actual. Identifica el registro en API y no cambia al editar etiquetas, desactivar o reactivar lógicamente.',
  `code` VARCHAR(20) NOT NULL COMMENT 'Código único estable según el patrón existente. En catálogos identifica la semántica de negocio aunque cambie nombre o alias; en registros operativos lo genera la aplicación.',
  `nombre` VARCHAR(50) NOT NULL COMMENT 'Nombre regulatorio del tipo: DESCUENTO o FACTORING. El nombre comercial factoring no determina este dato; V1 usa DESCUENTO por decisión funcional.',
  `alias` VARCHAR(50) NOT NULL COMMENT 'Etiqueta breve del tipo para formulario y listado; no modifica su code estable ni habilita reglas contables todavía no implementadas.',
  `color` VARCHAR(50) NOT NULL COMMENT 'Identificador visual del tipo conforme al estilo de catálogos existentes; sin efecto sobre clasificación del instrumento o elegibilidad al corte.',
  `orden` SMALLINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Orden de presentación de tipos. No indica elegibilidad, aprobación ni prioridad de cálculo.',
  `habilitado` TINYINT NOT NULL DEFAULT 1 COMMENT 'Disponibilidad funcional para seleccionar el tipo en nuevos períodos: 1=habilitado y 0=no habilitado. DESCUENTO=1 y FACTORING=0 inicialmente; habilitar FACTORING requiere implementar y validar sus reglas, no solo cambiar este valor.',
  `idusuariocrea` INT NOT NULL DEFAULT 1 COMMENT 'Usuario responsable de crear el registro. La aplicación debe asignar el usuario autenticado; el valor por defecto conserva la convención técnica existente y no sustituye la autoría real.',
  `fechacrea` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Instante de creación con milisegundos. Se almacena bajo la convención UTC del backend; no representa el inicio, fin o corte civil del reporte.',
  `idusuariomod` INT NOT NULL DEFAULT 1 COMMENT 'Usuario que realizó la última modificación autorizada. Lo establece la aplicación desde la sesión; no se acepta como dato libre del cliente.',
  `fechamod` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Instante de última modificación con milisegundos, actualizado explícitamente por la aplicación. No modifica ni sustituye las fechas civiles o fechas fuente del reporte.',
  `estado` TINYINT NOT NULL DEFAULT 1 COMMENT 'Vigencia lógica del registro: 1=ACTIVO y 2=ELIMINADO. En detalle, activo significa asociado y eliminado significa retirado. No indica elaboración/cierre ni sustituye el catálogo de estado del período.',
  PRIMARY KEY (`_idsbssaldocontableoperaciontipo`),
  UNIQUE KEY `UQ_sbscot_uuid` (`sbssaldocontableoperaciontipoid`),
  UNIQUE KEY `UQ_sbscot_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Catálogo del tipo regulatorio de operación del reporte SBS: DESCUENTO y FACTORING. No representa el nombre comercial de los servicios o tablas factoring. En V1 solo DESCUENTO tiene reglas implementadas y puede seleccionarse.';

CREATE TABLE `sbs_saldo_contable_periodo` (
  `_idsbssaldocontableperiodo` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Clave primaria interna de registro con incremento automático. Las relaciones internas usan esta clave; no es el identificador público de la API.',
  `sbssaldocontableperiodoid` VARCHAR(50) NOT NULL DEFAULT (uuid()) COMMENT 'UUID público único, siguiendo el patrón del esquema actual. Identifica el registro en API y no cambia al editar etiquetas, desactivar o reactivar lógicamente.',
  `code` VARCHAR(20) NOT NULL COMMENT 'Código único estable según el patrón existente. En catálogos identifica la semántica de negocio aunque cambie nombre o alias; en registros operativos lo genera la aplicación.',
  `nombre_periodo` VARCHAR(150) NOT NULL COMMENT 'Nombre descriptivo visible del período, por ejemplo Primer trimestre 2026. No sustituye fecha_inicio, fecha_fin o fecha_corte ni restringe la frecuencia del reporte.',
  `fecha_inicio` DATE NOT NULL COMMENT 'Inicio civil de la cobertura del reporte, sin hora. No excluye cartera iniciada antes que continúe pendiente al corte; no es una fecha UTC de evento.',
  `fecha_fin` DATE NOT NULL COMMENT 'Fin civil de la cobertura, sin hora. Se usa con fecha_inicio para determinar período anterior, en curso o futuro; no se deriva obligatoriamente de un trimestre.',
  `fecha_corte` DATE NOT NULL COMMENT 'Fecha civil que determina cartera pendiente y tipo de cambio contable SBS aplicable. Incluye todo el día en America/Lima. No es fecha de creación, cierre interno ni envío a SBS.',
  `_idsbssaldocontableperiodoestado` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'FK al estado funcional del período. Inicialmente EN_ELABORACION; el cierre transaccional cambia a CERRADO y bloquea modificaciones de lo reportado. Diferente de estado lógico y de temporalidad calculada.',
  `_idsbssaldocontableoperaciontipo` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'FK al tipo regulatorio del reporte. V1 permite únicamente el catálogo DESCUENTO habilitado; FACTORING permanece reservado para futuras reglas y no se infiere del nombre comercial.',
  `monto_saldo_contable` DECIMAL(24,8) NOT NULL DEFAULT 0 COMMENT 'Total preciso en PEN: suma de monto_saldo_contable de detalles asociados activos. Se presenta con dos decimales; no mezcla monedas originales ni suma reportes de otros cortes. Cero inicial corresponde a selección vacía.',
  `version` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Versión de concurrencia del período, incrementada en mutaciones autorizadas. Permite detectar una edición/revisión de cierre obsoleta; no es número de rectificación regulatoria.',
  `fecha_cierre` TIMESTAMP(3) NULL COMMENT 'Instante UTC con milisegundos en que se confirmó el cierre interno. Nulo mientras esté en elaboración. No acredita firma, presentación o recepción por SBS.',
  `idusuariocierra` INT NULL COMMENT 'Usuario autenticado que confirmó el cierre interno. Nulo en elaboración; usa la convención de columnas de auditoría sin nueva FK obligatoria.',
  `idusuariocrea` INT NOT NULL DEFAULT 1 COMMENT 'Usuario responsable de crear el registro. La aplicación debe asignar el usuario autenticado; el valor por defecto conserva la convención técnica existente y no sustituye la autoría real.',
  `fechacrea` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Instante de creación con milisegundos. Se almacena bajo la convención UTC del backend; no representa el inicio, fin o corte civil del reporte.',
  `idusuariomod` INT NOT NULL DEFAULT 1 COMMENT 'Usuario que realizó la última modificación autorizada. Lo establece la aplicación desde la sesión; no se acepta como dato libre del cliente.',
  `fechamod` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Instante de última modificación con milisegundos, actualizado explícitamente por la aplicación. No modifica ni sustituye las fechas civiles o fechas fuente del reporte.',
  `estado` TINYINT NOT NULL DEFAULT 1 COMMENT 'Vigencia lógica del registro: 1=ACTIVO y 2=ELIMINADO. En detalle, activo significa asociado y eliminado significa retirado. No indica elaboración/cierre ni sustituye el catálogo de estado del período.',
  PRIMARY KEY (`_idsbssaldocontableperiodo`),
  UNIQUE KEY `UQ_sbscp_uuid` (`sbssaldocontableperiodoid`),
  UNIQUE KEY `UQ_sbscp_code` (`code`),
  UNIQUE KEY `UQ_sbscp_fechas_tipo` (`fecha_inicio`, `fecha_fin`, `fecha_corte`, `_idsbssaldocontableoperaciontipo`),
  KEY `IX_sbscp_estado_corte` (`estado`, `fecha_corte`),
  KEY `IX_sbscp_estado_periodo` (`_idsbssaldocontableperiodoestado`),
  KEY `IX_sbscp_tipo` (`_idsbssaldocontableoperaciontipo`),
  CONSTRAINT `FK_sbscp_estado` FOREIGN KEY (`_idsbssaldocontableperiodoestado`) REFERENCES `sbs_saldo_contable_periodo_estado` (`_idsbssaldocontableperiodoestado`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_sbscp_tipo` FOREIGN KEY (`_idsbssaldocontableoperaciontipo`) REFERENCES `sbs_saldo_contable_operacion_tipo` (`_idsbssaldocontableoperaciontipo`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Cabecera de un reporte de saldo contable SBS con cobertura y corte explícitos, independiente de frecuencia trimestral, semestral o anual. Su total en PEN procede de detalles asociados activos. Al cerrar se congelan datos reportados sin bloquear pagos posteriores de operaciones originales.';

CREATE TABLE `sbs_saldo_contable_detalle` (
  `_idsbssaldocontabledetalle` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Clave primaria interna de registro con incremento automático. Las relaciones internas usan esta clave; no es el identificador público de la API.',
  `sbssaldocontabledetalleid` VARCHAR(50) NOT NULL DEFAULT (uuid()) COMMENT 'UUID público único, siguiendo el patrón del esquema actual. Identifica el registro en API y no cambia al editar etiquetas, desactivar o reactivar lógicamente.',
  `code` VARCHAR(20) NOT NULL COMMENT 'Código único estable según el patrón existente. En catálogos identifica la semántica de negocio aunque cambie nombre o alias; en registros operativos lo genera la aplicación.',
  `_idsbssaldocontableperiodo` INT UNSIGNED NOT NULL COMMENT 'FK a cabecera propietaria del detalle. Con _idfactoring forma una relación única por período, sin impedir que la misma operación participe en otros cortes.',
  `_idfactoring` INT UNSIGNED NOT NULL COMMENT 'FK a operación original. Conserva navegación y trazabilidad; el saldo cerrado se lee de las copias del detalle y no se recalcula desde datos operativos actuales.',
  `_idfactoringpropuesta` INT UNSIGNED NOT NULL COMMENT 'FK a propuesta aceptada utilizada en el cálculo. Debe coincidir con la propuesta aceptada de la operación al asociar/recalcular; su monto_neto es la única base, sin fallback al neto inicial de operación o facturas.',
  `_idfactoringliquidacion` INT UNSIGNED NULL COMMENT 'FK a liquidación vigente activa considerada al evaluar el corte. Nula si no existe vigente. Anuladas/reemplazadas no se usan; varias vigentes requieren revisión. No sustituye la copia de fecha_pago_efectivo.',
  `_idmoneda` INT UNSIGNED NOT NULL COMMENT 'FK a moneda original del monto_neto de la propuesta aceptada. No indica moneda del resultado, que siempre es PEN; moneda_codigo conserva la etiqueta histórica.',
  `_idsbstipocambio` INT UNSIGNED NULL COMMENT 'FK al registro existente del tipo contable SBS de USD/PEN para fecha_corte. Nula en PEN porque su multiplicador es 1. La FK conserva origen, pero el valor histórico aplicado se lee de tipo_cambio.',
  `codigo_operacion` VARCHAR(255) NOT NULL COMMENT 'Copia de factoring.code utilizado en el reporte, con capacidad igual a la fuente. Preserva identificación histórica si luego cambia el código operativo.',
  `moneda_codigo` VARCHAR(10) NOT NULL COMMENT 'Copia del código de moneda original PEN o USD al calcular. Permite interpretar el reporte cerrado aunque se modifique posteriormente el catálogo de monedas.',
  `fecha_operacion` TIMESTAMP(0) NOT NULL COMMENT 'Copia del inicio de operación usado para elegibilidad. Se interpreta como instante bajo convención UTC y se compara contra el corte civil completo en Lima; no es fecha_inicio del período.',
  `fecha_pago_efectivo` TIMESTAMP(0) NULL COMMENT 'Copia de fecha real de cobro total de la liquidación vigente usada. Nula si no hay vigente. Cobro hasta corte excluye del saldo; si es posterior, conserva condición pendiente al corte histórico.',
  `monto_neto` DECIMAL(10,2) NOT NULL COMMENT 'Copia de monto_neto de la propuesta aceptada: importe pendiente confirmado por el pagador en moneda original. No es neto inicial de operación, valor nominal, financiado ni desembolso. No volver a restar garantía, detracción o retención.',
  `tipo_cambio` DECIMAL(12,6) NOT NULL COMMENT 'Multiplicador histórico aplicado: 1 para PEN o precio_contable SBS de USD/PEN para fecha_corte. No usar compra, venta, SUNAT, fecha de desembolso ni último día disponible como sustituto.',
  `monto_saldo_contable` DECIMAL(24,8) NOT NULL COMMENT 'Producto preciso de monto_neto por tipo_cambio, siempre en PEN. Se guarda con ocho decimales y se presenta con dos; participa en el total solo mientras el detalle esté activo/asociado.',
  `clasificacion_instrumentos` JSON NULL COMMENT 'Copia estructurada de clasificación y referencias de sustento por instrumento para el reporte. No contiene un reparto monetario inventado desde facturas ni sustituye el neto de la propuesta aceptada.',
  `motivo_retiro` VARCHAR(500) NULL COMMENT 'Última justificación del retiro lógico de la asociación, cuando corresponda. No elimina la operación ni sus asociaciones en otros períodos, y no permite modificar un reporte ya cerrado.',
  `idusuariocrea` INT NOT NULL DEFAULT 1 COMMENT 'Usuario responsable de crear el registro. La aplicación debe asignar el usuario autenticado; el valor por defecto conserva la convención técnica existente y no sustituye la autoría real.',
  `fechacrea` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Instante de creación con milisegundos. Se almacena bajo la convención UTC del backend; no representa el inicio, fin o corte civil del reporte.',
  `idusuariomod` INT NOT NULL DEFAULT 1 COMMENT 'Usuario que realizó la última modificación autorizada. Lo establece la aplicación desde la sesión; no se acepta como dato libre del cliente.',
  `fechamod` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Instante de última modificación con milisegundos, actualizado explícitamente por la aplicación. No modifica ni sustituye las fechas civiles o fechas fuente del reporte.',
  `estado` TINYINT NOT NULL DEFAULT 1 COMMENT 'Vigencia lógica del registro: 1=ACTIVO y 2=ELIMINADO. En detalle, activo significa asociado y eliminado significa retirado. No indica elaboración/cierre ni sustituye el catálogo de estado del período.',
  PRIMARY KEY (`_idsbssaldocontabledetalle`),
  UNIQUE KEY `UQ_sbscd_uuid` (`sbssaldocontabledetalleid`),
  UNIQUE KEY `UQ_sbscd_code` (`code`),
  UNIQUE KEY `UQ_sbscd_periodo_factoring` (`_idsbssaldocontableperiodo`, `_idfactoring`),
  KEY `IX_sbscd_periodo_estado` (`_idsbssaldocontableperiodo`, `estado`),
  KEY `IX_sbscd_factoring` (`_idfactoring`),
  KEY `IX_sbscd_propuesta` (`_idfactoringpropuesta`),
  KEY `IX_sbscd_liquidacion` (`_idfactoringliquidacion`),
  KEY `IX_sbscd_moneda` (`_idmoneda`),
  KEY `IX_sbscd_sbs_tc` (`_idsbstipocambio`),
  CONSTRAINT `FK_sbscd_periodo` FOREIGN KEY (`_idsbssaldocontableperiodo`) REFERENCES `sbs_saldo_contable_periodo` (`_idsbssaldocontableperiodo`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_sbscd_factoring` FOREIGN KEY (`_idfactoring`) REFERENCES `factoring` (`_idfactoring`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_sbscd_propuesta` FOREIGN KEY (`_idfactoringpropuesta`) REFERENCES `factoring_propuesta` (`_idfactoringpropuesta`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_sbscd_liquidacion` FOREIGN KEY (`_idfactoringliquidacion`) REFERENCES `factoring_liquidacion` (`_idfactoringliquidacion`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_sbscd_moneda` FOREIGN KEY (`_idmoneda`) REFERENCES `moneda` (`_idmoneda`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_sbscd_sbs_tc` FOREIGN KEY (`_idsbstipocambio`) REFERENCES `sbs_tipo_cambio` (`_idsbstipocambio`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Una operación asociada a un período SBS con referencia a propuesta aceptada y copias de importes, fechas y clasificación utilizados. El cálculo persistido es monto_neto de propuesta aceptada por tipo_cambio, en PEN. Las copias conservan lo reportado al cierre aunque cambien las fuentes. La operación puede reaparecer en distintos períodos mientras siga pendiente.';

-- Catálogos iniciales. IDs internos fijos según el estilo actual de catálogos.
INSERT INTO `sbs_saldo_contable_periodo_estado` (`_idsbssaldocontableperiodoestado`,`code`,`nombre`,`alias`,`color`,`orden`) VALUES
(1,'SCPE00001','EN ELABORACION','En elaboración','warning',1),
(2,'SCPE00002','CERRADO','Cerrado','success',2);

INSERT INTO `sbs_saldo_contable_operacion_tipo` (`_idsbssaldocontableoperaciontipo`,`code`,`nombre`,`alias`,`color`,`orden`,`habilitado`) VALUES
(1,'SCOT00001','DESCUENTO','Descuento','primary',1,1),
(2,'SCOT00002','FACTORING','Factoring','secondary',2,0);

