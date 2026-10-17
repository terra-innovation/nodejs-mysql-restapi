-- PREPARADO, NO AUTORIZADO PARA APLICAR EN DESARROLLO NI PRODUCCION.
-- MariaDB: bloque anónimo, sin crear procedimientos ni modificar estructura.
-- Usar una sesión dedicada sin transacción abierta. Ver regularizacion.md.
-- Archivo único: valida, cuenta candidatos, crea maestros e historial y verifica.
-- Seleccionar la base destino antes de ejecutar. Responsable configurable: 105.
-- DELIMITER es una orden del cliente MariaDB, no una sentencia del servidor.
DELIMITER $$
BEGIN NOT ATOMIC
  DECLARE v_actor INT DEFAULT 105;
  DECLARE v_base VARCHAR(255) DEFAULT DATABASE();
  DECLARE v_corte DATETIME(3) DEFAULT UTC_TIMESTAMP(3);
  DECLARE v_esperados BIGINT DEFAULT 0;
  DECLARE v_referencia VARCHAR(500) DEFAULT 'REGULARIZACION_MAESTROS_PAGO_20261016';
  DECLARE v_lote CHAR(36) DEFAULT UUID();
  DECLARE v_faltantes BIGINT DEFAULT 0;
  DECLARE v_eventos BIGINT DEFAULT 0;
  DECLARE v_operacion INT UNSIGNED;
  DECLARE v_maestro INT UNSIGNED;
  DECLARE v_pendiente INT UNSIGNED;
  DECLARE v_existe INT DEFAULT 0;
  DECLARE v_creados BIGINT DEFAULT 0;
  DECLARE v_fin BOOLEAN DEFAULT FALSE;
  DECLARE v_transaccion BOOLEAN DEFAULT FALSE;
  DECLARE v_bloqueo INT DEFAULT 0;
  DECLARE v_nombre_bloqueo VARCHAR(64);
  DECLARE v_zona VARCHAR(64) DEFAULT @@session.time_zone;
  DECLARE v_instante DATETIME(3);
  DECLARE operaciones CURSOR FOR
    SELECT _idfactoring FROM factoring
    WHERE estado=1 AND fecha_operacion IS NOT NULL AND fecha_operacion<=v_corte
    ORDER BY _idfactoring FOR UPDATE;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_fin=TRUE;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    IF v_transaccion THEN ROLLBACK; END IF;
    IF v_bloqueo=1 THEN DO RELEASE_LOCK(v_nombre_bloqueo); END IF;
    SET SESSION time_zone=v_zona;
    RESIGNAL;
  END;

  IF @@in_transaction=1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Use una sesion dedicada sin transaccion abierta';
  END IF;
  IF v_base IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Seleccione la base destino antes de ejecutar';
  END IF;
  IF v_actor IS NULL OR v_actor<=0 OR v_corte IS NULL
     OR v_referencia IS NULL OR CHAR_LENGTH(TRIM(v_referencia))=0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Configuracion de responsable o referencia no valida';
  END IF;
  SET v_nombre_bloqueo=CONCAT('ft_pago_regularizacion_',MD5(DATABASE()));
  SELECT GET_LOCK(v_nombre_bloqueo,10) INTO v_bloqueo;
  IF COALESCE(v_bloqueo,0)<>1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Otra regularizacion mantiene el bloqueo';
  END IF;
  SET SESSION time_zone='+00:00';
  SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
  START TRANSACTION;
  SET v_transaccion=TRUE;
  SELECT COUNT(*) INTO v_existe FROM usuario WHERE _idusuario=v_actor AND estado=1;
  IF v_existe<>1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Responsable no activo'; END IF;
  SELECT COUNT(*),MIN(_idfactoringpagoestado) INTO v_existe,v_pendiente
    FROM factoring_pago_estado WHERE code='PENDIENTE' AND estado=1;
  IF v_existe<>1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Catalogo PENDIENTE no disponible'; END IF;
  SET v_instante=UTC_TIMESTAMP(3);
  OPEN operaciones;
  -- Conteo interno con las operaciones bloqueadas; no requiere un SQL previo.
  SELECT COUNT(*) INTO v_esperados FROM factoring f
    WHERE f.estado=1 AND f.fecha_operacion IS NOT NULL AND f.fecha_operacion<=v_corte
      AND NOT EXISTS (SELECT 1 FROM factoring_pago p WHERE p._idfactoring=f._idfactoring);
  recorrido: LOOP
    FETCH operaciones INTO v_operacion;
    IF v_fin THEN LEAVE recorrido; END IF;
    -- La operacion bloqueada serializa este alta con el Inicio de operacion del servicio.
    -- No se toca ningun maestro existente, incluso si esta eliminado.
    SELECT COUNT(*) INTO v_existe FROM factoring_pago WHERE _idfactoring=v_operacion;
    IF v_existe=0 THEN
      INSERT INTO factoring_pago
        (factoringpagoid,code,_idfactoring,_idfactoringpagoestado,version,
         idusuariocrea,idusuariomod,fechacrea,fechamod,estado)
      VALUES (UUID(),UUID(),v_operacion,v_pendiente,1,v_actor,v_actor,v_instante,v_instante,1);
      SET v_maestro=LAST_INSERT_ID();
      INSERT INTO factoring_pago_historial
        (factoringpagohistorialid,code,_idfactoringpago,_idfactoringpagodetalle,evento,motivo,
         valores_anteriores,valores_posteriores,idusuariocrea,idusuariomod,fechacrea,fechamod,estado)
      VALUES (UUID(),LEFT(REPLACE(UUID(),'-',''),20),v_maestro,NULL,'ALTA_REGULARIZACION',v_referencia,
        NULL,JSON_OBJECT('estado','PENDIENTE','origen','REGULARIZACION','corte_utc',v_corte,'lote',v_lote),
        v_actor,v_actor,v_instante,v_instante,1);
      SET v_creados=v_creados+1;
    END IF;
  END LOOP;
  CLOSE operaciones;
  SELECT COUNT(*) INTO v_faltantes FROM factoring f
    WHERE f.estado=1 AND f.fecha_operacion IS NOT NULL AND f.fecha_operacion<=v_corte
      AND NOT EXISTS (SELECT 1 FROM factoring_pago p WHERE p._idfactoring=f._idfactoring);
  SELECT COUNT(*) INTO v_eventos FROM factoring_pago_historial
    WHERE evento='ALTA_REGULARIZACION' AND JSON_UNQUOTE(JSON_EXTRACT(valores_posteriores,'$.lote'))=v_lote;
  IF v_creados<>v_esperados OR v_faltantes<>0 OR v_eventos<>v_creados THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Verificacion inconsistente: lote completo revertido';
  END IF;
  COMMIT;
  SET v_transaccion=FALSE;
  DO RELEASE_LOCK(v_nombre_bloqueo);
  SET v_bloqueo=0;
  SET SESSION time_zone=v_zona;
  SELECT 'APLICADO' AS resultado,v_base AS base_destino,v_actor AS responsable,v_lote AS lote,
    v_corte AS corte_utc,v_esperados AS candidatos,v_creados AS maestros_creados,
    v_eventos AS eventos_creados,v_faltantes AS maestros_faltantes;
END$$
DELIMITER ;
