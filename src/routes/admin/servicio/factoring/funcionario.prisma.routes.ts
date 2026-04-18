import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as funcionarioController from "#src/controllers/admin/servicio/factoring/funcionario.prisma.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";

const router = Router();

//Admin

router.get("/admin/servicio/factoring/funcionario/buscar/empresa/:id", isAuth, isRole([2]), catchedAsync(funcionarioController.getFuncionariosByEmpresaid));

export default router;
