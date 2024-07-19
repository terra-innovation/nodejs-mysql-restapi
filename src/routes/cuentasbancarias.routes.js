import { Router } from "express";
import { catchedAsync } from "../utils/catchedAsync.js";
import * as cuentasbancariasController from "../controllers/cuentasbancariasController.js";
import { verifyToken, checkRole } from "../middlewares/authMiddleware.js";

const router = Router();

//Empresario
router.get("/cuentasbancarias/empresario/listar", verifyToken, checkRole([2]), catchedAsync(cuentasbancariasController.getCuentasbancariasEmpresario));

//Mio
router.post("/cuentasbancarias/mio/listar/empresaid/activo/:id", verifyToken, checkRole([2]), catchedAsync(cuentasbancariasController.getCuentasbancariasMiosByEmpresaidActivos));

// GET all Factorings Master
router.get("/cuentasbancarias/master", verifyToken, checkRole([2]), catchedAsync(cuentasbancariasController.getCuentasbancariasMaster));

// GET all Cuentasbancarias
router.get("/cuentasbancarias/listar", verifyToken, checkRole([2]), catchedAsync(cuentasbancariasController.getCuentasbancarias));

// GET Cuentabancaria
router.get("/cuentasbancarias/listar/:id", verifyToken, checkRole([2]), catchedAsync(cuentasbancariasController.getCuentabancaria));

// INSERT Cuentabancaria
router.post("/cuentasbancarias/crear", verifyToken, checkRole([2]), catchedAsync(cuentasbancariasController.createCuentabancaria));

// UPDATE Cuentabancaria
router.patch("/cuentasbancarias/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(cuentasbancariasController.updateCuentabancaria));

// DELETE Cuentabancaria
router.delete("/cuentasbancarias/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(cuentasbancariasController.deleteCuentabancaria));

export default router;
