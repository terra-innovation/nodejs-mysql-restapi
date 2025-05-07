import { poolFactoring } from "#src/config/bd/mysql2_db_factoring.js";
import logger, { line, log } from "#src/utils/logger.js";
import { safeRollback } from "#src/utils/transactionUtils.js";

export const index = (transaction, res) => res.json({ message: "welcome to my api" });

export const ping = async (req, res) => {
  log.debug(line(), "controller::ping");
  const [result] = await poolFactoring.query('SELECT "pong" as result');
  res.json(result[0]);
};
