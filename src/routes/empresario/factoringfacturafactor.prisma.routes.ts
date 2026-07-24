import * as factoringfacturafactorController from "#root/src/controllers/empresario/factoringfacturafactor.prisma.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

router.get("/empresario/factoringfacturafactor/buscar/factoring/:factoringid", isAuth, isRole([3]), catchedAsync(factoringfacturafactorController.getFactoringfacturafactoresByFactoringid));
router.get("/empresario/factoringfacturafactor/descargar/archivo/:archivoid", isAuth, isRole([3]), catchedAsync(factoringfacturafactorController.downloadArchivoByArchivoid));

export default router;
