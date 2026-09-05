import * as factoringtransferenciacedenteController from "#root/src/controllers/admin/servicio/factoring/factoringtransferenciacedente.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Admin

router.post("/admin/servicio/factoring/factoringtransferenciacedente/crear", isAuth, isRole([2]), catchedAsync(factoringtransferenciacedenteController.createFactoringtransferenciacedente));
router.patch("/admin/servicio/factoring/factoringtransferenciacedente/actualizar/:id", isAuth, isRole([2]), catchedAsync(factoringtransferenciacedenteController.updateFactoringtransferenciacedente));
router.get("/admin/servicio/factoring/factoringtransferenciacedente/master/factoring/:factoringid", isAuth, isRole([2]), catchedAsync(factoringtransferenciacedenteController.getFactoringtransferenciacedenteMasterByFactoringid));
router.delete("/admin/servicio/factoring/factoringtransferenciacedente/eliminar/:id", isAuth, isRole([2]), catchedAsync(factoringtransferenciacedenteController.deleteFactoringtransferenciacedente));
router.patch("/admin/servicio/factoring/factoringtransferenciacedente/activar/:id", isAuth, isRole([2]), catchedAsync(factoringtransferenciacedenteController.activateFactoringtransferenciacedente));

router.get("/admin/servicio/factoring/factoringtransferenciacedente/buscar/factoring/:id", isAuth, isRole([2]), catchedAsync(factoringtransferenciacedenteController.getFactoringtransferenciacedentesByFactoringid));
router.patch("/admin/servicio/factoring/factoringtransferenciacedente/enviar/correo/:id", isAuth, isRole([2]), catchedAsync(factoringtransferenciacedenteController.sendCorreoFactoringtransferenciacedente));

export default router;
