import * as accionistaController from "#root/src/controllers/admin/servicio/factoring/accionista.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Admin

router.get("/admin/servicio/factoring/accionista/buscar/empresa/:id", isAuth, isRole([2]), catchedAsync(accionistaController.getAccionistasByEmpresaid));

export default router;
