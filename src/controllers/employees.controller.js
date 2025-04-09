import { poolFactoring } from "../config/bd/mysql2_db_factoring.js";
import logger, { line } from "../utils/logger.js";
import { safeRollback } from "../utils/transactionUtils.js";

export const getEmployees = async (req, res) => {
  logger.debug(line(), "controller::getEmployees");
  try {
    const [rows] = await poolFactoring.query("SELECT * FROM employee");
    res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const getEmployee = async (req, res) => {
  logger.debug(line(), "controller::getEmployee");
  try {
    const { id } = req.params;
    const [rows] = await poolFactoring.query("SELECT * FROM employee WHERE id = ?", [id]);

    if (rows.length <= 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const deleteEmployee = async (req, res) => {
  logger.debug(line(), "controller::deleteEmployee");
  try {
    const { id } = req.params;
    const [rows] = await poolFactoring.query("DELETE FROM employee WHERE id = ?", [id]);

    if (rows.affectedRows <= 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const createEmployee = async (req, res) => {
  logger.debug(line(), "controller::createEmployee");
  try {
    const { name, salary } = req.body;
    const [rows] = await poolFactoring.query("INSERT INTO employee (name, salary) VALUES (?, ?)", [name, salary]);
    res.status(201).json({ id: rows.insertId, name, salary });
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const updateEmployee = async (req, res) => {
  logger.debug(line(), "controller::updateEmployee");
  try {
    const { id } = req.params;
    const { name, salary } = req.body;

    const [result] = await poolFactoring.query("UPDATE employee SET name = IFNULL(?, name), salary = IFNULL(?, salary) WHERE id = ?", [name, salary, id]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Employee not found" });

    const [rows] = await poolFactoring.query("SELECT * FROM employee WHERE id = ?", [id]);

    res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};
