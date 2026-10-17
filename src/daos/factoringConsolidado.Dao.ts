import type { TxClient } from "#src/types/Prisma.types.js";
import type { ConsolidadoRow } from "#src/utils/factoringConsolidadoXlsx.js";

// Alias únicos: los encabezados repetidos del Excel no deben perderse al mapear filas.
// CONVERT_TZ equivale al SET -05:00 solicitado sin alterar conexiones del pool.
export const getFactoringConsolidado = (tx: TxClient) => tx.$queryRaw<ConsolidadoRow[]>`
  SELECT
    f.code AS c0,
    DATE_FORMAT(CONVERT_TZ(f.fecha_operacion, @@session.time_zone, '-05:00'), '%Y-%m-%d') AS c1,
    fe.estado2 AS c2,
    IF(f.estado = 1, 'ACTIVO', 'ELIMINADO') AS c3,
    ec.ruc AS c4,
    ec.razon_social AS c5,
    ea.ruc AS c6,
    ea.razon_social AS c7,
    'Propuesta aceptada >' AS c8,
    fa.serie AS c9,
    fa.numero_comprobante AS c10,
    fp.monto_neto AS c11,
    m.codigo AS c12,
    DATE_FORMAT(CONVERT_TZ(fp.fecha_pago_estimado, @@session.time_zone, '-05:00'), '%Y-%m-%d') AS c13,
    fp.dias_pago_estimado AS c14,
    fp.tdm AS c15,
    fp.porcentaje_financiado_estimado AS c16,
    ft.nombre AS c17,
    fp.monto_garantia AS c18,
    fp.monto_financiado AS c19,
    fp.monto_descuento AS c20,
    (SELECT fpf.monto FROM factoring_propuesta_financiero fpf WHERE fpf._idfactoringpropuesta = fp._idfactoringpropuesta AND fpf._idfinancieroconcepto = 1 LIMIT 1) AS c21,
    (SELECT fpf.monto FROM factoring_propuesta_financiero fpf WHERE fpf._idfactoringpropuesta = fp._idfactoringpropuesta AND fpf._idfinancieroconcepto = 2 LIMIT 1) AS c22,
    fp.monto_total_igv AS c23,
    (SELECT fpf.monto FROM factoring_propuesta_financiero fpf WHERE fpf._idfactoringpropuesta = fp._idfactoringpropuesta AND fpf._idfinancieroconcepto = 4 LIMIT 1) AS c24,
    fp.monto_adelanto AS c25,
    'Liquidación >' AS c26,
    DATE_FORMAT(CONVERT_TZ(fl.fecha_pago_efectivo, @@session.time_zone, '-05:00'), '%Y-%m-%d') AS c27,
    fl.dias_pago_efectivo AS c28,
    fp.monto_neto AS c29,
    fp.monto_financiado AS c30,
    fp.monto_garantia AS c31,
    fp.monto_descuento AS c32,
    fl.monto_descuento_efectivo AS c33,
    'Detalle liquidación >' AS c34,
    (SELECT flf.monto FROM factoring_liquidacion_financiero flf WHERE flf._idfactoringliquidacion = fl._idfactoringliquidacion AND flf._idfinancieroconcepto = 7 LIMIT 1) AS c35,
    (SELECT flf.monto FROM factoring_liquidacion_financiero flf WHERE flf._idfactoringliquidacion = fl._idfactoringliquidacion AND flf._idfinancieroconcepto = 8 LIMIT 1) AS c36,
    (SELECT flf.monto FROM factoring_liquidacion_financiero flf WHERE flf._idfactoringliquidacion = fl._idfactoringliquidacion AND flf._idfinancieroconcepto = 3 LIMIT 1) AS c37,
    fl.monto_total_a_favor AS c38,
    fle.nombre AS c39,
    'Factura de FT al Cedente >' AS c40,
    faf.serie AS c41,
    faf.numero_comprobante AS c42,
    faf.codigo_tipo_moneda AS c43,
    faf.importe_bruto AS c44,
    faf.importe_neto AS c45,
    faf.detraccion_monto AS c46,
    fae.nombre AS c47,
    dee.nombre AS c48,
    DATE_FORMAT(CONVERT_TZ(fff.fecha_pago_factura, @@session.time_zone, '-05:00'), '%Y-%m-%d') AS c49,
    DATE_FORMAT(CONVERT_TZ(fff.fecha_pago_detraccion, @@session.time_zone, '-05:00'), '%Y-%m-%d') AS c50
  FROM factoring f
  INNER JOIN empresa ea ON ea._idempresa = f._idaceptante
  INNER JOIN empresa ec ON ec._idempresa = f._idcedente
  INNER JOIN moneda m ON m._idmoneda = f._idmoneda
  INNER JOIN factoring_estado fe ON fe._idfactoringestado = f._idfactoringestado
  LEFT JOIN factoring_propuesta fp ON fp._idfactoringpropuesta = f._idfactoringpropuestaaceptada
  INNER JOIN factoring_factura ff ON ff._idfactoring = f._idfactoring
  INNER JOIN factura fa ON fa._idfactura = ff._idfactura
  LEFT JOIN factoring_tipo ft ON ft._idfactoringtipo = fp._idfactoringtipo
  LEFT JOIN factoring_liquidacion fl ON fl._idfactoring = f._idfactoring
  LEFT JOIN factoring_liquidacion_estado fle ON fle._idfactoringliquidacionestado = fl._idfactoringliquidacionestado
  LEFT JOIN factoring_factura_factor fff ON fff._idfactoring = f._idfactoring
  LEFT JOIN factura faf ON faf._idfactura = fff._idfactura
  LEFT JOIN factura_estado fae ON fae._idfacturaestado = fff._idfacturaestado
  LEFT JOIN detraccion_estado dee ON dee._iddetraccionestado = fff._iddetraccionestado
  ORDER BY f._idfactoring, f.fecha_operacion
`;
