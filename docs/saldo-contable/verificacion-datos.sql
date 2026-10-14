-- Diagnóstico de Saldo Contable. Preparado el 14/10/2026; NO EJECUTADO.
-- Ejecutar solo sobre una copia expresamente autorizada y con acceso de lectura.
-- No selecciona nombres, RUC, cuentas, códigos ni UUID de operaciones/clientes.
-- Cada consulta es independiente. No representa el algoritmo de elegibilidad.
-- Q-00 debe mostrar zona de sesión +00:00/UTC antes de usar límites TIMESTAMP.
-- Si muestra SYSTEM u otra zona, detener Q-04 y revisar la conexión con su responsable.
-- No cambiar la zona de una conexión compartida como preparación de este archivo.
-- Los catálogos/estados actuales no acreditan por sí solos la situación histórica.

-- Q-00a. Versión y zona de la sesión; no muestra nombre de base ni credenciales.
SELECT VERSION() AS version_servidor, @@session.time_zone AS zona_sesion;

-- Q-00b. Catálogo funcional por confirmar con el responsable del flujo.
SELECT code, nombre, estado
FROM factura_estado
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

-- Q-02. Comparación ACTUAL de base de operación con instrumentos relacionados activos.
-- Una diferencia no autoriza actualizar montos históricos ni elegir otra base.
WITH netos AS (
    SELECT ff._idfactoring,
           COUNT(*) AS instrumentos,
           SUM(CASE WHEN fa._idfactura IS NULL THEN 1 ELSE 0 END) AS enlaces_sin_factura,
           SUM(fa.importe_neto) AS suma_neto_instrumentos
    FROM factoring_factura AS ff
    LEFT JOIN factura AS fa ON fa._idfactura = ff._idfactura
    WHERE ff.estado = 1
    GROUP BY ff._idfactoring
)
SELECT f.estado AS estado_logico_actual,
       COUNT(*) AS operaciones,
       SUM(CASE WHEN n.instrumentos IS NULL THEN 1 ELSE 0 END) AS sin_instrumentos_activos,
       SUM(CASE WHEN n.enlaces_sin_factura > 0 THEN 1 ELSE 0 END) AS con_enlaces_incompletos,
       SUM(CASE WHEN n.suma_neto_instrumentos <> f.monto_neto THEN 1 ELSE 0 END) AS netos_discrepantes,
       SUM(CASE WHEN n.instrumentos IS NOT NULL AND n.instrumentos <> f.cantidad_facturas THEN 1 ELSE 0 END) AS cantidad_discrepante
FROM factoring AS f
LEFT JOIN netos AS n ON n._idfactoring = f._idfactoring
GROUP BY f.estado
ORDER BY f.estado;

-- Q-03a. Fechas presentes/ausentes por estado funcional actual del comprobante.
SELECT fff.estado AS estado_logico_actual,
       e.code AS codigo_estado_factura,
       COUNT(*) AS registros,
       SUM(CASE WHEN fff.fecha_pago_factura IS NULL THEN 1 ELSE 0 END) AS sin_fecha_pago_factura,
       SUM(CASE WHEN fff.fecha_pago_factura IS NOT NULL THEN 1 ELSE 0 END) AS con_fecha_pago_factura
FROM factoring_factura_factor AS fff
LEFT JOIN factura_estado AS e ON e._idfacturaestado = fff._idfacturaestado
GROUP BY fff.estado, e.code
ORDER BY fff.estado, e.code;

-- Q-03b. Duplicados activos por operación/instrumento y enlaces sin cobertura de pago.
WITH asignaciones AS (
    SELECT _idfactoring, _idfactura, COUNT(*) AS registros
    FROM factoring_factura_factor
    WHERE estado = 1
    GROUP BY _idfactoring, _idfactura
)
SELECT COUNT(*) AS instrumentos_relacionados_activos,
       COALESCE(SUM(CASE WHEN a.registros IS NULL THEN 1 ELSE 0 END), 0) AS sin_asignacion_activa,
       COALESCE(SUM(CASE WHEN a.registros > 1 THEN 1 ELSE 0 END), 0) AS asignacion_duplicada
FROM factoring_factura AS ff
LEFT JOIN asignaciones AS a
    ON a._idfactoring = ff._idfactoring AND a._idfactura = ff._idfactura
WHERE ff.estado = 1;

-- Q-04. Fechas registradas de instrumentos situadas a ambos lados de cada corte.
-- REQUIERE zona de sesión UTC confirmada por Q-00a.
-- Son señales de revisión: no se interpreta fecha sola como prueba de pago total.
WITH cortes AS (
    SELECT CAST('2026-03-31' AS DATE) AS corte,
           CAST('2026-04-01 05:00:00' AS DATETIME) AS limite_exclusivo_utc
    UNION ALL
    SELECT CAST('2026-06-30' AS DATE), CAST('2026-07-01 05:00:00' AS DATETIME)
), por_operacion AS (
    SELECT c.corte, fff._idfactoring,
           SUM(CASE WHEN fff.fecha_pago_factura < c.limite_exclusivo_utc THEN 1 ELSE 0 END) AS fechas_hasta_corte,
           SUM(CASE WHEN fff.fecha_pago_factura >= c.limite_exclusivo_utc THEN 1 ELSE 0 END) AS fechas_posteriores,
           SUM(CASE WHEN fff.fecha_pago_factura IS NULL THEN 1 ELSE 0 END) AS fechas_faltantes
    FROM cortes AS c
    CROSS JOIN factoring_factura_factor AS fff
    WHERE fff.estado = 1
    GROUP BY c.corte, fff._idfactoring
)
SELECT corte, COUNT(*) AS operaciones_con_asignaciones,
       SUM(CASE WHEN fechas_hasta_corte > 0 AND fechas_posteriores > 0 THEN 1 ELSE 0 END) AS fechas_a_ambos_lados,
       SUM(CASE WHEN fechas_hasta_corte > 0 AND fechas_faltantes > 0 THEN 1 ELSE 0 END) AS anteriores_y_faltantes
FROM por_operacion
GROUP BY corte
ORDER BY corte;

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
