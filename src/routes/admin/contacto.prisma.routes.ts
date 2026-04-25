import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as contactoController from "#src/controllers/admin/contacto.prisma.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";

const router = Router();

//Admin
router.get("/admin/contacto/listar", isAuth, isRole([2]), catchedAsync(contactoController.getContactos));
router.post("/admin/contacto/crear", isAuth, isRole([2]), catchedAsync(contactoController.createContacto));
router.patch("/admin/contacto/actualizar/:id", isAuth, isRole([2]), catchedAsync(contactoController.updateContacto));
router.get("/admin/contacto/master", isAuth, isRole([2]), catchedAsync(contactoController.getContactoMaster));
router.delete("/admin/contacto/eliminar/:id", isAuth, isRole([2]), catchedAsync(contactoController.deleteContacto));
router.patch("/admin/contacto/activar/:id", isAuth, isRole([2]), catchedAsync(contactoController.activateContacto));

export default router;
