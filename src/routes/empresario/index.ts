import { Router } from "express";

import empresario_contactoRoutes from "#root/src/routes/empresario/contacto.routes.js";
import empresario_empresacuentabancariaRoutes from "#root/src/routes/empresario/empresacuentabancaria.routes.js";
import empresario_factoringfacturafactorRoutes from "#root/src/routes/empresario/factoringfacturafactor.routes.js";
import empresario_factoringliquidacionRoutes from "#root/src/routes/empresario/factoringliquidacion.routes.js";
import empresario_factoringtransferenciacedenteRoutes from "#root/src/routes/empresario/factoringtransferenciacedente.routes.js";
import empresario_facturaRoutes from "#root/src/routes/empresario/factura.routes.js";
import empresario_servicio_factoring_contactoRoutes from "#root/src/routes/empresario/servicio/factoring/contacto.routes.js";
import empresario_servicio_factoring_empresacuentabancariaRoutes from "#root/src/routes/empresario/servicio/factoring/empresacuentabancaria.routes.js";
import empresario_servicio_factoring_factoringRoutes from "#root/src/routes/empresario/servicio/factoring/factoring.routes.js";
import empresario_servicio_factoring_factoringpropuestaRoutes from "#root/src/routes/empresario/servicio/factoring/factoringpropuesta.routes.js";
import empresario_servicio_factoring_facturaRoutes from "#root/src/routes/empresario/servicio/factoring/factura.routes.js";
import empresario_servicio_factoring_usuarioRoutes from "#root/src/routes/empresario/servicio/factoring/usuario.routes.js";
import empresario_usuarioservicioempresaRoutes from "#root/src/routes/empresario/usuarioservicioempresa.routes.js";

const router = Router();

router.use(empresario_usuarioservicioempresaRoutes);
router.use(empresario_empresacuentabancariaRoutes);
router.use(empresario_contactoRoutes);
router.use(empresario_facturaRoutes);
router.use(empresario_factoringliquidacionRoutes);
router.use(empresario_factoringtransferenciacedenteRoutes);
router.use(empresario_factoringfacturafactorRoutes);
router.use(empresario_servicio_factoring_facturaRoutes);
router.use(empresario_servicio_factoring_empresacuentabancariaRoutes);
router.use(empresario_servicio_factoring_usuarioRoutes);
router.use(empresario_servicio_factoring_factoringRoutes);
router.use(empresario_servicio_factoring_factoringpropuestaRoutes);
router.use(empresario_servicio_factoring_contactoRoutes);

export default router;
