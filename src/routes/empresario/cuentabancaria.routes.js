import { Router } from "express";
import { catchedAsync } from "../../utils/catchedAsync.js";
import * as cuentabancariaController from "../../controllers/empresario/cuentabancariaController.js";
import { verifyToken, checkRole } from "../../middlewares/authMiddleware.js";

const router = Router();

//Empresario
router.get("/empresario/cuentabancaria/listar", verifyToken, checkRole([2]), catchedAsync(cuentabancariaController.getCuentasbancarias));
router.post("/empresario/cuentabancaria/crear", verifyToken, checkRole([2]), catchedAsync(cuentabancariaController.createCuentabancaria));
router.patch("/empresario/cuentabancaria/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(cuentabancariaController.updateCuentabancariaOnlyAlias));
router.get("/empresario/cuentabancaria/master", verifyToken, checkRole([2]), catchedAsync(cuentabancariaController.getCuentasbancariasMaster));

export default router;
