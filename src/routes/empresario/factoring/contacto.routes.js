import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as contactoController from "#src/controllers/empresario/factoring/contactoController.js";
import { verifyToken, checkRole } from "#src/middlewares/authMiddleware.js";

const router = Router();

//Empresario
router.post("/empresario/factoring/contacto/listar", verifyToken, checkRole([2]), catchedAsync(contactoController.getContactos));
router.post("/empresario/factoring/contacto/crear", verifyToken, checkRole([2]), catchedAsync(contactoController.createContacto));
router.post("/empresario/factoring/contacto/master", verifyToken, checkRole([2]), catchedAsync(contactoController.getContactoMaster));

export default router;
