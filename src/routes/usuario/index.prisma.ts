import { Router } from "express";

import usuario_usuarioRoutes from "#src/routes/usuario/usuario.prisma.routes.js";
import usuario_personaRoutes from "#src/routes/usuario/persona.prisma.routes.js";
import usuario_usuarioservicioRoutes from "#src/routes/usuario/usuarioservicio.prisma.routes.js";
import usuario_credencialRoutes from "#root/src/routes/usuario/credencial.prisma.routes.js";
import usuario_menuRoutes from "#src/routes/usuario/menu.prisma.routes.js";

const router = Router();

router.use(usuario_usuarioRoutes);
router.use(usuario_personaRoutes);
router.use(usuario_usuarioservicioRoutes);
router.use(usuario_credencialRoutes);
router.use(usuario_menuRoutes);

export default router;
