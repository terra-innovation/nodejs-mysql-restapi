import { Router } from "express";
import { catchedAsync } from "../../utils/catchedAsync.js";
import * as personapepindirectoController from "../../controllers/usuario/personapepindirectoController.js";
import { verifyToken, checkRole } from "../../middlewares/authMiddleware.js";

const router = Router();

//Usuario

//router.get("/usuario/personapepindirecto/listar", verifyToken, checkRole([2]), catchedAsync(personapepindirectoController.getPersonapepindirectopepdirectos));
router.post("/usuario/personapepindirecto/crear", verifyToken, checkRole([2]), catchedAsync(personapepindirectoController.createPersonapepindirecto));
//router.patch("/usuario/personapepindirecto/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(personapepindirectoController.updatePersonapepindirectoOnlyAlias));
//router.get("/usuario/personapepindirecto/master", verifyToken, checkRole([2]), catchedAsync(personapepindirectoController.getPersonapepindirectoMaster));

export default router;