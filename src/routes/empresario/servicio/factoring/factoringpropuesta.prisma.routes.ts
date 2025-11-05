import * as factoringpropuestaController from "#src/controllers/empresario/factoring/factoringpropuesta.prisma.Controller.js";
import { isRole, isAuth } from "#src/middlewares/auth.prisma.Middleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

const protectEmpresario = [isAuth, isRole([3])];

//Empresario
router.get("/empresario/servicio/factoring/factoringpropuesta/vigente/:factoringid", ...protectEmpresario, catchedAsync(factoringpropuestaController.getFactoringpropuestaVigente));
//router.get("/empresario/servicio/factoring/factoringpropuesta/listar", ...protectEmpresario, catchedAsync(factoringpropuestaController.getFactorings));
//router.post("/empresario/servicio/factoring/factoringpropuesta/crear", isAuth, isRole([3]), catchedAsync(factoringpropuestaController.createFactoring));
//router.patch("/empresario/servicio/factoring/factoringpropuesta/actualizar/:id", isAuth, isRole([3]), catchedAsync(factoringpropuestaController.updateFactoringOnlyAlias));
//router.get("/empresario/servicio/factoring/factoringpropuesta/master", isAuth, isRole([3]), catchedAsync(factoringpropuestaController.getFactoringMaster));

export default router;
