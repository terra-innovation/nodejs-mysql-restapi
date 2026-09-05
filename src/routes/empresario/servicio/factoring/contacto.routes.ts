import * as contactoController from "#root/src/controllers/empresario/factoring/contacto.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Empresario
router.post("/empresario/servicio/factoring/contacto/listar", isAuth, isRole([3]), catchedAsync(contactoController.getContactos));
router.post("/empresario/servicio/factoring/contacto/crear", isAuth, isRole([3]), catchedAsync(contactoController.createContacto));
router.post("/empresario/servicio/factoring/contacto/master", isAuth, isRole([3]), catchedAsync(contactoController.getContactoMaster));

export default router;
