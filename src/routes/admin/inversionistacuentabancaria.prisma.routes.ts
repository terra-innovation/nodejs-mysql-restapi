import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as inversionistacuentabancariaController from "#src/controllers/admin/inversionistacuentabancaria.prisma.Controller.js";
import { verifyToken, checkRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Admin
router.get("/admin/inversionistacuentabancaria/listar", verifyToken, checkRole([2]), catchedAsync(inversionistacuentabancariaController.getInversionistacuentabancarias));
router.post("/admin/inversionistacuentabancaria/crear", verifyToken, checkRole([2]), catchedAsync(inversionistacuentabancariaController.createInversionistacuentabancaria));
router.patch("/admin/inversionistacuentabancaria/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(inversionistacuentabancariaController.updateInversionistacuentabancariaOnlyAliasAndCuentaBancariaEstado));
router.get("/admin/inversionistacuentabancaria/master", verifyToken, checkRole([2]), catchedAsync(inversionistacuentabancariaController.getInversionistacuentabancariaMaster));
router.delete("/admin/inversionistacuentabancaria/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(inversionistacuentabancariaController.deleteInversionistacuentabancaria));
router.patch("/admin/inversionistacuentabancaria/activar/:id", verifyToken, checkRole([2]), catchedAsync(inversionistacuentabancariaController.activateInversionistacuentabancaria));

export default router;
