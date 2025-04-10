import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as contactoController from "#src/controllers/empresario/contactoController.js";
import { verifyToken, checkRole } from "#src/middlewares/authMiddleware.js";

const router = Router();

//Empresario
router.get("/empresario/contacto/listar", verifyToken, checkRole([2]), catchedAsync(contactoController.getContactos));
router.post("/empresario/contacto/crear", verifyToken, checkRole([2]), catchedAsync(contactoController.createContacto));
router.patch("/empresario/contacto/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(contactoController.updateContacto));
router.get("/empresario/contacto/master", verifyToken, checkRole([2]), catchedAsync(contactoController.getContactoMaster));

export default router;
