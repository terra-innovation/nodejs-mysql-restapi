import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as archivofacturaController from "#src/controllers/admin/archivofacturaController.js";
import { verifyToken, checkRole } from "#src/middlewares/authMiddleware.js";

const router = Router();

//Admin
router.get("/admin/archivofactura/buscar/factoring/:id", verifyToken, checkRole([2]), catchedAsync(archivofacturaController.getArchivofacturasByFactoringid));

export default router;
