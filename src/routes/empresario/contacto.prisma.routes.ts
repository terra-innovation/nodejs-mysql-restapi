import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as contactoController from "#src/controllers/empresario/contacto.prisma.Controller.js";
import { verifyToken, checkRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Empresario
router.get("/empresario/contacto/listar", verifyToken, checkRole([3]), catchedAsync(contactoController.getContactos));
router.post("/empresario/contacto/crear", verifyToken, checkRole([3]), catchedAsync(contactoController.createContacto));
router.patch("/empresario/contacto/actualizar/:id", verifyToken, checkRole([3]), catchedAsync(contactoController.updateContacto));
router.get("/empresario/contacto/master", verifyToken, checkRole([3]), catchedAsync(contactoController.getContactoMaster));

export default router;
