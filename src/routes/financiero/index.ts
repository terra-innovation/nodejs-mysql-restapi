import { Router } from "express";

import sbs_tipo_cambioRoutes from "#root/src/routes/financiero/sbs/sbstipocambio.routes.js";
import sunat_tipo_cambioRoutes from "#root/src/routes/financiero/sunat/sunattipocambio.routes.js";

const router = Router();

router.use(sbs_tipo_cambioRoutes);
router.use(sunat_tipo_cambioRoutes);

export default router;
