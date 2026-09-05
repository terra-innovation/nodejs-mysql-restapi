import * as contactoController from "#root/src/controllers/empresario/contacto.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Empresario
router.get("/empresario/contacto/listar", isAuth, isRole([3]), catchedAsync(contactoController.getContactos));
router.post("/empresario/contacto/crear", isAuth, isRole([3]), catchedAsync(contactoController.createContacto));
router.patch("/empresario/contacto/actualizar/:id", isAuth, isRole([3]), catchedAsync(contactoController.updateContacto));
router.get("/empresario/contacto/master", isAuth, isRole([3]), catchedAsync(contactoController.getContactoMaster));

export default router;
