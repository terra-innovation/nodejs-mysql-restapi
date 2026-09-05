import { Router } from "express";

import usuario_archivoRoutes from "#root/src/routes/usuario/archivo.routes.js";
import usuario_credencialRoutes from "#root/src/routes/usuario/credencial.routes.js";
import usuario_menuRoutes from "#root/src/routes/usuario/menu.routes.js";
import usuario_personaRoutes from "#root/src/routes/usuario/persona.routes.js";
import usuario_usuarioRoutes from "#root/src/routes/usuario/usuario.routes.js";
import usuario_usuarioservicioRoutes from "#root/src/routes/usuario/usuarioservicio.routes.js";

const router = Router();

router.use(usuario_usuarioRoutes);
router.use(usuario_personaRoutes);
router.use(usuario_archivoRoutes);
router.use(usuario_usuarioservicioRoutes);
router.use(usuario_credencialRoutes);
router.use(usuario_menuRoutes);

export default router;
