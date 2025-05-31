import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as menuController from "#src/controllers/usuario/menu.prisma.Controller.js";
import { verifyToken, checkRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Usuario
router.get("/usuario/menu/listar", verifyToken, checkRole([2]), catchedAsync(menuController.getMenu));

export default router;
