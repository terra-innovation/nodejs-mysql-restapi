import { Router } from "express";
import { catchedAsync } from "../utils/catchedAsync.js";
import * as factoringtiposController from "../controllers/factoringtiposController.js";
import { verifyToken, checkRole } from "../middlewares/authMiddleware.js";

const router = Router();

// GET all Factoringtipos
router.get("/factoringtipos/listar", verifyToken, checkRole([2]), catchedAsync(factoringtiposController.getFactoringtipos));

// GET Factoringtipo
router.get("/factoringtipos/listar/:id", verifyToken, checkRole([2]), catchedAsync(factoringtiposController.getFactoringtipo));

// INSERT Factoringtipo
router.post("/factoringtipos/crear", verifyToken, checkRole([2]), catchedAsync(factoringtiposController.createFactoringtipo));

// UPDATE Factoringtipo
router.patch("/factoringtipos/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(factoringtiposController.updateFactoringtipo));

// DELETE Factoringtipo
router.delete("/factoringtipos/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(factoringtiposController.deleteFactoringtipo));

export default router;
