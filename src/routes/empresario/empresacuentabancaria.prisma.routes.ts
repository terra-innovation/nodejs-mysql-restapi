import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as empresacuentabancariaController from "#src/controllers/empresario/empresacuentabancaria.prisma.Controller.js";
import * as empresacuentabancariaMiddleware from "#src/middlewares/empresacuentabancariaMiddleware.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Empresario
router.get("/empresario/empresacuentabancaria/listar", isAuth, isRole([3]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancarias));
router.post("/empresario/empresacuentabancaria/crear", isAuth, isRole([3]), empresacuentabancariaMiddleware.upload, catchedAsync(empresacuentabancariaController.createEmpresacuentabancaria));
router.patch("/empresario/empresacuentabancaria/actualizar/:id", isAuth, isRole([3]), catchedAsync(empresacuentabancariaController.updateEmpresacuentabancariaOnlyAlias));
router.get("/empresario/empresacuentabancaria/master", isAuth, isRole([3]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancariaMaster));

export default router;
