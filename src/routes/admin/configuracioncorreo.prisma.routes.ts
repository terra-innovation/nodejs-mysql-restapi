import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as configuracioncorreoController from "#src/controllers/admin/configuracioncorreo.prisma.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";

const router = Router();

//Admin
router.get("/admin/configuracioncorreo/listar", isAuth, isRole([2]), catchedAsync(configuracioncorreoController.getConfiguracioncorreos));
router.post("/admin/configuracioncorreo/crear", isAuth, isRole([2]), catchedAsync(configuracioncorreoController.createConfiguracioncorreo));
router.patch("/admin/configuracioncorreo/actualizar/:id", isAuth, isRole([2]), catchedAsync(configuracioncorreoController.updateConfiguracioncorreo));
router.get("/admin/configuracioncorreo/master", isAuth, isRole([2]), catchedAsync(configuracioncorreoController.getConfiguracioncorreoMaster));
router.delete("/admin/configuracioncorreo/eliminar/:id", isAuth, isRole([2]), catchedAsync(configuracioncorreoController.deleteConfiguracioncorreo));
router.patch("/admin/configuracioncorreo/activar/:id", isAuth, isRole([2]), catchedAsync(configuracioncorreoController.activateConfiguracioncorreo));
router.post("/admin/configuracioncorreo/validar/:id", isAuth, isRole([2]), catchedAsync(configuracioncorreoController.testConfiguracioncorreo));

export default router;
