import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as inversionistacuentabancariaController from "#src/controllers/inversionista/inversionistacuentabancaria.prisma.Controller.js";
import { verifyToken, checkRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Empresario
router.get("/inversionista/inversionistacuentabancaria/listar", verifyToken, checkRole([2]), catchedAsync(inversionistacuentabancariaController.getInversionistacuentabancarias));
router.post("/inversionista/inversionistacuentabancaria/crear", verifyToken, checkRole([2]), catchedAsync(inversionistacuentabancariaController.createInversionistacuentabancaria));
router.patch("/inversionista/inversionistacuentabancaria/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(inversionistacuentabancariaController.updateInversionistacuentabancariaOnlyAlias));
router.get("/inversionista/inversionistacuentabancaria/master", verifyToken, checkRole([2]), catchedAsync(inversionistacuentabancariaController.getInversionistacuentabancariaMaster));

export default router;
