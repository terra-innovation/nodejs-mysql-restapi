import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as contactoController from "#src/controllers/empresario/factoring/contacto.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Empresario
router.post("/empresario/servicio/factoring/contacto/listar", isAuth, isRole([3]), catchedAsync(contactoController.getContactos));
router.post("/empresario/servicio/factoring/contacto/crear", isAuth, isRole([3]), catchedAsync(contactoController.createContacto));
router.post("/empresario/servicio/factoring/contacto/master", isAuth, isRole([3]), catchedAsync(contactoController.getContactoMaster));

export default router;
