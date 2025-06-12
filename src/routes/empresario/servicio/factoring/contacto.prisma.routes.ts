import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as contactoController from "#src/controllers/empresario/factoring/contacto.prisma.Controller.js";
import { verifyToken, checkRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Empresario
router.post("/empresario/servicio/factoring/contacto/listar", verifyToken, checkRole([3]), catchedAsync(contactoController.getContactos));
router.post("/empresario/servicio/factoring/contacto/crear", verifyToken, checkRole([3]), catchedAsync(contactoController.createContacto));
router.post("/empresario/servicio/factoring/contacto/master", verifyToken, checkRole([3]), catchedAsync(contactoController.getContactoMaster));

export default router;
