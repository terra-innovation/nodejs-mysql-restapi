import * as empresacuentabancariaController from "#root/src/controllers/empresario/factoring/empresacuentabancaria.Controller.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";

const router = Router();

//Empresario
router.post("/empresario/servicio/factoring/empresacuentabancaria/listar", isAuth, isRole([3]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancarias));
router.post("/empresario/servicio/factoring/empresacuentabancaria/crear", isAuth, isRole([3]), catchedAsync(empresacuentabancariaController.createEmpresacuentabancaria));
router.get("/empresario/servicio/factoring/empresacuentabancaria/master", isAuth, isRole([3]), catchedAsync(empresacuentabancariaController.getEmpresacuentabancariaMaster));

export default router;
