import { Router } from "express";

import financiero_facturaRoutes from "#root/src/routes/financiero/factura.routes.js";
import financiero_sbs_tipo_cambioRoutes from "#root/src/routes/financiero/sbs/sbstipocambio.routes.js";
import financiero_servicio_factoring_factoringRoutes from "#root/src/routes/financiero/servicio/factoring/factoring.routes.js";
import financiero_servicio_factoring_factoringfacturafactorRoutes from "#root/src/routes/financiero/servicio/factoring/factoringfacturafactor.routes.js";
import financiero_servicio_factoring_factoringhistorialestadoRoutes from "#root/src/routes/financiero/servicio/factoring/factoringhistorialestado.routes.js";
import financiero_servicio_factoring_factoringliquidacionRoutes from "#root/src/routes/financiero/servicio/factoring/factoringliquidacion.routes.js";
import financiero_servicio_factoring_factoringpropuestaRoutes from "#root/src/routes/financiero/servicio/factoring/factoringpropuesta.routes.js";
import financiero_servicio_factoring_factoringpropuestahistorialestadoRoutes from "#root/src/routes/financiero/servicio/factoring/factoringpropuestahistorialestado.routes.js";
import financiero_servicio_factoring_factoringtransferenciacedenteRoutes from "#root/src/routes/financiero/servicio/factoring/factoringtransferenciacedente.routes.js";
import financiero_sunat_tipo_cambioRoutes from "#root/src/routes/financiero/sunat/sunattipocambio.routes.js";

const router = Router();

router.use(financiero_sbs_tipo_cambioRoutes);
router.use(financiero_sunat_tipo_cambioRoutes);
router.use(financiero_facturaRoutes);
router.use(financiero_servicio_factoring_factoringRoutes);
router.use(financiero_servicio_factoring_factoringfacturafactorRoutes);
router.use(financiero_servicio_factoring_factoringhistorialestadoRoutes);
router.use(financiero_servicio_factoring_factoringliquidacionRoutes);
router.use(financiero_servicio_factoring_factoringpropuestaRoutes);
router.use(financiero_servicio_factoring_factoringpropuestahistorialestadoRoutes);
router.use(financiero_servicio_factoring_factoringtransferenciacedenteRoutes);

export default router;
