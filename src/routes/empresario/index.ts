import { Router } from "express";

import empresario_contactoRoutes from "#src/routes/empresario/contacto.routes.js";
import empresario_empresacuentabancariaRoutes from "#src/routes/empresario/empresacuentabancaria.routes.js";
import empresario_factoring_contactoRoutes from "#src/routes/empresario/factoring/contacto.routes.js";
import empresario_factoring_empresacuentabancariaRoutes from "#src/routes/empresario/factoring/empresacuentabancaria.routes.js";
import empresario_factoring_factoringRoutes from "#src/routes/empresario/factoring/factoring.routes.js";
import empresario_factoring_facturaRoutes from "#src/routes/empresario/factoring/factura.routes.js";
import empresario_factoring_usuarioRoutes from "#src/routes/empresario/factoring/usuario.routes.js";

const router = Router();

router.use(empresario_empresacuentabancariaRoutes);
router.use(empresario_contactoRoutes);
router.use(empresario_factoring_facturaRoutes);
router.use(empresario_factoring_empresacuentabancariaRoutes);
router.use(empresario_factoring_usuarioRoutes);
router.use(empresario_factoring_factoringRoutes);
router.use(empresario_factoring_contactoRoutes);

export default router;
