import { Router } from "express";

import inversionista_factoring_factoringRoutes from "#src/routes/inversionista/factoring/factoring.prisma.routes.js";
import inversionista_inversionistacuentabancariaRoutes from "#src/routes/inversionista/inversionistacuentabancaria.prisma.routes.js";

const router = Router();

router.use(inversionista_inversionistacuentabancariaRoutes);
router.use(inversionista_factoring_factoringRoutes);

export default router;
