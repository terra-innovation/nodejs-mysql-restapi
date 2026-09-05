import * as empresacuentabancariaController from "#root/src/controllers/admin/empresacuentabancaria.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Admin
router.get("/admin/empresacuentabancaria/listar", isAuth, isRole([2]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancarias));
router.post("/admin/empresacuentabancaria/crear", isAuth, isRole([2]), catchedAsync(empresacuentabancariaController.createEmpresacuentabancaria));
router.patch("/admin/empresacuentabancaria/actualizar/:id", isAuth, isRole([2]), catchedAsync(empresacuentabancariaController.updateEmpresacuentabancariaOnlyAliasAndCuentaBancariaEstado));
router.get("/admin/empresacuentabancaria/master", isAuth, isRole([2]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancariaMaster));
router.delete("/admin/empresacuentabancaria/eliminar/:id", isAuth, isRole([2]), catchedAsync(empresacuentabancariaController.deleteEmpresacuentabancaria));
router.patch("/admin/empresacuentabancaria/activar/:id", isAuth, isRole([2]), catchedAsync(empresacuentabancariaController.activateEmpresacuentabancaria));

export default router;
