import * as registrooperacionController from "#root/src/controllers/admin/splaft/registrooperacion.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Admin
router.get("/admin/splaft/registrooperacion/listar", isAuth, isRole([2]), catchedAsync(registrooperacionController.getSplaftRegistroOperaciones));

export default router;
