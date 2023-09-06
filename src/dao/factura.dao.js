import { poolFactoring } from "../config/bd/db_factoring.js";

export const insertarFactura = async (factura) => {
  const [rows] = await poolFactoring.query(
    `INSERT INTO factura (facturaid,
        code,
        serie,
        numero_comprobante,
        fecha_emision,
        hora_emision,
        fecha_vencimiento,
        codigo_tipo_documento,
        nota,
        codigo_tipo_moneda,
        cantidad_items,
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
        impuesto_valor_venta_monto_pago) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      factura.facturaid,
      factura.code,
      factura.serie,
      factura.numero_comprobante,
      factura.fecha_emision,
      factura.hora_emision,
      factura.fecha_vencimiento,
      factura.codigo_tipo_documento,
      factura.nota,
      factura.codigo_tipo_moneda,
      factura.cantidad_items,
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
    ]
  );
  //console.log(rows);

  if (rows.length <= 0) {
    throw new Error("BD Logica. Uh oh!");
  }

  return rows;
};
