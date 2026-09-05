import * as perfilController from "#root/src/controllers/usuario/credencial.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Usuario
router.patch("/usuario/credencial/actualizar/:id", isAuth, isRole([5]), catchedAsync(perfilController.updateCredencial));
export default router;
