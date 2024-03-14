import { poolFactoring } from "../config/bd/mysql2_db_factoring.js";

export const insertarFacturaImpuesto = async (factura_impuesto) => {
  const [rows] = await poolFactoring.query(
    `INSERT INTO factura_impuesto (
      facturaimpuestoid,
      idfactura,
      id,
      codigo_sunat,
      nombre,
      porcentaje,
      base_imponible,
      monto

      ) VALUES (?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
        )`,
    [
      factura_impuesto.facturaimpuestoid,
      factura_impuesto.idfactura,
      factura_impuesto.id,
      factura_impuesto.codigo_sunat,
      factura_impuesto.nombre,
      factura_impuesto.porcentaje,
      factura_impuesto.base_imponible,
      factura_impuesto.monto,
    ]
  );
  //console.log(rows);

  if (rows.length <= 0) {
    throw new Error("BD Logica. Uh oh!");
  }

  return rows;
};
