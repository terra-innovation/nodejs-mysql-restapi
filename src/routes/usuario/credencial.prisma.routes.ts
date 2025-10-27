import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as perfilController from "#root/src/controllers/usuario/credencial.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Usuario
router.patch("/usuario/credencial/actualizar/:id", isAuth, isRole([5]), catchedAsync(perfilController.updateCredencial));
export default router;
