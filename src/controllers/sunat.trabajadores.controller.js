import { poolFactoring } from "../config/bd/db_factoring.js";

export const getEmployees = async (req, res) => {
  try {
    const [rows] = await poolFactoring.query("SELECT * FROM employee");
    res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const getTrabajadoresPorRuc = async (req, res) => {
  try {
    const { ruc } = req.params;
    const query = `
    SELECT se.ruc, se.nombreempresa, st.ano, st.mes, st.canttrabajador, st.cantpensionista, st.cantservicio, st.fechamod, CONCAT(se.ruc, " ", se.nombreempresa) AS empresa 
    FROM dwh_sunat_empresa se 
    INNER JOIN dwh_sunat_trabajador st ON st.ruc = se.ruc 
    WHERE se.ruc = ? 
    `;

    const [rows] = await poolFactoring.query(query, [ruc]);

    if (rows.length <= 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const deleteEmployee = async (req, res) => {
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
  try {
    const { name, salary } = req.body;
    const [rows] = await poolFactoring.query("INSERT INTO employee (name, salary) VALUES (?, ?)", [name, salary]);
    res.status(201).json({ id: rows.insertId, name, salary });
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const updateEmployee = async (req, res) => {
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
