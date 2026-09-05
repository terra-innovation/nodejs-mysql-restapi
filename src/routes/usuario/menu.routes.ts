import * as menuController from "#root/src/controllers/usuario/menu.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Usuario
router.get("/usuario/menu/listar", isAuth, isRole([5]), catchedAsync(menuController.getMenu));

export default router;
