import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as menuController from "#src/controllers/usuario/menu.prisma.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";

const router = Router();

//Usuario
router.get("/usuario/menu/listar", isAuth, isRole([5]), catchedAsync(menuController.getMenu));

export default router;
