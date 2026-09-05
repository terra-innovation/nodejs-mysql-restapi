import * as funcionarioController from "#root/src/controllers/admin/servicio/factoring/funcionario.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Admin

router.get("/admin/servicio/factoring/funcionario/buscar/empresa/:id", isAuth, isRole([2]), catchedAsync(funcionarioController.getFuncionariosByEmpresaid));

export default router;
