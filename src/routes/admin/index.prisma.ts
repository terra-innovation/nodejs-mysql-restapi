import { Router } from "express";

import admin_archivoRoutes from "#src/routes/admin/archivo.prisma.routes.js";
import admin_archivofacturaRoutes from "#src/routes/admin/archivofactura.prisma.routes.js";
import admin_cuentabancariaestadoRoutes from "#src/routes/admin/cuentabancariaestado.prisma.routes.js";
import admin_empresaRoutes from "#src/routes/admin/empresa.prisma.routes.js";
import admin_empresacuentabancariaRoutes from "#src/routes/admin/empresacuentabancaria.prisma.routes.js";
import admin_factorigempresaverificacionRoutes from "#src/routes/admin/factoringempresaverificacion.prisma.routes.js";
import admin_facturaRoutes from "#src/routes/admin/factura.prisma.routes.js";
import admin_inversionistacuentabancariaRoutes from "#src/routes/admin/inversionistacuentabancaria.prisma.routes.js";
import admin_personaRoutes from "#src/routes/admin/persona.prisma.routes.js";
import admin_personaverificacionRoutes from "#src/routes/admin/personaverificacion.prisma.routes.js";
import admin_servicio_factoring_factoringRoutes from "#src/routes/admin/servicio/factoring/factoring.prisma.routes.js";
import admin_servicio_factoring_factoringhistorialestadoRoutes from "#src/routes/admin/servicio/factoring/factoringhistorialestado.prisma.routes.js";
import admin_servicio_factoring_factoringpropuestaRoutes from "#src/routes/admin/servicio/factoring/factoringpropuesta.prisma.routes.js";
import admin_zlaboratorioRoutes from "#src/routes/admin/zlaboratorio.prisma.routes.js";

import admin_administracionRoutes from "#root/src/routes/admin/administracion.prisma.routes.js";

const router = Router();

router.use(admin_administracionRoutes);
router.use(admin_zlaboratorioRoutes);
router.use(admin_empresacuentabancariaRoutes);
router.use(admin_inversionistacuentabancariaRoutes);
router.use(admin_cuentabancariaestadoRoutes);
router.use(admin_empresaRoutes);
router.use(admin_facturaRoutes);
router.use(admin_archivofacturaRoutes);
router.use(admin_personaRoutes);
router.use(admin_archivoRoutes);
router.use(admin_personaverificacionRoutes);
router.use(admin_factorigempresaverificacionRoutes);
router.use(admin_servicio_factoring_factoringRoutes);
router.use(admin_servicio_factoring_factoringpropuestaRoutes);
router.use(admin_servicio_factoring_factoringhistorialestadoRoutes);

export default router;
