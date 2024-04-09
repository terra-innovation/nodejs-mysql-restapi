import { poolFactoring } from "../config/bd/mysql2_db_factoring.js";

export const insertarFacturaItem = async (factura_item) => {
  const [rows] = await poolFactoring.query(
    `INSERT INTO factura_item (
      facturaitemid,
      _idfactura,
      id,
      codigo_producto_sunat,
      codigo_producto_vendedor,
      unidad_medida,
      cantidad,
      descripcion,
      valor_unitario,
      precio_venta,
      impuesto_codigo_sunat,
      impuesto_nombre,
      impuesto_porcentaje,
      impuesto_codigo_afectacion_sunat,
      impuesto_base_imponible,
      impuesto_monto,
      moneda
      ) VALUES (?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
        )`,
    [
      factura_item.facturaitemid,
      factura_item._idfactura,
      factura_item.id,
      factura_item.codigo_producto_sunat,
      factura_item.codigo_producto_vendedor,
      factura_item.unidad_medida,
      factura_item.cantidad,
      factura_item.descripcion,
      factura_item.valor_unitario,
      factura_item.precio_venta,
      factura_item.impuesto_codigo_sunat,
      factura_item.impuesto_nombre,
      factura_item.impuesto_porcentaje,
      factura_item.impuesto_codigo_afectacion_sunat,
      factura_item.impuesto_base_imponible,
      factura_item.impuesto_monto,
      factura_item.moneda,
    ]
  );
  //console.log(rows);

  if (rows.length <= 0) {
    throw new Error("BD Logica. Uh oh!");
  }

  return rows;
};
