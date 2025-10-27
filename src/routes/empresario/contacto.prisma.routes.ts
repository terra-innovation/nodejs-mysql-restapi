import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as contactoController from "#src/controllers/empresario/contacto.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Empresario
router.get("/empresario/contacto/listar", isAuth, isRole([3]), catchedAsync(contactoController.getContactos));
router.post("/empresario/contacto/crear", isAuth, isRole([3]), catchedAsync(contactoController.createContacto));
router.patch("/empresario/contacto/actualizar/:id", isAuth, isRole([3]), catchedAsync(contactoController.updateContacto));
router.get("/empresario/contacto/master", isAuth, isRole([3]), catchedAsync(contactoController.getContactoMaster));

export default router;
