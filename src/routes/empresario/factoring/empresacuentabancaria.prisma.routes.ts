import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as empresacuentabancariaController from "#src/controllers/empresario/factoring/empresacuentabancaria.prisma.Controller.js";
import * as empresacuentabancariaMiddleware from "#src/middlewares/empresacuentabancariaMiddleware.js";
import { verifyToken, checkRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Empresario
router.post("/empresario/factoring/empresacuentabancaria/listar", verifyToken, checkRole([3]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancarias));
router.post("/empresario/factoring/empresacuentabancaria/crear", verifyToken, checkRole([3]), empresacuentabancariaMiddleware.upload, catchedAsync(empresacuentabancariaController.createEmpresacuentabancaria));
router.get("/empresario/factoring/empresacuentabancaria/master", verifyToken, checkRole([3]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancariaMaster));

export default router;
