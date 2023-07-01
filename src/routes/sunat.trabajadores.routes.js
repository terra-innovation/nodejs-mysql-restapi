import { Router } from "express";
import {
  getTrabajadoresPorRuc
} from "../controllers/sunat.trabajadores.controller.js";

import {verifyToken} from "../middleware/auth.js";

const router = Router();


// GET all Employees by RUC
router.get("/trabajadores/:ruc", verifyToken, getTrabajadoresPorRuc);



export default router;
