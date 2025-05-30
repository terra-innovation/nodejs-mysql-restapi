import { poolFactoring } from "#src/config/bd/mysql2_db_factoring";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const insertarFacturaTerminoPago = async (factura_termino_pago) => {
  const [rows] = await poolFactoring.query(
    `INSERT INTO factura_termino_pago (
      facturaterminopagoid,
      _idfactura,
      id,
      forma_pago,
      monto,
      porcentaje,
      fecha_pago
      ) VALUES (?,?,?,?,?,?,?)`,
    [factura_termino_pago.facturaterminopagoid, factura_termino_pago._idfactura, factura_termino_pago.id, factura_termino_pago.forma_pago, factura_termino_pago.monto, factura_termino_pago.porcentaje, factura_termino_pago.fecha_pago]
  );

  if (rows.length <= 0) {
    throw new Error("BD Logica. Uh oh!");
  }

  return rows;
};
