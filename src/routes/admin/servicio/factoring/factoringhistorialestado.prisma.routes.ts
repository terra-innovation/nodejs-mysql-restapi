import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as factoringhistorialestadoController from "#src/controllers/admin/servicio/factoring/factoringhistorialestado.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Empresario
//router.get("/admin/servicio/factoring/factoringhistorialestado/listar", isAuth, isRole([2]), catchedAsync(factoringhistorialestadoController.getFactoringhistorialestados));
router.post("/admin/servicio/factoring/factoringhistorialestado/crear", isAuth, isRole([2]), catchedAsync(factoringhistorialestadoController.createFactoringhistorialestado));
router.patch("/admin/servicio/factoring/factoringhistorialestado/actualizar/:id", isAuth, isRole([2]), catchedAsync(factoringhistorialestadoController.updateFactoringhistorialestado));
router.get("/admin/servicio/factoring/factoringhistorialestado/master", isAuth, isRole([2]), catchedAsync(factoringhistorialestadoController.getFactoringhistorialestadoMaster));
router.delete("/admin/servicio/factoring/factoringhistorialestado/eliminar/:id", isAuth, isRole([2]), catchedAsync(factoringhistorialestadoController.deleteFactoringhistorialestado));
router.patch("/admin/servicio/factoring/factoringhistorialestado/activar/:id", isAuth, isRole([2]), catchedAsync(factoringhistorialestadoController.activateFactoringhistorialestado));

router.get("/admin/servicio/factoring/factoringhistorialestado/buscar/factoring/:id", isAuth, isRole([2]), catchedAsync(factoringhistorialestadoController.getFactoringhistorialestadosByFactoringid));

export default router;
