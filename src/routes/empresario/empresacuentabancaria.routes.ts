import * as empresacuentabancariaController from "#root/src/controllers/empresario/empresacuentabancaria.Controller.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";

const router = Router();

//Empresario
router.get("/empresario/empresacuentabancaria/listar", isAuth, isRole([3]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancarias));
router.post("/empresario/empresacuentabancaria/crear", isAuth, isRole([3]), catchedAsync(empresacuentabancariaController.createEmpresacuentabancaria));
router.patch("/empresario/empresacuentabancaria/actualizar/:id", isAuth, isRole([3]), catchedAsync(empresacuentabancariaController.updateEmpresacuentabancariaOnlyAlias));
router.get("/empresario/empresacuentabancaria/master", isAuth, isRole([3]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancariaMaster));

export default router;
