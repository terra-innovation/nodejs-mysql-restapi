import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as menuController from "#src/controllers/usuario/menuController.js";
import { verifyToken, checkRole } from "#src/middlewares/authMiddleware.js";

const router = Router();

//Usuario
router.get("/usuario/menu/listar", verifyToken, checkRole([2]), catchedAsync(menuController.getMenu));

export default router;
