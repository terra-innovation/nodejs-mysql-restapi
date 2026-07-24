import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as factoringfacturafactorController from "#src/controllers/admin/servicio/factoring/factoringfacturafactor.prisma.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";

const router = Router();

//Admin

router.post("/admin/servicio/factoring/factoringfacturafactor/crear", isAuth, isRole([2]), catchedAsync(factoringfacturafactorController.createFactoringfacturafactor));
router.patch("/admin/servicio/factoring/factoringfacturafactor/actualizar/:id", isAuth, isRole([2]), catchedAsync(factoringfacturafactorController.updateFactoringfacturafactor));
router.get("/admin/servicio/factoring/factoringfacturafactor/master/factoring/:factoringid", isAuth, isRole([2]), catchedAsync(factoringfacturafactorController.getFactoringfacturafactorMasterByFactoringid));
router.delete("/admin/servicio/factoring/factoringfacturafactor/eliminar/:id", isAuth, isRole([2]), catchedAsync(factoringfacturafactorController.deleteFactoringfacturafactor));
router.patch("/admin/servicio/factoring/factoringfacturafactor/activar/:id", isAuth, isRole([2]), catchedAsync(factoringfacturafactorController.activateFactoringfacturafactor));

router.get("/admin/servicio/factoring/factoringfacturafactor/buscar/factoring/:id", isAuth, isRole([2]), catchedAsync(factoringfacturafactorController.getFactoringfacturafactoresByFactoringid));

export default router;
