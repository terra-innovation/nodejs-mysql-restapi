import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as empresacuentabancariaController from "#src/controllers/empresario/empresacuentabancaria.prisma.Controller.js";
import * as empresacuentabancariaMiddleware from "#src/middlewares/empresacuentabancariaMiddleware.js";
import { verifyToken, checkRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Empresario
router.get("/empresario/empresacuentabancaria/listar", verifyToken, checkRole([2]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancarias));
router.post("/empresario/empresacuentabancaria/crear", verifyToken, checkRole([2]), empresacuentabancariaMiddleware.upload, catchedAsync(empresacuentabancariaController.createEmpresacuentabancaria));
router.patch("/empresario/empresacuentabancaria/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(empresacuentabancariaController.updateEmpresacuentabancariaOnlyAlias));
router.get("/empresario/empresacuentabancaria/master", verifyToken, checkRole([2]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancariaMaster));

export default router;
