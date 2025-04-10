import { poolFactoring } from "#src/config/bd/mysql2_db_factoring.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const insertarFacturaMedioPago = async (factura_medio_pago) => {
  const [rows] = await poolFactoring.query(
    `INSERT INTO factura_medio_pago (
      facturamediopagoid,
      _idfactura,
      id,
      medio_pago_codigo,
      cuenta_bancaria
      ) VALUES (?,?,?,?,?)`,
    [factura_medio_pago.facturamediopagoid, factura_medio_pago._idfactura, factura_medio_pago.id, factura_medio_pago.medio_pago_codigo, factura_medio_pago.cuenta_bancaria]
  );
  //logger.info(line(),rows);

  if (rows.length <= 0) {
    throw new Error("BD Logica. Uh oh!");
  }

  return rows;
};
