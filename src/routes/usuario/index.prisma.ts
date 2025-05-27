import { Router } from "express";

import usuario_personaRoutes from "#src/routes/usuario/persona.routes.js";
import usuario_usuarioservicioRoutes from "#src/routes/usuario/usuarioservicio.routes.js";
import usuario_menuRoutes from "#src/routes/usuario/menu.routes.js";

const router = Router();

router.use(usuario_personaRoutes);
router.use(usuario_usuarioservicioRoutes);
router.use(usuario_menuRoutes);

export default router;
