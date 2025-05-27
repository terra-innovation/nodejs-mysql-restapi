import { Router } from "express";

import secureRoutes from "#src/routes/secure/secure.routes.js";

const router = Router();

router.use(secureRoutes);

export default router;
