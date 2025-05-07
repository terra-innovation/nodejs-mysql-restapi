import { poolFactoring } from "#src/config/bd/mysql2_db_factoring";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const insertarFacturaNota = async (factura_nota) => {
  const [rows] = await poolFactoring.query(
    `INSERT INTO factura_nota (
      facturanotaid,
      _idfactura,
      id,     
      descripcion
      ) VALUES (?,
        ?,
        ?,
        ?
        )`,
    [factura_nota.facturanotaid, factura_nota._idfactura, factura_nota.id, factura_nota.descripcion]
  );

  if (rows.length <= 0) {
    throw new Error("BD Logica. Uh oh!");
  }

  return rows;
};
