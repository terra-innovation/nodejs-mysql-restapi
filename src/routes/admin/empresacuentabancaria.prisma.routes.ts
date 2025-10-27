import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as empresacuentabancariaController from "#src/controllers/admin/empresacuentabancaria.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Admin
router.get("/admin/empresacuentabancaria/listar", isAuth, isRole([2]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancarias));
router.post("/admin/empresacuentabancaria/crear", isAuth, isRole([2]), catchedAsync(empresacuentabancariaController.createEmpresacuentabancaria));
router.patch("/admin/empresacuentabancaria/actualizar/:id", isAuth, isRole([2]), catchedAsync(empresacuentabancariaController.updateEmpresacuentabancariaOnlyAliasAndCuentaBancariaEstado));
router.get("/admin/empresacuentabancaria/master", isAuth, isRole([2]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancariaMaster));
router.delete("/admin/empresacuentabancaria/eliminar/:id", isAuth, isRole([2]), catchedAsync(empresacuentabancariaController.deleteEmpresacuentabancaria));
router.patch("/admin/empresacuentabancaria/activar/:id", isAuth, isRole([2]), catchedAsync(empresacuentabancariaController.activateEmpresacuentabancaria));

export default router;
