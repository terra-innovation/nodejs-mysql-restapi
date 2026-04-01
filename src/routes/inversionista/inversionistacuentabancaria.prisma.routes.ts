import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as inversionistacuentabancariaController from "#src/controllers/inversionista/inversionistacuentabancaria.prisma.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";

const router = Router();

//Empresario
router.get("/inversionista/inversionistacuentabancaria/listar", isAuth, isRole([4]), catchedAsync(inversionistacuentabancariaController.getInversionistacuentabancarias));
router.post("/inversionista/inversionistacuentabancaria/crear", isAuth, isRole([4]), catchedAsync(inversionistacuentabancariaController.createInversionistacuentabancaria));
router.patch("/inversionista/inversionistacuentabancaria/actualizar/:id", isAuth, isRole([4]), catchedAsync(inversionistacuentabancariaController.updateInversionistacuentabancariaOnlyAlias));
router.get("/inversionista/inversionistacuentabancaria/master", isAuth, isRole([4]), catchedAsync(inversionistacuentabancariaController.getInversionistacuentabancariaMaster));

export default router;
