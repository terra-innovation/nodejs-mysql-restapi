import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as accionistaController from "#src/controllers/admin/servicio/factoring/accionista.prisma.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";

const router = Router();

//Admin

router.get("/admin/servicio/factoring/accionista/buscar/empresa/:id", isAuth, isRole([2]), catchedAsync(accionistaController.getAccionistasByEmpresaid));

export default router;
