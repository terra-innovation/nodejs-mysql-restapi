import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as inversionistacuentabancariaController from "#src/controllers/admin/inversionistacuentabancaria.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Admin
router.get("/admin/inversionistacuentabancaria/listar", isAuth, isRole([2]), catchedAsync(inversionistacuentabancariaController.getInversionistacuentabancarias));
router.post("/admin/inversionistacuentabancaria/crear", isAuth, isRole([2]), catchedAsync(inversionistacuentabancariaController.createInversionistacuentabancaria));
router.patch("/admin/inversionistacuentabancaria/actualizar/:id", isAuth, isRole([2]), catchedAsync(inversionistacuentabancariaController.updateInversionistacuentabancariaOnlyAliasAndCuentaBancariaEstado));
router.get("/admin/inversionistacuentabancaria/master", isAuth, isRole([2]), catchedAsync(inversionistacuentabancariaController.getInversionistacuentabancariaMaster));
router.delete("/admin/inversionistacuentabancaria/eliminar/:id", isAuth, isRole([2]), catchedAsync(inversionistacuentabancariaController.deleteInversionistacuentabancaria));
router.patch("/admin/inversionistacuentabancaria/activar/:id", isAuth, isRole([2]), catchedAsync(inversionistacuentabancariaController.activateInversionistacuentabancaria));

export default router;
