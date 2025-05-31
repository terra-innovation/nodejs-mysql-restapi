import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as factoringhistorialestadoController from "#src/controllers/admin/servicio/factoring/factoringhistorialestado.prisma.Controller.js";
import { verifyToken, checkRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Empresario
//router.get("/admin/servicio/factoring/factoringhistorialestado/listar", verifyToken, checkRole([2]), catchedAsync(factoringhistorialestadoController.getFactoringhistorialestados));
router.post("/admin/servicio/factoring/factoringhistorialestado/crear", verifyToken, checkRole([2]), catchedAsync(factoringhistorialestadoController.createFactoringhistorialestado));
router.patch("/admin/servicio/factoring/factoringhistorialestado/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(factoringhistorialestadoController.updateFactoringhistorialestado));
router.get("/admin/servicio/factoring/factoringhistorialestado/master", verifyToken, checkRole([2]), catchedAsync(factoringhistorialestadoController.getFactoringhistorialestadoMaster));
router.delete("/admin/servicio/factoring/factoringhistorialestado/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(factoringhistorialestadoController.deleteFactoringhistorialestado));
router.patch("/admin/servicio/factoring/factoringhistorialestado/activar/:id", verifyToken, checkRole([2]), catchedAsync(factoringhistorialestadoController.activateFactoringhistorialestado));

router.get("/admin/servicio/factoring/factoringhistorialestado/buscar/factoring/:id", verifyToken, checkRole([2]), catchedAsync(factoringhistorialestadoController.getFactoringhistorialestadosByFactoringid));

export default router;
