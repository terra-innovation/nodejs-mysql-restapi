import { Router } from "express";
import { catchedAsync } from "../../utils/catchedAsync.js";
import * as cuentasbancariasController from "../../controllers/empresario/cuentasbancariasController.js";
import { verifyToken, checkRole } from "../../middlewares/authMiddleware.js";

const router = Router();

//Empresario
router.get("/empresario/cuentasbancarias/listar", verifyToken, checkRole([2]), catchedAsync(cuentasbancariasController.getCuentasbancarias));
router.post("/empresario/cuentasbancarias/crear", verifyToken, checkRole([2]), catchedAsync(cuentasbancariasController.createCuentabancaria));
router.patch("/empresario/cuentasbancarias/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(cuentasbancariasController.updateCuentabancariaOnlyAlias));
router.get("/empresario/cuentasbancarias/master", verifyToken, checkRole([2]), catchedAsync(cuentasbancariasController.getCuentasbancariasMaster));

export default router;
