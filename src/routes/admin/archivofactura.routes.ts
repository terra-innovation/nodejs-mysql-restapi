import * as archivofacturaController from "#root/src/controllers/admin/archivofactura.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

//Admin
router.get("/admin/archivofactura/buscar/factoring/:id", isAuth, isRole([2]), catchedAsync(archivofacturaController.getArchivofacturasByFactoringid));

export default router;
