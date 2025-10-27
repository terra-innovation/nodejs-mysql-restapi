import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as empresacuentabancariaController from "#src/controllers/empresario/factoring/empresacuentabancaria.prisma.Controller.js";
import * as empresacuentabancariaMiddleware from "#src/middlewares/empresacuentabancariaMiddleware.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Empresario
router.post("/empresario/servicio/factoring/empresacuentabancaria/listar", isAuth, isRole([3]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancarias));
router.post("/empresario/servicio/factoring/empresacuentabancaria/crear", isAuth, isRole([3]), empresacuentabancariaMiddleware.upload, catchedAsync(empresacuentabancariaController.createEmpresacuentabancaria));
router.get("/empresario/servicio/factoring/empresacuentabancaria/master", isAuth, isRole([3]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancariaMaster));

export default router;
