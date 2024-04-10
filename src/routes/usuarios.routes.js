import { Router } from "express";
import { catchedAsync } from "../utils/catchedAsync.js";
import * as usuariosController from "../controllers/usuariosController.js";
import { verifyToken, checkRole } from "../middlewares/authMiddleware.js";

const router = Router();

//Mio
router.post("/usuarios/mio/contacto", verifyToken, checkRole([2]), catchedAsync(usuariosController.getUsuarioContactoMio));

// GET all Usuarios
router.get("/usuarios/listar", verifyToken, checkRole([2]), catchedAsync(usuariosController.getUsuarios));

// GET Cuentabancaria
router.get("/usuarios/listar/:id", verifyToken, checkRole([2]), catchedAsync(usuariosController.getCuentabancaria));

// INSERT Cuentabancaria
router.post("/usuarios/crear", verifyToken, checkRole([2]), catchedAsync(usuariosController.createCuentabancaria));

// UPDATE Cuentabancaria
router.patch("/usuarios/actualizar/:id", verifyToken, checkRole([2]), catchedAsync(usuariosController.updateCuentabancaria));

// DELETE Cuentabancaria
router.delete("/usuarios/eliminar/:id", verifyToken, checkRole([2]), catchedAsync(usuariosController.deleteCuentabancaria));

export default router;
