import { poolFactoring } from "../config/bd/mysql2_db_factoring.js";
import { formatError } from "../utils/errorUtils.js";
import logger, { line } from "../utils/logger.js";

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
  //logger.info(line(),rows);

  if (rows.length <= 0) {
    throw new Error("BD Logica. Uh oh!");
  }

  return rows;
};
