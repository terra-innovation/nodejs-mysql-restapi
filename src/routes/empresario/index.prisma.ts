import { Router } from "express";

import empresario_usuarioservicioempresaRoutes from "#root/src/routes/empresario/usuarioservicioempresa.prisma.routes.js";
import empresario_contactoRoutes from "#src/routes/empresario/contacto.prisma.routes.js";
import empresario_empresacuentabancariaRoutes from "#src/routes/empresario/empresacuentabancaria.prisma.routes.js";
import empresario_facturaRoutes from "#src/routes/empresario/factura.prisma.routes.js";
import empresario_servicio_factoring_contactoRoutes from "#src/routes/empresario/servicio/factoring/contacto.prisma.routes.js";
import empresario_servicio_factoring_empresacuentabancariaRoutes from "#src/routes/empresario/servicio/factoring/empresacuentabancaria.prisma.routes.js";
import empresario_servicio_factoring_factoringRoutes from "#src/routes/empresario/servicio/factoring/factoring.prisma.routes.js";
import empresario_servicio_factoring_facturaRoutes from "#src/routes/empresario/servicio/factoring/factura.prisma.routes.js";
import empresario_servicio_factoring_usuarioRoutes from "#src/routes/empresario/servicio/factoring/usuario.prisma.routes.js";

const router = Router();

router.use(empresario_usuarioservicioempresaRoutes);
router.use(empresario_empresacuentabancariaRoutes);
router.use(empresario_contactoRoutes);
router.use(empresario_facturaRoutes);
router.use(empresario_servicio_factoring_facturaRoutes);
router.use(empresario_servicio_factoring_empresacuentabancariaRoutes);
router.use(empresario_servicio_factoring_usuarioRoutes);
router.use(empresario_servicio_factoring_factoringRoutes);
router.use(empresario_servicio_factoring_contactoRoutes);

export default router;
