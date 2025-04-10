import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { poolFactoring } from "#src/config/bd/mysql2_db_factoring.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const insertarFactura = async (factura) => {
  const [rows] = await poolFactoring.query(
    `INSERT INTO factura (facturaid,
        code,
        UBLVersionID,
        CustomizationID,
        serie,
        numero_comprobante,
        fecha_emision,
        hora_emision,
        fecha_vencimiento,
        codigo_tipo_documento,
        codigo_tipo_moneda,
        cantidad_items,
        fecha_registro,
        detraccion_cantidad,
        detraccion_monto,
        pago_cantidad_cuotas,
        fecha_pago_mayor_estimado,
        dias_desde_emision,
        dias_estimados_para_pago,
        importe_bruto,
        importe_neto,
        proveedor_ruc,
        proveedor_razon_social,
        proveedor_direccion,
        proveedor_codigo_pais,
        proveedor_ubigeo,
        proveedor_provincia,
        proveedor_departamento,
        proveedor_urbanizacion,
        proveedor_distrito,
        cliente_ruc,
        cliente_razon_social,
        impuesto_monto,
        impuesto_valor_venta_monto_venta,
        impuesto_valor_venta_monto_venta_mas_impuesto,
        impuesto_valor_venta_monto_pago,
        codigo_archivo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      factura.facturaid,
      factura.code,
      factura.UBLVersionID,
      factura.CustomizationID,
      factura.serie,
      factura.numero_comprobante,
      factura.fecha_emision,
      factura.hora_emision,
      factura.fecha_vencimiento,
      factura.codigo_tipo_documento,
      factura.codigo_tipo_moneda,
      factura.cantidad_items,
      factura.fecha_registro,
      factura.detraccion_cantidad,
      factura.detraccion_monto,
      factura.pago_cantidad_cuotas,
      factura.fecha_pago_mayor_estimado,
      factura.dias_desde_emision,
      factura.dias_estimados_para_pago,
      factura.importe_bruto,
      factura.importe_neto,
      factura.proveedor_ruc,
      factura.proveedor_razon_social,
      factura.proveedor_direccion,
      factura.proveedor_codigo_pais,
      factura.proveedor_ubigeo,
      factura.proveedor_provincia,
      factura.proveedor_departamento,
      factura.proveedor_urbanizacion,
      factura.proveedor_distrito,
      factura.cliente_ruc,
      factura.cliente_razon_social,
      factura.impuestos_monto,
      factura.impuestos_valor_venta_monto_venta,
      factura.impuestos_valor_venta_monto_venta_mas_impuesto,
      factura.impuestos_valor_venta_monto_pago,
      factura.codigo_archivo,
    ]
  );
  //logger.info(line(),rows);

  if (rows.length <= 0) {
    throw new Error("BD Logica. Uh oh!");
  }

  return rows;
};
