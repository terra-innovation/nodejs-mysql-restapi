import { poolFactoring } from "../config/bd/mysql2_db_factoring.js";
import logger, { line } from "../utils/logger.js";

export const index = (transaction, res) => res.json({ message: "welcome to my api" });

export const ping = async (req, res) => {
  logger.debug(line(), "controller::ping");
  const [result] = await poolFactoring.query('SELECT "pong" as result');
  res.json(result[0]);
};
