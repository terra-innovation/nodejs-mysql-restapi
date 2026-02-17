import * as servicioController from "#src/controllers/admin/servicio.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Admin
router.get("/admin/servicio/listar", isAuth, isRole([2]), catchedAsync(servicioController.getServicios));
router.post("/admin/servicio/crear", isAuth, isRole([2]), catchedAsync(servicioController.createServicio));
router.patch("/admin/servicio/actualizar/:id", isAuth, isRole([2]), catchedAsync(servicioController.updateServicio));
router.get("/admin/servicio/master", isAuth, isRole([2]), catchedAsync(servicioController.getServicioMaster));
router.delete("/admin/servicio/eliminar/:id", isAuth, isRole([2]), catchedAsync(servicioController.deleteServicio));
router.patch("/admin/servicio/activar/:id", isAuth, isRole([2]), catchedAsync(servicioController.activateServicio));

export default router;
