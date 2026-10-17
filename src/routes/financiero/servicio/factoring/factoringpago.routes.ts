import { Router } from "express";
import { isAuth, isRole } from "#src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { consulta } from "#src/controllers/financiero/servicio/factoring/factoringpago.Controller.js";

const router = Router();
router.get("/financiero/servicio/factoring/factoringpago/:factoringid", isAuth, isRole([6]), catchedAsync(consulta));
export default router;
