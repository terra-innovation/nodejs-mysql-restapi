import { Router } from "express";

import usuario_personaRoutes from "#src/routes/usuario/persona.prisma.routes.js";
import usuario_usuarioservicioRoutes from "#src/routes/usuario/usuarioservicio.prisma.routes.js";
import usuario_menuRoutes from "#src/routes/usuario/menu.prisma.routes.js";

const router = Router();

router.use(usuario_personaRoutes);
router.use(usuario_usuarioservicioRoutes);
router.use(usuario_menuRoutes);

export default router;
