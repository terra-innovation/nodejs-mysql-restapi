import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as archivofacturaController from "#src/controllers/admin/archivofactura.prisma.Controller.js";
import { isAuth, isRole } from "#src/middlewares/auth.prisma.Middleware.js";

const router = Router();

//Admin
router.get("/admin/archivofactura/buscar/factoring/:id", isAuth, isRole([2]), catchedAsync(archivofacturaController.getArchivofacturasByFactoringid));

export default router;
