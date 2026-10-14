-- Diagnóstico de Saldo Contable. Preparado el 14/10/2026; NO EJECUTADO.
-- Ejecutar solo sobre una copia expresamente autorizada y con acceso de lectura.
-- No selecciona nombres, RUC, cuentas, códigos ni UUID de operaciones/clientes.
-- Cada consulta es independiente. No representa el algoritmo de elegibilidad.
-- Q-00 debe mostrar zona de sesión +00:00/UTC antes de usar límites TIMESTAMP.
-- Si muestra SYSTEM u otra zona, detener Q-04 y revisar la conexión con su responsable.
-- No cambiar la zona de una conexión compartida como preparación de este archivo.
-- Fuente de cobro confirmada: liquidación vigente activa y fecha_pago_efectivo.
-- Vigente utiliza el criterio existente idfactoringliquidacionestado=4.

-- Q-00a. Versión y zona de la sesión; no muestra nombre de base ni credenciales.
SELECT VERSION() AS version_servidor, @@session.time_zone AS zona_sesion;

-- Q-00b. Catálogo funcional por confirmar con el responsable del flujo.
SELECT code, nombre, estado
FROM factoring_liquidacion_estado
ORDER BY code;

-- Q-01. Cobertura de fecha candidata de reconocimiento y neto, por estado actual.
SELECT
    f.estado AS estado_logico_actual,
    fe.code AS codigo_estado_actual,
    COUNT(*) AS operaciones,
    SUM(CASE WHEN f.fecha_operacion IS NULL THEN 1 ELSE 0 END) AS sin_fecha_operacion,
    SUM(CASE WHEN f.monto_neto < 0 THEN 1 ELSE 0 END) AS neto_negativo,
    SUM(CASE WHEN f.monto_neto = 0 THEN 1 ELSE 0 END) AS neto_cero,
    SUM(CASE WHEN f.idfactoringpropuestaaceptada IS NULL THEN 1 ELSE 0 END) AS sin_propuesta_aceptada
FROM (
    SELECT estado, _idfactoringestado, fecha_operacion, monto_neto,
           _idfactoringpropuestaaceptada AS idfactoringpropuestaaceptada
    FROM factoring
) AS f
LEFT JOIN factoring_estado AS fe ON fe._idfactoringestado = f._idfactoringestado
GROUP BY f.estado, fe.code
ORDER BY f.estado, fe.code;

-- Q-02. Fuente confirmada: monto_neto de propuesta aceptada de la operación.
-- Diferir del neto inicial/facturas no constituye error ni cambia esta fuente.
SELECT f.estado AS estado_logico_actual,
       COUNT(*) AS operaciones,
       SUM(CASE WHEN f._idfactoringpropuestaaceptada IS NULL THEN 1 ELSE 0 END) AS sin_propuesta_aceptada,
       SUM(CASE WHEN f._idfactoringpropuestaaceptada IS NOT NULL AND fp._idfactoringpropuesta IS NULL THEN 1 ELSE 0 END) AS enlace_sin_propuesta,
       SUM(CASE WHEN fp._idfactoring IS NOT NULL AND fp._idfactoring <> f._idfactoring THEN 1 ELSE 0 END) AS propuesta_de_otra_operacion,
       SUM(CASE WHEN fp.monto_neto < 0 THEN 1 ELSE 0 END) AS neto_aceptado_negativo
FROM factoring AS f
LEFT JOIN factoring_propuesta AS fp
    ON fp._idfactoringpropuesta = f._idfactoringpropuestaaceptada
GROUP BY f.estado
ORDER BY f.estado;

-- Q-03. Integridad de liquidación vigente por operación.
WITH vigentes AS (
    SELECT _idfactoring, COUNT(*) AS cantidad
    FROM factoring_liquidacion
    WHERE estado = 1 AND _idfactoringliquidacionestado = 4
    GROUP BY _idfactoring
)
SELECT f.estado AS estado_logico_actual, COUNT(*) AS operaciones,
       SUM(CASE WHEN v.cantidad IS NULL THEN 1 ELSE 0 END) AS sin_vigente,
       SUM(CASE WHEN v.cantidad = 1 THEN 1 ELSE 0 END) AS con_una_vigente,
       SUM(CASE WHEN v.cantidad > 1 THEN 1 ELSE 0 END) AS con_varias_vigentes
