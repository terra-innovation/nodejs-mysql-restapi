import * as factoringcarteraController from "#root/src/controllers/admin/factoringcartera.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Admin
router.get("/admin/servicio/factoring/factoringcartera/resumen", isAuth, isRole([2]), catchedAsync(factoringcarteraController.getFactoringcarteraResumen));

export default router;
