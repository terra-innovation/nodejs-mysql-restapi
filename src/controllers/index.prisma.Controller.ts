import { poolFactoring } from "#src/config/bd/mysql2_db_factoring.js";
import { log, line } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";

export const index = (req: Request, res: Response) => res.json({ message: "welcome to my api" });

export const ping = async (req: Request, res: Response) => {
  log.debug(line(), "controller::ping");
  const [result] = await poolFactoring.query('SELECT "pong" as result');
  res.json(result[0]);
};
