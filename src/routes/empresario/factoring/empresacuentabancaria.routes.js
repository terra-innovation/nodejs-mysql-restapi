import { Router } from "express";
import { catchedAsync } from "../../../utils/catchedAsync.js";
import * as empresacuentabancariaController from "../../../controllers/empresario/factoring/empresacuentabancariaController.js";
import { verifyToken, checkRole } from "../../../middlewares/authMiddleware.js";

const router = Router();

//Empresario
router.post("/empresario/factoring/empresacuentabancaria/listar", verifyToken, checkRole([2]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancarias));
//router.post("/empresario/factoring/empresacuentabancaria/crear", verifyToken, checkRole([2]), catchedAsync(empresacuentabancariaController.createEmpresacuentabancaria));
//router.patch("/empresario/factoring/empresacuentabancaria/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(empresacuentabancariaController.updateEmpresacuentabancariaOnlyAlias));
//router.get("/empresario/factoring/empresacuentabancaria/master", verifyToken, checkRole([2]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancariaMaster));

export default router;
