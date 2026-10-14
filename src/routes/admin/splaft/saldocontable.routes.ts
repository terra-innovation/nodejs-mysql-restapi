import { Router } from "express";
import * as controller from "#src/controllers/admin/splaft/saldocontable.Controller.js";
import { isAuth, isRole } from "#src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";

const router = Router();
const base = "/admin/splaft/saldocontable";
router.use(base, isAuth, isRole([2]));
router.get(`${base}/listar`, catchedAsync(controller.listar));
router.get(`${base}/master`, catchedAsync(controller.catalogos));
router.post(base, catchedAsync(controller.crear));
router.get(`${base}/:id/sugerencias`, catchedAsync(controller.sugerencias));
router.get(`${base}/:id`, catchedAsync(controller.detalle));
router.patch(`${base}/:id`, catchedAsync(controller.mutar));
export default router;
