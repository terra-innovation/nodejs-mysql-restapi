import { poolFactoring } from "../config/bd/mysql2_db_factoring.js";

export const index = (req, res) => res.json({ message: "welcome to my api" });

export const ping = async (req, res) => {
  const [result] = await poolFactoring.query('SELECT "pong" as result');
  res.json(result[0]);
};
