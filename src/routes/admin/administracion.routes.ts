import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";
//import * as zlaboratorioController from "#src/controllers/admin/zlaboratorio.prisma.Controller.js";

import * as administracionbdController from "#root/src/controllers/admin/administracionbd.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";

const router = Router();

//Admin

router.get("/admin/administracion/timezones", isAuth, isRole([2]), catchedAsync(administracionbdController.getTimezones));

export default router;