FROM factoring AS f
LEFT JOIN vigentes AS v ON v._idfactoring = f._idfactoring
GROUP BY f.estado
ORDER BY f.estado;

-- Q-04. Cobro total de liquidaciones vigentes respecto a cada corte.
-- REQUIERE zona de sesión UTC confirmada por Q-00a.
-- Excluye anuladas/reemplazadas. Son conteos, no cálculo de saldo.
WITH cortes AS (
    SELECT CAST('2026-03-31' AS DATE) AS corte,
           CAST('2026-04-01 05:00:00' AS DATETIME) AS limite_exclusivo_utc
    UNION ALL
    SELECT CAST('2026-06-30' AS DATE), CAST('2026-07-01 05:00:00' AS DATETIME)
)
SELECT c.corte, COUNT(l._idfactoringliquidacion) AS vigentes,
       SUM(CASE WHEN l.fecha_pago_efectivo < c.limite_exclusivo_utc THEN 1 ELSE 0 END) AS cobro_hasta_corte,
       SUM(CASE WHEN l.fecha_pago_efectivo >= c.limite_exclusivo_utc THEN 1 ELSE 0 END) AS cobro_posterior
FROM cortes AS c
LEFT JOIN factoring_liquidacion AS l
    ON l.estado = 1 AND l._idfactoringliquidacionestado = 4
GROUP BY c.corte
ORDER BY c.corte;

-- Q-05. Presencia de fuentes heredadas; no determina su dirección económica.
SELECT 'factoring_pago' AS fuente, estado AS estado_logico,
       COUNT(*) AS registros, COUNT(DISTINCT _idfactoring) AS operaciones_referenciadas
FROM factoring_pago
GROUP BY estado
UNION ALL
SELECT 'factoring_ejecutado', estado,
       COUNT(*), COUNT(DISTINCT _idfactoring)
FROM factoring_ejecutado
GROUP BY estado;

-- Q-06. Existencia y forma del valor de tasa, no procedencia oficial.
-- Si no existe, conserva la fila del corte con registros=0.
WITH cortes AS (
    SELECT CAST('2026-03-31' AS DATE) AS corte
    UNION ALL SELECT CAST('2026-06-30' AS DATE)
), tasas AS (
    SELECT tc._idsbstipocambio, tc.fecha, tc.estado, tc.precio_contable, tc.precio_venta
    FROM sbs_tipo_cambio AS tc
    INNER JOIN moneda AS mb ON mb._idmoneda = tc._idmonedabase
    INNER JOIN moneda AS mc ON mc._idmoneda = tc._idmonedacotizada
    WHERE mb.codigo = 'USD' AND mc.codigo = 'PEN'
)
SELECT c.corte, COUNT(t._idsbstipocambio) AS registros,
       SUM(CASE WHEN t._idsbstipocambio IS NOT NULL AND t.estado = 1 THEN 1 ELSE 0 END) AS activos,
       SUM(CASE WHEN t._idsbstipocambio IS NOT NULL AND t.precio_contable IS NULL THEN 1 ELSE 0 END) AS contable_nulo,
       SUM(CASE WHEN t._idsbstipocambio IS NOT NULL AND t.precio_contable <= 0 THEN 1 ELSE 0 END) AS contable_no_positivo,
       SUM(CASE WHEN t._idsbstipocambio IS NOT NULL AND t.precio_contable = t.precio_venta THEN 1 ELSE 0 END) AS contable_igual_a_venta
FROM cortes AS c
LEFT JOIN tasas AS t ON t.fecha = c.corte
GROUP BY c.corte
ORDER BY c.corte;

-- Igualdad contable=venta no prueba que el valor sea correcto ni incorrecto.
-- La verificación de origen/fecha/par y el sustento siguen siendo obligatorios.
