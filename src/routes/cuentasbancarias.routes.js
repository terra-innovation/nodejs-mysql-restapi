import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as cuentasbancariasController from "#src/controllers/cuentasbancariasController.js";
import { verifyToken, checkRole } from "#src/middlewares/authMiddleware.js";

const router = Router();

//Mio
router.post("/cuentasbancarias/mio/listar/empresaid/activo/:id", verifyToken, checkRole([2]), catchedAsync(cuentasbancariasController.getCuentasbancariasMiosByEmpresaidActivos));

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
