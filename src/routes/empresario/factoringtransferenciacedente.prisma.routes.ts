import * as factoringtransferenciacedenteController from "#root/src/controllers/empresario/factoringtransferenciacedente.prisma.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

router.get("/empresario/factoringtransferenciacedente/buscar/factoring/:factoringid", isAuth, isRole([3]), catchedAsync(factoringtransferenciacedenteController.getFactoringtransferenciacedentesByFactoringid));
router.get("/empresario/factoringtransferenciacedente/descargar/:factoringtransferenciacedenteid", isAuth, isRole([3]), catchedAsync(factoringtransferenciacedenteController.downloadConstanciaFactoringtransferenciacedente));

export default router;
