import { Router } from "express";
import { catchedAsync } from "../../utils/catchedAsync.js";
import * as empresacuentabancariaController from "../../controllers/admin/empresacuentabancariaController.js";
import { verifyToken, checkRole } from "../../middlewares/authMiddleware.js";

const router = Router();

//Admin
router.get("/admin/empresacuentabancaria/listar", verifyToken, checkRole([2]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancarias));
router.post("/admin/empresacuentabancaria/crear", verifyToken, checkRole([2]), catchedAsync(empresacuentabancariaController.createEmpresacuentabancaria));
router.patch("/admin/empresacuentabancaria/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(empresacuentabancariaController.updateEmpresacuentabancariaOnlyAliasAndCuentaBancariaEstado));
router.get("/admin/empresacuentabancaria/master", verifyToken, checkRole([2]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancariaMaster));
router.delete("/admin/empresacuentabancaria/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(empresacuentabancariaController.deleteEmpresacuentabancaria));
router.patch("/admin/empresacuentabancaria/activar/:id", verifyToken, checkRole([2]), catchedAsync(empresacuentabancariaController.activateEmpresacuentabancaria));

export default router;
