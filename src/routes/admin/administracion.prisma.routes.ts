import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
//import * as zlaboratorioController from "#src/controllers/admin/zlaboratorio.prisma.Controller.js";

import * as administracionbdController from "#src/controllers/admin/administracionbd.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Admin

router.get("/admin/administracion/timezones", isAuth, isRole([2]), catchedAsync(administracionbdController.getTimezones));

export default router;
